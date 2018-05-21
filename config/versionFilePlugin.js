'use strict';

const WebpackVersionFilePlugin = require('webpack-version-file-plugin');
const execa = require('execa');
const path = require('path');

const env = process.env.NODE_ENV;
const gitHash = execa.sync('git', ['rev-parse', '--short', 'HEAD']).stdout;
const gitNumCommits = Number(execa.sync('git', ['rev-list', 'HEAD', '--count']).stdout);
const gitDirty = execa.sync('git', ['status', '-s', '-uall']).stdout.length > 0;
const branch = execa.sync(path.join(__dirname, '..', 'branch.sh')).stdout;

const webpackVersionFilePlugin = new WebpackVersionFilePlugin({
  packageFile: path.join(__dirname, '..', 'package.json'),
  template: path.join(__dirname, '..', 'src', 'version.ejs'),
  outputFile: path.join('src', 'version.js'),
  extras: {
    'env': env,
    'githash': gitHash,
    'gitNumCommits': gitNumCommits,
    'timestamp': Date.now(),
    'dirty': gitDirty,
    'branch': branch
  }
});

module.exports = webpackVersionFilePlugin;