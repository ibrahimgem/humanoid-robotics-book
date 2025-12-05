module.exports = {
  presets: [require.resolve('@docusaurus/core/lib/babel/preset')],
  plugins: [
    '@babel/plugin-syntax-jsx',
    ['@babel/plugin-transform-modules-commonjs', {
      allowTopLevelThis: true
    }]
  ],
};