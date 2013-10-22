module.exports = function(grunt) {
    // load all grunt tasks
    // requires load-grunt-tasks to be instealled (npm install load-grunt-tasks)
    require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ['dist'],

    //Not needed - handled by usemin and uglify
    //concat: {
    //  options: {
    //    separator: ';'
    //  },
    //  dist: {
    //    src: ['js/**/*.js'],
    //    dest: 'dist/<%= pkg.name %>.js'
    //  }
    //},

    //Config is auto setup by usemin
    //uglify: {
    //  options: {
    //    banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
    //  },
    //  dist: {
    //    files: {
    //      'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
    //    }
    //  }
    //},

    //qunit: {
    //  files: ['test/**/*.html']
    //},

    jshint: {
      files: ['Gruntfile.js', 'js/app.js', 'js/stats.js', 'test/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      //tasks: ['jshint', 'qunit']
      tasks: ['jshint']
    },

    useminPrepare: {
      options: {
        dest: 'dist'
      },
      html: ['index.html', 'stats.html']
    },

    usemin: {
      options: {
          dirs: ['dist']
      },
      html: ['dist/{,*/}*.html'],
      css: ['dist/css/{,*/}*.css']
    },

    cssmin: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      }

      // This task is pre-configured if you do not wish to use Usemin
      // blocks for your CSS. By default, the Usemin block from your
      // `index.html` will take care of minification, e.g.
      //
      //     <!-- build:css({.tmp,app}) styles/main.css -->
      //
      // dist: {
      //     files: {
      //         '<%= yeoman.dist %>/styles/main.css': [
      //             '.tmp/styles/{,*/}*.css',
      //             '<%= yeoman.app %>/styles/{,*/}*.css'
      //         ]
      //     }
      // }
    },

    htmlmin: {
      dist: {
          options: {
              /*removeCommentsFromCDATA: true,
              // https://github.com/yeoman/grunt-usemin/issues/44
              //collapseWhitespace: true,
              collapseBooleanAttributes: true,
              removeAttributeQuotes: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeOptionalTags: true*/
          },
          files: [{
              expand: true,
              src: '*.html',
              dest: 'dist'
          }]
      }
    },

    // Put files not handled in other tasks here
      copy: {
          dist: {
              files: [{
                  expand: true,
                  dot: true,
                  //cwd: '../',
                  dest: 'dist',
                  src: [
                    '*.{ico,png,txt}',
                    '.htaccess',
                    'img/{,*/}*.{webp,gif,png}',
                    'fonts/{,*/}*.*'
                  ]
              }]
          },
      }
  });

  //grunt.loadNpmTasks('grunt-contrib-clean');
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  //grunt.loadNpmTasks('grunt-contrib-jshint');
  ////grunt.loadNpmTasks('grunt-contrib-qunit');
  //grunt.loadNpmTasks('grunt-contrib-watch');
  //grunt.loadNpmTasks('grunt-contrib-concat');
  //grunt.loadNpmTasks('grunt-contrib-usemin');

  //grunt.registerTask('test', ['jshint', 'qunit']);
  grunt.registerTask('default', ['clean',
                                 'useminPrepare',
                                 'htmlmin',
                                 'jshint',
                                 'concat',
                                 'cssmin',
                                 'uglify',
                                 'copy:dist',
                                 'usemin' ]);
};