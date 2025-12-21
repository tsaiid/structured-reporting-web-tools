module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    '\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\.(gif|ttf|eot|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
};