// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import "jest";
import "jest-webgl-canvas-mock";

const orgWarn = console.warn;

const filterMessages = [
  "TextDecoder not supported - pc.Untar module will not work",
  'Unexpected key type: "2" (expected "1")',
  "Unexpected amount of curves per keyframe: 1337",
];

// eslint-disable-next-line
console.warn = (...args: any[]) => {
  if (filterMessages.includes(args[0])) {
    return;
  }
  orgWarn(...args);
};
