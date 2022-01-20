"use strict";

module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/tests/setupJest.ts"],
  globals: {
    "ts-jest": {
      diagnostics: false,
    },
  },
  collectCoverage: true,
};
