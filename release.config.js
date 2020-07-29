const breakingKeywords = ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"];

module.exports = {
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        parserOpts: {
          noteKeywords: breakingKeywords,
        },
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        parserOpts: {
          noteKeywords: breakingKeywords,
        },
        host: "http://animechgitlab",
        preset: "conventionalcommits",
        presetConfig: {
          types: [
            { type: "feat", section: "Features" },
            { type: "fix", section: "Bug Fixes" },
            { type: "chore", hidden: true },
            { type: "docs", hidden: true },
            { type: "style", hidden: true },
            { type: "refactor", hidden: true },
            { type: "perf", hidden: true },
            { type: "test", hidden: true },
            { type: "revert", hidden: true },
            { type: "build", hidden: true },
            { type: "ci", hidden: true },
            { type: "wip", hidden: true },
          ],
        },
      },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json", "package-lock.json"],
      },
    ],
    [
      "@semantic-release/gitlab",
      {
        gitlabUrl: "http://animechgitlab",
        assets: ["./release.zip"],
      },
    ],
  ],
};
