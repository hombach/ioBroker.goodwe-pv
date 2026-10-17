import type * as utils from "@iobroker/adapter-core";
import assert from "node:assert";

import { GoodWeUdp } from "./goodWeUdp";

type ByteReader = { getUintFromByteArray(data: Buffer, start: number, length: number): number };

describe("goodWeUdp => getUintFromByteArray", () => {
	const udp = new GoodWeUdp({} as utils.AdapterInstance);
	const reader = udp as unknown as ByteReader;

	after(() => udp.destructor());

	it("should decode 4-byte values with bit 31 set as unsigned", () => {
		assert.strictEqual(reader.getUintFromByteArray(Buffer.from([0xff, 0xff, 0xff, 0xff]), 0, 4), 4294967295);
		assert.strictEqual(reader.getUintFromByteArray(Buffer.from([0x80, 0x00, 0x00, 0x00]), 0, 4), 2147483648);
	});

	it("should decode smaller values unchanged", () => {
		assert.strictEqual(reader.getUintFromByteArray(Buffer.from([0x02, 0x18, 0x01, 0x20]), 0, 4), 35127584);
		assert.strictEqual(reader.getUintFromByteArray(Buffer.from([0xff, 0xf6]), 0, 2), 65526);
		assert.strictEqual(reader.getUintFromByteArray(Buffer.from([0x00, 0x00, 0x12, 0x34]), 2, 2), 0x1234);
		assert.strictEqual(reader.getUintFromByteArray(Buffer.from([0xab]), 0, 1), 0xab);
	});
});
