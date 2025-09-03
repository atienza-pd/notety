module.exports = {
  preset: "jest-preset-angular",
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  roots: ["<rootDir>"],
  testMatch: ["**/*.spec.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "\\.html$"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/dist/"],
  transform: {
    "^.+\\.ts$": "ts-jest", // Only transform .ts files
  },
  transformIgnorePatterns: [
    "/node_modules/(?!flat)/", // Exclude modules except 'flat' from transformation
  ],
};
