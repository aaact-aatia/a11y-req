// webpack.config.js
module.exports = {
  mode: 'development',
  entry: './public/a11y-req.js',
  output: {
    filename: 'main.js',
    publicPath: 'public/dist'
  }
};