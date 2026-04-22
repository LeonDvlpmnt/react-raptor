/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts", "**/e2e/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          esModuleInterop: true,
          module: "commonjs",
          target: "ES2020",
          moduleResolution: "node",
          strict: true,
          skipLibCheck: true,
          isolatedModules: true,
          baseUrl: ".",
          paths: { "@/*": ["./*"] },
        },
      },
    ],
  },
};
