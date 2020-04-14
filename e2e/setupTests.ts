import "jest";
import "expect-puppeteer";
import { toMatchImageSnapshot } from "jest-image-snapshot";

expect.extend({ toMatchImageSnapshot });
jest.setTimeout(600000);
