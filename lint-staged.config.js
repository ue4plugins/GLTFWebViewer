module.exports = {
  "public/*.html": ["prettier --write"],
  "src/**/*.{ts?(x),js?(x),json}": ["prettier --write", "eslint"],
  "scripts/**/*.{ts?(x),js?(x),json}": ["prettier --write", "eslint"],
  "e2e/**/*.{ts?(x),js?(x),json}": ["prettier --write", "eslint"],
};
