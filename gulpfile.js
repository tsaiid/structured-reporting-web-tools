var gulp = require('gulp'),
  connect = require('gulp-connect');

gulp.task('webserver', function() {
  connect.server({
    livereload: true,
  });
});

gulp.task('html', function () {
  gulp.src('**/*.html')
//      .pipe(gulp.dest('styles'))
      .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch('**/*.html', ['html']);
});

gulp.task('default', ['html', 'webserver', 'watch']);