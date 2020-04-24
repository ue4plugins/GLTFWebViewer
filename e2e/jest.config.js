module.exports = {
  preset: "jest-puppeteer",
  globalSetup: "jest-environment-puppeteer/setup",
  globalTeardown: "jest-environment-puppeteer/teardown",
  testMatch: ["**/e2e/?(*.)+(spec|test).[t]s"],
  testPathIgnorePatterns: ["<rootDir>/build/", "<rootDir>/node_modules/"],
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
};
