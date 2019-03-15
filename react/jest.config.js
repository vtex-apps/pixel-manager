module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '\\.(gql|graphql)$': 'jest-transform-graphql',
    '^.+\\.(js|jsx|mjs)$': '<rootDir>/node_modules/babel-jest',
  },
  snapshotSerializers: ['enzyme-to-json/serializer'],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$'],
  setupFiles: ['<rootDir>/setupTests.ts'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
}
