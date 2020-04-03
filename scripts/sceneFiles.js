const path = require("path");
const glob = require("glob");

const sceneFiles = glob
  .sync("./public/assets/playcanvas/*.json")
  .filter(fp => !fp.endsWith("config.json"))
  .map(fp => ({
    name: path.basename(fp, ".json"),
    path: path.basename(fp),
  }));

module.exports = sceneFiles;
