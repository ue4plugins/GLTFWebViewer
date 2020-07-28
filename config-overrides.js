const { override } = require("customize-cra");
const { addReactRefresh } = require("customize-cra-react-refresh");
const { GenerateSW } = require("workbox-webpack-plugin");
const DynamicCdnWebpackPlugin = require("dynamic-cdn-webpack-plugin");
const WriteJsonPlugin = require("write-json-webpack-plugin");
const webpack = require("webpack");
const merge = require("webpack-merge");
const gltfSources = require("./scripts/gltfSources");

module.exports = {
  jest: config => {
    config.testEnvironment = "jest-environment-jsdom-sixteen";
    config.testEnvironmentOptions = { resources: "usable" };
    return config;
  },
  webpack: override(config => {
    // Disable generating service worker
    config.plugins = config.plugins.filter(
      plugin => !(plugin instanceof GenerateSW),
    );

    const configWithRefresh = addReactRefresh({ disableRefreshCheck: true })(
      config,
    );

    return merge(configWithRefresh, {
      plugins: [
        new webpack.DefinePlugin({
          GLTF_FILES: JSON.stringify(gltfSources),
          "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        }),
        new DynamicCdnWebpackPlugin(),
        new WriteJsonPlugin({
          object: gltfSources,
          path: "assets",
          filename: "index.json",
          pretty: true,
        }),
      ],
    });
  }),
};
