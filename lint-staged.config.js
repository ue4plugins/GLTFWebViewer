module.exports = {
  "**/*.{md,html,yaml}": ["prettier --write"],
  "**/*.{ts?(x),js?(x),json}": ["prettier --write", "eslint"],
};
