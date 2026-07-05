import assert from "node:assert";

describe("module to test => function to test", () => {
	const expected = 5;

	it(`should return ${expected}`, () => {
		const result = 5;
		assert.strictEqual(result, expected);
	});
});
