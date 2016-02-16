var webpack = require('webpack');
module.exports = {
  cache: true,
  entry: {
    app:  './src/index.jsx'
  },
  output: {
    path: 'public/javascripts',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {test: /\.js[x]?$/, loader: 'babel-loader'}
    ]
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin(
        '[name].js.map', null,
        "[absolute-resource-path]", "[absolute-resource-path]")
  ]
};
