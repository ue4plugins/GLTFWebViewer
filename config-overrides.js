const { override } = require("customize-cra");
const { addReactRefresh } = require("customize-cra-react-refresh");
const DynamicCdnWebpackPlugin = require("dynamic-cdn-webpack-plugin");
const webpack = require("webpack");
const merge = require("webpack-merge");
const gltfFiles = require("./scripts/gltfFiles");

module.exports = override(config => {
  const refresh = addReactRefresh({ disableRefreshCheck: true })(config);
  return merge(refresh, {
    // externals: {
    //   playcanvas: "playcanvas",
    // },
    plugins: [
      new webpack.DefinePlugin({
        GLTF_MODELS: JSON.stringify(gltfFiles),
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      }),
      new DynamicCdnWebpackPlugin(),
    ],
  });
});
