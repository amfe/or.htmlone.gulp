# gulp-htmlone

version 0.0.3
combo and minify `css` and `js` to html. no matter the file is online or not.

## Usage

```javascript
var gulp = require('gulp');
var htmlone = require('gulp-htmlone');

gulp.task('htmlone', function() {
    gulp.src(['./*.html'])
        .pipe(htmlone())
        .pipe(gulp.dest('./dest'));
});
```
then gulp will combo the `<script data-htmlone>` and `<link rel="stylesheet" data-htmlone />` to the html.

## Options
```javascript
gulp.src('./src/*.html')
    .pipe(htmlone({
        keyattr: 'data-htmlone',
        cssminify: true,
        jsminify: true
    }))
    // ...
```

## License
MIT

## Changelog

- 0.0.3 修复windows 下 `mkdirp` 的问题
