const fs = require("fs");

module.exports = function(filename) {
  let content = fs.readFileSync(filename, "utf8");
  content = content.replace(/%5C/g, "/");
  fs.writeFileSync(filename, content);
};
