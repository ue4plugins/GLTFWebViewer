const path = require("path");
const { override } = require("customize-cra");
const { addReactRefresh } = require("customize-cra-react-refresh");
const { GenerateSW } = require("workbox-webpack-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const DynamicCdnWebpackPlugin = require("dynamic-cdn-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const WriteJsonPlugin = require("write-json-webpack-plugin");
const webpack = require("webpack");
const merge = require("webpack-merge");
const createConfig = require("./scripts/createConfig");

const buildSubDir = "viewer";

module.exports = {
  jest: config => {
    config.testEnvironment = "jest-environment-jsdom-sixteen";
    config.testEnvironmentOptions = { resources: "usable" };
    return config;
  },
  webpack: override(config => {
    config = addReactRefresh({ disableRefreshCheck: true })(config);

    // Disable some default plugins
    config.plugins = config.plugins.filter(
      plugin =>
        ![GenerateSW, ManifestPlugin].some(
          disabledPlugin => plugin instanceof disabledPlugin,
        ),
    );

    // Place static assets in sub dir
    config.module.rules
      .find(rule => rule.oneOf)
      .oneOf.filter(
        rule =>
          rule.options &&
          rule.options.name &&
          rule.options.name.includes("static"),
      )
      .forEach(
        loader =>
          (loader.options.name = path.join(buildSubDir, loader.options.name)),
      );

    // Don't extract license comments
    config.optimization.minimizer = [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ];

    return merge(config, {
      plugins: [
        new webpack.DefinePlugin({
          "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        }),
        new DynamicCdnWebpackPlugin(),
        new WriteJsonPlugin({
          object: createConfig(true),
          path: "",
          filename: "index.json",
          pretty: true,
        }),
        new WriteJsonPlugin({
          object: createConfig(false),
          path: "",
          filename: "index-release.json",
          pretty: true,
        }),
      ],
      output: {
        // Place js output in sub dir
        filename: path.join(buildSubDir, config.output.filename),
        chunkFilename: path.join(buildSubDir, config.output.chunkFilename),
      },
    });
  }),
};
