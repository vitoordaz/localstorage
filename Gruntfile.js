'use strict';
/* jshint strict: true, node: true */

var path = require('path');

function here() {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(__dirname);
  return path.join.apply(path.join, args);
}

module.exports = function(grunt) {
  var pkg = grunt.file.readJSON(here('package.json'));

  grunt.task.loadNpmTasks('grunt-contrib-jshint');
  grunt.task.loadNpmTasks('grunt-contrib-requirejs');
  grunt.task.loadNpmTasks('grunt-contrib-uglify');

  grunt.initConfig({
    pkg: pkg,
    jshint: {
      files: [
        'src/**/*.js',
        'Gruntfile.js'
      ],
      options: {
        strict: true,
        indent: 2,
        maxlen: 80
      }
    },
    requirejs: {
      compile: {
        options: {
          baseUrl: 'src/js',
          optimize: 'none',
          name: 'localstorage',
          out: 'dist/localstorage.js'
        }
      }
    },
    uglify: {
      options: {
        beautify: false
      },
      background: {
        src: here('dist', 'localstorage.js'),
        dest: here('dist', 'localstorage.min.js')
      }
    },
  });

  grunt.registerTask('default', [
    'jshint',
    'requirejs',
    'uglify'
  ]);
};