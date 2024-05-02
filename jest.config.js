// Jest configuration

module.exports = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js'],
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['./tests/setup/jest.setup.js', './tests/setup/chrome.setup.js'],
  testEnvironment: 'jsdom',
  // you can uncomment this portion and adjust to cause Jest to fail for incomplete coverage
  // coverageThreshold: {
  //   global: {
  //     functions: 60,
  //     statements: 60,
  //   },
  // },
};
