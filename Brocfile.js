var compileModules = require('broccoli-es6-module-transpiler');

var transpiledLib = compileModules('lib', {
  formatter: 'bundle',
  output   : 'ks.js'
});

module.exports = transpiledLib;

