/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    // Handle module aliases (this will work for imports that use the @ path alias)
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  // Add setup file if needed
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts']
};
