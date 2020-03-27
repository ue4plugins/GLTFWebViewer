const { override } = require("customize-cra");
const { addReactRefresh } = require("customize-cra-react-refresh");
// const { alias } = require("react-app-rewire-alias");
const DynamicCdnWebpackPlugin = require("dynamic-cdn-webpack-plugin");
const webpack = require("webpack");
const merge = require("webpack-merge");
const gltfFiles = require("./scripts/gltfFiles");
const cubemapFiles = require("./scripts/cubemapFiles");

module.exports = {
  jest: config => {
    config.testEnvironment = "jest-environment-jsdom-sixteen";
    config.testEnvironmentOptions = { resources: "usable" };
    return config;
  },
  webpack: override(config => {
    const refresh = addReactRefresh({ disableRefreshCheck: true })(config);

    // alias({
    //   playcanvas: "../../playcanvas/engine",
    // })(config);

    return merge(refresh, {
      // externals: {
      //   playcanvas: "playcanvas",
      // },
      plugins: [
        new webpack.DefinePlugin({
          GLTF_FILES: JSON.stringify(gltfFiles),
          SKYBOX_CUBEMAPS: JSON.stringify(cubemapFiles),
          "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        }),
        new DynamicCdnWebpackPlugin(),
      ],
    });
  }),
};
