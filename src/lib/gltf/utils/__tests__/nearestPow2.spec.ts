import "jest";
import { nearestPow2 } from "../nearestPow2";

describe("nearestPow2", () => {
  it("should find nearest power of 2", () => {
    expect(nearestPow2(3)).toBe(4);
    expect(nearestPow2(5)).toBe(4);
    expect(nearestPow2(7)).toBe(8);
    expect(nearestPow2(30)).toBe(32);
    expect(nearestPow2(49)).toBe(64);
  });
});
