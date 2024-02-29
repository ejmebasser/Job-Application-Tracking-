// Jest configuration

module.exports = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js'],
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['./tests/setup/jest.setup.js', './tests/setup/chrome.setup.js'],
  testEnvironment: 'jsdom',
  coverageThreshold: {
    global: {
      functions: 60,
      statements: 60,
    },
  },
};
