module.exports = {
  preset: "jest-puppeteer",
  globalSetup: "jest-environment-puppeteer/setup",
  globalTeardown: "jest-environment-puppeteer/teardown",
  testMatch: ["**/e2e/?(*.)+(spec|test).[t]s"],
  testPathIgnorePatterns: ["/node_modules/", "build"],
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
};
