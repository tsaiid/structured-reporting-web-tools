#global module:false

"use strict"

module.exports = (grunt) ->
  grunt.loadNpmTasks "grunt-bower-task"
  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-sync"

  opts = {
    base_path: '_site/structure-report',
    js_path: '_site/structure-report/vendor/js/',
    css_path: '_site/structure-report/vendor/css/',
    font_path: '_site/structure-report/vendor/fonts/',
    image_path: '_site/structure-report/vendor/images/',
  }

  grunt.initConfig
    opts: opts,
    sync: {
      main: {
        files: [
          { src: ['assets/**', 'djd-l.html'], dest: '<%= opts.base_path %>'},
          { cwd: 'bower_components/jquery/dist/', src: ['jquery.min.js', 'jquery.min.map'], dest: '<%= opts.js_path %>' },
          { cwd: 'bower_components/bootstrap/dist/css/', src: 'bootstrap.min.css', dest: '<%= opts.css_path %>' },
          { cwd: 'bower_components/bootstrap/dist/js/', src: 'bootstrap.min.js', dest: '<%= opts.js_path %>' },
          { cwd: 'bower_components/clipboard/dist/', src: 'clipboard.min.js', dest: '<%= opts.js_path %>' },
        ],
        verbose: true,
        pretend: false, # Don't do any disk operations - just write log
        ignoreInDest: "**/.git/**", # Never remove js files from destination
        updateAndDelete: true # Remove all files from dest that are not found in src
      }
    }

    watch:
      options:
        livereload: true
      source:
        files: [
          "assets/**/*"
          "*.html"
        ]
        tasks: [
          "sync"
        ]

    connect:
      server:
        options:
          port: 4000
          base: '<%= opts.base_path %>'
          livereload: true

  grunt.registerTask "build", [
    "sync"
  ]

  grunt.registerTask "serve", [
    "build"
    "connect:server"
    "watch"
  ]

  grunt.registerTask "default", [
    "serve"
  ]