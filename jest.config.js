export default {
  clearMocks: true,
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  testEnvironment: 'jsdom'
};
