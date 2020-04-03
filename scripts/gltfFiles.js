const path = require("path");
const glob = require("glob");

const typeRegex = new RegExp(`/glTF-([a-zA-Z0-9]+)/`);

const gltfFiles = glob.sync("./public/assets/gltf/**/*.{gltf,glb}").map(fp => {
  const typeMatch = typeRegex.exec(fp);
  return {
    type: ((typeMatch && typeMatch[1]) || "unpacked").toLowerCase(),
    path: path.relative("./public/", fp).replace(/\\/gi, "/"),
    name: path.basename(fp, path.extname(fp)),
  };
});

module.exports = gltfFiles;
