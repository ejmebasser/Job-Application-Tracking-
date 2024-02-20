const path = require('path');

module.exports = {
  entry: {
    background: './src/background.js',
    popup: './src/popup/main.js',
    inject: './src/inject.js',
  },
  mode: 'none',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
