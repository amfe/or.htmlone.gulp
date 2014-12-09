var gulp = require('gulp');
var htmlone = require('../index');
console.log(htmlone)

gulp.task('htmlone', function() {
    gulp.src(['./*.html'])
        .pipe(htmlone())
        .pipe(gulp.dest('./dest'));
});

gulp.task('default', function () {
	gulp.run('htmlone');
})