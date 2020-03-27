const path = require("path");
const glob = require("glob");

const sceneFiles = glob
  .sync("./public/*.json")
  .filter(fp => !fp.endsWith("config.json") && !fp.endsWith("manifest.json"))
  .map(fp => {
    return {
      name: path.basename(fp, ".json"),
      path: path.basename(fp),
    };
  });

module.exports = sceneFiles;
