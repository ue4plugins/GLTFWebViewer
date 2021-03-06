// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import "jest";
import "jest-webgl-canvas-mock";

// Patch jest-webgl-canvas-mock with canvas prop
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WebGLRenderingContext = (window as any).WebGLRenderingContext;
Object.defineProperties(WebGLRenderingContext.prototype, {
  canvas: {
    get: function() {
      return this._canvas;
    },
  },
});

const orgWarn = console.warn;
const orgLog = console.log;

const shouldSuppressMessage = (msg: string) =>
  [
    "TextDecoder not supported - pc.Untar module will not work",
    "No support for 3D audio found",
    /Powered by PlayCanvas/,
  ].some(m => msg.match(new RegExp(m)));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.warn = (...args: any[]) => {
  if (typeof args[0] !== "string" || !shouldSuppressMessage(args[0])) {
    orgWarn(...args);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.log = (...args: any[]) => {
  if (typeof args[0] !== "string" || !shouldSuppressMessage(args[0])) {
    orgLog(...args);
  }
};
