import assert from "node:assert";

import { GoodWeBmsErrorBits, GoodWeBmsWarningBits, GoodWeDiagStatusBits } from "./goodWeTypes";
import { getActiveBits, isBitSet } from "./projectUtils";

describe("projectUtils => isBitSet", () => {
	it("should detect bit 0 and bit 31", () => {
		assert.strictEqual(isBitSet(1, 0), true);
		assert.strictEqual(isBitSet(0x80000000, 31), true);
		assert.strictEqual(isBitSet(-0x80000000, 31), true); // value decoded as signed int32
		assert.strictEqual(isBitSet(0x7fffffff, 31), false);
	});
});

describe("projectUtils => getActiveBits", () => {
	it("should decode DiagStatusL 35127584 to bits 5, 8, 19, 20, 25", () => {
		assert.deepStrictEqual(getActiveBits(35127584, GoodWeDiagStatusBits), [
			"ChargeTimeOn",
			"AppDischargeCurrentTooLow",
			"SelfUseOff",
			"SocDeltaTooVolatile",
			"PfValueSet",
		]);
	});

	it("should return an empty list for 0 and ignore unknown bits", () => {
		assert.deepStrictEqual(getActiveBits(0, GoodWeDiagStatusBits), []);
		assert.deepStrictEqual(getActiveBits(2 ** 29, GoodWeDiagStatusBits), []);
		assert.deepStrictEqual(getActiveBits(2 ** 30, GoodWeDiagStatusBits), ["BmsEmergencyCharging"]);
	});
});

describe("projectUtils => getActiveBits (BMS)", () => {
	it("should decode BMS error and warning bitmaps", () => {
		assert.deepStrictEqual(getActiveBits(0x8101, GoodWeBmsErrorBits), ["ChargingOverVoltage2", "BatteryBreak", "ChargingOverVoltage3"]);
		assert.deepStrictEqual(getActiveBits(0x0880, GoodWeBmsWarningBits), ["SystemReboot", "SystemTemperatureHigh"]);
		assert.deepStrictEqual(getActiveBits(0xf000, GoodWeBmsWarningBits), []);
	});
});
