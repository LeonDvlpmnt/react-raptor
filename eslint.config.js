const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier/flat");
const prettierPlugin = require("eslint-plugin-prettier");
const reactCompilerPlugin = require("eslint-plugin-react-compiler");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
      "react-compiler": reactCompilerPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "react-compiler/react-compiler": "error",
    },
  },
]);
