const path = require("path");
const glob = require("glob");

const cubemapFiles = glob.sync("./public/assets/cubemaps/**/*.dds").map(fp => {
  const name = path.basename(fp, ".dds");
  return {
    name,
    path: path.dirname(path.relative("./public/", fp)).replace(/\\/gi, "/"),
    prefiltered: `${name}.dds`,
    faces: ["posx", "negx", "posy", "negy", "posz", "negz"].map(
      face => `${name}_${face}.png`,
    ),
  };
});

module.exports = cubemapFiles;
