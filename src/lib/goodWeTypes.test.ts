import assert from "node:assert";

import { getBatteryModeText, getWorkModeText } from "./goodWeTypes";

describe("goodWeTypes => getBatteryModeText", () => {
	it("should map known battery modes", () => {
		assert.strictEqual(getBatteryModeText(0), "No battery");
		assert.strictEqual(getBatteryModeText(3), "Charge");
		assert.strictEqual(getBatteryModeText(5), "To be discharged");
	});

	it("should return the number as string for unknown modes", () => {
		assert.strictEqual(getBatteryModeText(7), "7");
	});
});

describe("goodWeTypes => getWorkModeText", () => {
	it("should map known work modes (WORK_MODES_ET)", () => {
		assert.strictEqual(getWorkModeText(0), "Wait Mode");
		assert.strictEqual(getWorkModeText(1), "Normal (On-Grid)");
		assert.strictEqual(getWorkModeText(2), "Normal (Off-Grid)");
		assert.strictEqual(getWorkModeText(3), "Fault Mode");
		assert.strictEqual(getWorkModeText(4), "Flash Mode");
		assert.strictEqual(getWorkModeText(5), "Check Mode");
	});

	it("should return the number as string for unknown modes", () => {
		assert.strictEqual(getWorkModeText(6), "6");
	});
});
