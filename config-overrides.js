const path = require("path");
const { override } = require("customize-cra");
const { addReactRefresh } = require("customize-cra-react-refresh");
const { GenerateSW } = require("workbox-webpack-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const DynamicCdnWebpackPlugin = require("dynamic-cdn-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const WriteJsonPlugin = require("write-json-webpack-plugin");
const { LicenseWebpackPlugin } = require("license-webpack-plugin");
const EventHooksPlugin = require("event-hooks-webpack-plugin");
const webpack = require("webpack");
const merge = require("webpack-merge");
const createConfig = require("./scripts/createConfig");
const renderLicenses = require("./scripts/renderLicenses");
const downloadLicenses = require("./scripts/downloadLicenses");
const fixUrlPathEncoding = require("./scripts/fixUrlPathEncoding");

const buildSubDir = "viewer";

// Download license files for modules that haven't included them in their npm package
downloadLicenses([
  {
    module: "draco3d",
    url:
      "https://raw.githubusercontent.com/google/draco/8a979f79a5f139880f17f296ace90bcfff025c4b/LICENSE",
  },
  {
    module: "file-selector",
    url:
      "https://raw.githubusercontent.com/react-dropzone/file-selector/d2b44e213c0ca5cedbe01b1aabc06814e4bb91dc/LICENSE",
  },
  {
    module: "isarray",
    url:
      "https://raw.githubusercontent.com/juliangruber/isarray/29a4977d09cfab83886cbb97d1710a01d0358e52/LICENSE",
  },
  {
    module: "is-in-browser",
    url:
      "https://raw.githubusercontent.com/tuxsudo/is-in-browser/56378377a3767c5822313a6aac846e9b10abb6ed/LICENSE",
  },
  {
    module: "popper.js",
    url:
      "https://raw.githubusercontent.com/popperjs/popper-core/70edad694ed244851a515ca2cfd8397c4ddb867f/LICENSE.md",
  },
]);

module.exports = {
  jest: config => {
    config.testEnvironment = "jest-environment-jsdom-sixteen";
    config.testEnvironmentOptions = { resources: "usable" };
    return config;
  },
  webpack: override(config => {
    config = addReactRefresh({ disableRefreshCheck: true })(config);

    /*
    config.plugins = config.plugins.filter(
      plugin => plugin.name != "InlineChunkHtmlPlugin",
    );*/
    //config.plugins.splice(1, 1);

    /*
    config.plugins.forEach((plugin, index) =>
      console.log(
        index,
        typeof plugin,
        plugin.constructor.name,
      ),
    );
    */
    //console.log("config.plugins", config.plugins);

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

    // Don't extract license comments (will use separate license plugin)
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
        new EventHooksPlugin({
          done: () =>
            fixUrlPathEncoding(path.join(config.output.path, "index.html")),
        }),
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
        new LicenseWebpackPlugin({
          outputFilename: "viewer/static/js/licenses.txt",
          additionalModules: Object.keys(
            require("./package.json").dependencies,
          ).map(dependency => {
            return {
              name: dependency,
              directory: path.join(__dirname, "node_modules", dependency),
            };
          }),
          renderLicenses: renderLicenses,
          perChunkOutput: false,
          stats: {
            warnings: true,
            errors: true,
          },
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
