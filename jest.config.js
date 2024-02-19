/** @type {import('jest').Config} */
const config = {
  transform: {
    "^.+\\.tsx?$": "esbuild-jest",
  },
  testPathIgnorePatterns: ["<rootDir>/lib/"], // 必要なら
};

module.exports = config;
