module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/seed/**/*.test.ts'],
  testTimeout: 120000,
  globalSetup: '<rootDir>/tests/helpers/global-setup-seed.ts',
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }] },
};
