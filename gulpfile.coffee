coffee      = require 'gulp-coffee'
gulp        = require 'gulp'

project =
  dist: './lib'

gulp.task 'default', ['dist']

gulp.task 'dist', ->
  gulp.src('./src/**/*.coffee')
    .pipe(coffee())
    .pipe(gulp.dest(project.dist))
