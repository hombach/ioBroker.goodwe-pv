import type * as utils from "@iobroker/adapter-core";
import assert from "node:assert";

import { GoodWeUdp } from "./goodWeUdp";

type UdpInternals = {
	client: { send: () => void; emit: (event: string, data: Buffer) => boolean };
	calculateCrc16(data: Buffer, start: number, length: number): number;
};

/**
 * Builds a ReadRunningData response frame (AA 55 F7 03 <bytecount> data CRC) for registers 35100-35224.
 *
 * @param udp - GoodWeUdp instance (for the CRC helper)
 * @param registers - Register values to set (register number -> U16 value)
 */
function buildRunningDataFrame(udp: UdpInternals, registers: Record<number, number>): Buffer {
	const count = 0x7d;
	const frame = Buffer.alloc(5 + count * 2 + 2);
	frame.set([0xaa, 0x55, 0xf7, 0x03, count * 2]);
	for (const [register, value] of Object.entries(registers)) {
		frame.writeUInt16BE(value, 5 + (Number(register) - 35100) * 2);
	}
	const crc = udp.calculateCrc16(frame, 2, frame.length - 4);
	frame[frame.length - 2] = crc >> 8;
	frame[frame.length - 1] = crc & 0x00ff;
	return frame;
}

describe("goodWeUdp => ReadRunningData", () => {
	const udp = new GoodWeUdp({ log: { error: () => undefined } } as unknown as utils.AdapterInstance);
	const internals = udp as unknown as UdpInternals;

	after(() => udp.destructor());

	it("should read EnergyDayDischarge (35211) as 2 bytes, independent of BatteryStrings (35212)", () => {
		internals.client.send = () => undefined; // no network
		udp.ReadRunningData();
		internals.client.emit("message", buildRunningDataFrame(internals, { 35211: 123, 35212: 2 }));
		assert.strictEqual(udp.Status, true);
		assert.strictEqual(udp.RunningData.EnergyDayDischarge, 12.3);
		assert.strictEqual(udp.RunningData.BatteryStrings, 2);
	});
});
