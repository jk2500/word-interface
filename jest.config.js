// Root Jest configuration

module.exports = {
  projects: [
    // Client config
    {
      displayName: 'client',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/client/src/**/*.test.{ts,tsx}'],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/client/__mocks__/styleMock.js',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
          '<rootDir>/client/__mocks__/fileMock.js'
      },
      setupFilesAfterEnv: ['<rootDir>/client/src/setupTests.ts']
    },
    // Server config
    {
      displayName: 'server',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/server/src/**/*.test.ts'],
      modulePathIgnorePatterns: ['/dist/']
    }
  ],
  collectCoverageFrom: [
    '<rootDir>/client/src/**/*.{ts,tsx}',
    '<rootDir>/server/src/**/*.ts',
    '!<rootDir>/**/node_modules/**',
    '!<rootDir>/**/dist/**',
    '!<rootDir>/**/coverage/**',
    '!<rootDir>/**/types/**',
    '!<rootDir>/**/*.d.ts'
  ],
  coverageDirectory: '<rootDir>/coverage'
};