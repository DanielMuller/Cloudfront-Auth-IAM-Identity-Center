/* eslint-disable */
'use strict';
const fs = require('fs');
const path = require('path');

const { DefinePlugin } = require('webpack');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const slsw = require('serverless-webpack');

if (slsw.lib.webpack.isLocal) {
  console.log('Running locally');
}

module.exports = {
  entry: slsw.lib.entries,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  optimization: {
    minimize: true,
    mangleExports: true,
  },
  externalsPresets: { node: true },
  externals: {
    'aws-sdk': 'aws-sdk',
  },
  target: 'node',
  devtool: false,
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  stats: {
    modules: false,
    warnings: false,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new DefinePlugin({
      GLOBAL_VAR_SERVICE_NAME: JSON.stringify(slsw.lib.serverless.service.service),
      GLOBAL_VAR_NODE_ENV: JSON.stringify(process.env.STAGE || 'local'),
      GLOBAL_VAR_REGION: JSON.stringify(slsw.lib.options.region || 'eu-central-1'),
      GLOBAL_VAR_STAGE: JSON.stringify(process.env.STAGE || 'local'),
      GLOBAL_VAR_IS_LOCAL: JSON.stringify(slsw.lib.webpack.isLocal),
      GLOBAL_VAR_IS_TEST: JSON.stringify(false),
    }),
  ],
};
