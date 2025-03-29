module.exports = {
  extends: ["expo", "prettier"],
  plugins: ["prettier", "eslint-plugin-react-compiler"],
  rules: {
    "prettier/prettier": "error",
    "react-compiler/react-compiler": "error",
  },
};