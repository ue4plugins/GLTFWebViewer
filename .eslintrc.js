const deepmerge = require("deepmerge");

const all = {
  plugins: ["prettier", "autofix"],
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  rules: {
    "prettier/prettier": "error",
    "autofix/no-debugger": "error",
    // "autofix/no-console": "error",
    "autofix/no-plusplus": "error",
    "autofix/yoda": "warn",
    "autofix/unicode-bom": ["error", "never"],
    "autofix/eqeqeq": "error",
    "autofix/no-alert": "error",
    "autofix/no-confusing-arrow": "error",
    "autofix/no-throw-literal": "error",
    "autofix/curly": "error",
    "no-lone-blocks": "warn",
  },
};

const js = {
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    // project: "./tsconfig.json"
  },
};

const ts = {
  plugins: ["import", "@typescript-eslint"],
  extends: [
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    // project: "./tsconfig.json"
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      // use <root>/tsconfig.json
      typescript: {
        // always try to resolve types under `<root/>@types`
        // directory even it doesn't contain any source code,
        // like `@types/unist`
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "import/default": "off",
    "import/first": "error",
    "import/exports-last": "warn",
    "import/no-duplicates": "error",
    "import/no-self-import": "error",
    "import/extensions": "warn",
    "import/no-unused-modules": "warn",
    "import/no-useless-path-segments": "warn",
    "import/no-default-export": "warn",
    "import/no-unresolved": "error",
    "import/unambiguous": "off",
    "import/no-amd": "error",
    "import/no-commonjs": "error",
    "import/order": [
      "error",
      {
        "newlines-between": "never",
        // alphabetize: {
        //   order: "asc",
        //   caseInsensitive: true,
        // },
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "unknown",
        ],
      },
    ],
  },
};

const react = {
  plugins: ["react", "react-hooks"],
  extends: ["plugin:react/recommended"],
  rules: {
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};

const jest = {
  plugins: ["jest"],
  rules: {
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/valid-expect": "error",
  },
};

const json = {
  extends: ["plugin:json/recommended"],
};

const getConfig = filePath => {
  const isJs = filePath.endsWith(".js");
  const isJson = filePath.endsWith(".json");
  const isTs = filePath.endsWith(".ts") || filePath.endsWith(".tsx");
  const isReact = filePath.endsWith(".jsx") || filePath.endsWith(".tsx");
  const isJest = filePath.includes(".test.") || filePath.includes(".spec.");

  const getCombinedArr = key =>
    deepmerge.all([
      all[key] || [],
      isJs ? js[key] || [] : [],
      isJson ? json[key] || [] : [],
      isReact ? react[key] || [] : [],
      isTs ? ts[key] || [] : [],
      isJest ? jest[key] || [] : [],
    ]);

  const getCombinedObj = key =>
    deepmerge.all([
      all[key] || {},
      isJs ? js[key] || {} : {},
      isJson ? json[key] || {} : {},
      isReact ? react[key] || {} : {},
      isTs ? ts[key] || {} : {},
      isJest ? jest[key] || {} : {},
    ]);

  const env = {
    es6: true,
    browser: filePath.includes("src"),
    node: !filePath.includes("src"),
    jest: isJest,
  };

  return {
    files: [filePath],
    env,
    plugins: getCombinedArr("plugins"),
    extends: getCombinedArr("extends"),
    settings: getCombinedObj("settings"),
    parserOptions: {
      ...getCombinedObj("parserOptions"),
      ecmaFeatures: { jsx: isReact, modules: true },
    },
    rules: getCombinedObj("rules"),
  };
};

const filePaths = [
  "src/**/*.ts",
  "src/**/*.tsx",
  "src/**/*.js",
  "src/**/*.{test,spec}.ts",
  "src/**/*.{test,spec}.tsx",
  "**/*.js",
  "**/*.ts",
  "**/*.json",
];

const config = {
  root: true,
  overrides: filePaths.map(fp => getConfig(fp)),
};

console.log(JSON.stringify(config, null, 2));

module.exports = config;
