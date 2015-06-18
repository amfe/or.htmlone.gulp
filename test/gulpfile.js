var gulp = require('gulp');
var htmlone = require('../index');
console.log(htmlone)

gulp.task('htmlone', function() {
    gulp.src(['./*.html'])
        .pipe(htmlone({destDir: './dest',cssminify:false,jsminify:true}))
        .pipe(gulp.dest('./dest'));
});

gulp.task('default', ['htmlone'])