const path = require('path');

module.exports = {
  entry: './src/popup.js',
  mode: 'none',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname),
  },
};
