module.exports = {
  collectCoverageFrom: [
    'src/**/*',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  mapCoverage: true,
  moduleDirectories: [
    'node_modules',
  ],
  moduleFileExtensions: [
    'js',
  ],
  testRegex: '\\.test\\.js$',
  testEnvironment: 'node',
  verbose: true,
};
