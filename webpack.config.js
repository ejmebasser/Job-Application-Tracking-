const path = require('path');

module.exports = {
  entry: {
    background: './src/background.js',
    popup: './src/main.js',
    inject: './src/inject.js',
  },
  mode: 'none',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  // uncomment below to reduce size of output
  // optimization: {
  //   minimize: true,
  // },
};
