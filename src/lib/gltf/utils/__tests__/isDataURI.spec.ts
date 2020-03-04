import "jest";
import { isDataURI } from "../isDataURI";

const testURI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

describe("isDataURI", () => {
  it("should return true for a data uri", () => {
    expect(isDataURI(testURI)).toBe(true);
  });

  it("should return false for a non-data uri", () => {
    expect(isDataURI("https://www.foo.bar")).toBe(false);
  });
});
