import "jest";
import "expect-puppeteer";
import { configureToMatchImageSnapshot } from "jest-image-snapshot";

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  failureThreshold: 0.1,
  failureThresholdType: "percent",
});

expect.extend({ toMatchImageSnapshot });
jest.setTimeout(600000);
