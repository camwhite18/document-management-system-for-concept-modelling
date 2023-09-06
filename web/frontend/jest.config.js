module.exports = {
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
    "node-fetch": "<rootDir>/node_modules/jest-transform-stub",
  },
  setupFilesAfterEnv: [
    "<rootDir>/test-config/testSetup.ts"
  ],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/src/__tests__/__mocks__/fileMock.js",
    "\\.(less|scss)$": "<rootDir>/src/__tests__/__mocks__/styleMock.js",
    "\\.module\\.css$": "identity-obj-proxy",
    "^src/(.*)": "<rootDir>/src/$1"
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  testMatch: [
    "<rootDir>/src/**/*.test.tsx",
    "<rootDir>/src/**/*.test.ts"
  ],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
};
