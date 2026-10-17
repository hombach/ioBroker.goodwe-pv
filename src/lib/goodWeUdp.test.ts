import type * as utils from "@iobroker/adapter-core";
import assert from "node:assert";

import { GoodWeUdp } from "./goodWeUdp";

type ByteReader = { getIntFromByteArray(data: Buffer, start: number, length: number): number };

describe("goodWeUdp => getIntFromByteArray", () => {
	const udp = new GoodWeUdp({} as utils.AdapterInstance);
	const reader = udp as unknown as ByteReader;

	after(() => udp.destructor());

	it("should decode 0xFFF6 as -10 (PackTemperature -1.0 °C)", () => {
		const value = reader.getIntFromByteArray(Buffer.from([0xff, 0xf6]), 0, 2);
		assert.strictEqual(value, -10);
		assert.strictEqual(value / 10, -1);
	});

	it("should decode positive values unchanged", () => {
		assert.strictEqual(reader.getIntFromByteArray(Buffer.from([0x00, 0xfa]), 0, 2), 250);
		assert.strictEqual(reader.getIntFromByteArray(Buffer.from([0x7f, 0xff]), 0, 2), 32767);
		assert.strictEqual(reader.getIntFromByteArray(Buffer.from([0x80, 0x00]), 0, 2), -32768);
	});
});
