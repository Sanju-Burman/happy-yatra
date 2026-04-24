module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    globalSetup: './tests/globalSetup.js',
    testTimeout: 30000,
    verbose: true,
    forceExit: true,
    detectOpenHandles: true,
};
