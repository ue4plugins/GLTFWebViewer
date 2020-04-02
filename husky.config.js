module.exports = {
  hooks: {
    "pre-commit": "lint-staged",
    // "pre-push": "npx tsc -p tsconfig.json --noEmit && npm run test",
    // "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
  },
};
