var gulp = require('gulp'),coffee = require('gulp-coffee'),gutil = require('gulp-util');

gulp.task('coffee', function() {
  gulp.src(['./lib/*.coffee','index.coffee','messages.coffee'],{base: './'})
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('./'))
});

gulp.watch(['./lib/*.coffee','index.coffee','messages.coffee'],function(){
  gulp.run('coffee');
})
