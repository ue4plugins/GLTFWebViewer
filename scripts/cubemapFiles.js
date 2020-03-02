const path = require("path");
const glob = require("glob");

const cubemapFiles = glob.sync("./public/assets/cubemaps/**/*.dds").map(fp => {
  return {
    path: path.dirname(path.relative("./public/", fp)).replace(/\\/gi, "/"),
    name: path.basename(fp, ".dds"),
  };
});

module.exports = cubemapFiles;
