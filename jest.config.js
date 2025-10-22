export const testEnvironment = "jsdom";
export const setupFilesAfterEnv = ["<rootDir>/jest.setup.js"];
export const moduleNameMapper = {
    "\\.(css|sass|scss)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/$1"
};
export const testPathIgnorePatterns = ["/node_modules/", "/.next/", "/e2e/"];
export const transform = {
    "^.+\\.(ts|tsx|js|jsx)$": "babel-jest"
};
