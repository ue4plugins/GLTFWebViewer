import "jest";
import { isPowerOf2 } from "../isPowerOf2";

describe("isPowerOf2", () => {
  it("should return true for a number that is power of 2", () => {
    expect(isPowerOf2(2)).toBe(true);
    expect(isPowerOf2(4)).toBe(true);
    expect(isPowerOf2(8)).toBe(true);
    expect(isPowerOf2(16)).toBe(true);
    expect(isPowerOf2(32)).toBe(true);
  });

  it("should return false for a number that isn't power of 2", () => {
    expect(isPowerOf2(3)).toBe(false);
    expect(isPowerOf2(5)).toBe(false);
    expect(isPowerOf2(6)).toBe(false);
    expect(isPowerOf2(7)).toBe(false);
    expect(isPowerOf2(9)).toBe(false);
  });
});
