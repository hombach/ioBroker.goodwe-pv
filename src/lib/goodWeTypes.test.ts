import assert from "node:assert";

import { getBatteryModeText } from "./goodWeTypes";

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
