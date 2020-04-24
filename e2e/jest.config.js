module.exports = {
  preset: "jest-puppeteer",
  globalSetup: "jest-environment-puppeteer/setup",
  globalTeardown: "jest-environment-puppeteer/teardown",
  testMatch: ["**/e2e/?(*.)+(spec|test).[t]s"],
  testPathIgnorePatterns: ["<rootDir>/build/", "<rootDir>/node_modules/"],
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  // TODO: Add reporter for persistent snapshot storage, see example:
  // https://github.com/americanexpress/jest-image-snapshot#upload-diff-images-from-failed-tests
  // reporters: ["default", "<rootDir>/image-reporter.js"],
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
};
