// This file is used to configure the Babel transpiler.
// The bable transpiler when running hte test it has to transpile the code. this allows jsut for testing.

module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  plugins: ['@babel/plugin-transform-modules-commonjs'],
};
