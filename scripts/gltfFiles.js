const path = require("path");
const glob = require("glob");

const typeRegex = new RegExp(`/glTF-([a-zA-Z0-9]+)/`);

const gltfFiles = glob
  .sync("./public/assets/models/**/{glTF,glTF-*}/*.gltf")
  .map(fp => {
    const typeMatch = typeRegex.exec(fp);
    // if (!typeMatch) {
    //   console.log("No match:", fp, typeMatch);
    // }
    const type = ((typeMatch && typeMatch[1]) || "normal").toLowerCase();
    return {
      type,
      path: path.dirname(path.relative("./public/", fp)).replace(/\\/gi, "/"),
      name: path.basename(fp, ".gltf"),
    };
  });

// console.log(gltfFiles);

module.exports = gltfFiles;
