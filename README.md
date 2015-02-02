# gulp-htmlone

version 0.1.2
combo and minify `css` and `js` to html. no matter the file is online or not.

[One-Request](http://gitlab.alibaba-inc.com/groups/one-request)集成解决方案之一，厂内同学请移步[Group:One-Request](http://gitlab.alibaba-inc.com/groups/one-request)

## Features

+ css, js自动内联
+ 支持http资源自动下载后再内联
+ 内联后资源引用相对路径修正，包括线上资源down下来后内部相对路径资源自动替换为绝对路径
+ css，js 选择性压缩
+ 支持 配置不需要combine内联的资源，selector配置
+ 支持冗余和开发时tag自动移除
+ 支持 @import 的解析和combine, 包括 @import 线上和本地引用共存
+ script 标签上属性的保留

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
then gulp will combo the content of `<script >` and `<link rel="stylesheet" />` tags to the dest html doc.

## Options
```javascript
gulp.src('./src/*.html')
    .pipe(htmlone({
    	removeSelector: '[will-remove]', // selector 配置，源文档中符合这个selector的标签将自动移除
        keepliveSelector: '[keeplive]',  // 不要combo的selector配置，源文档中符合这个selector的将保持原状
        destDir: './',  // dest 目录配置，一般情况下需要和 gulp.dest 目录保持一致，用于修正相对路径资源
        coimport: true,  // 是否需要把 @import 的资源合并
        cssminify: true, // 是否需要压缩css
        jsminify: true  // 是否需要压缩js
    }))
    // ...
```

## License
MIT

## Changelog

- 0.0.3 修复windows 下 `mkdirp` 的问题
- 0.0.4 加上`removeSelector` 配置
- 0.1.0 大版本升级，以下变更
  + 由之前的需要加上指定属性才combo的方式 变更为 **默认都执行，只有加上指定标识的才不执行combo**，详见 `Usage`
  + api 变更，去掉`keyattr`配置，改为 `keepliveSelector` ,标识指定`selector`不执行combo操作
  + 新增 `destDir` 配置，用于当destFile和sourceFile不在一级目录的时候，css等资源内联后内部url相对路径资源修正
  + 新增 `coimport` 配置，用于选择是否需要将css 中 `@import` 进行combile后再内联至html文档。支持@import 递归 和 http url 的import 以及路径修正
  + 中间临时文件处理目录由 `temp` 变为 `htmlone_temp` ，temp目录太通用，容易冲突
- 0.1.1 css的压缩不用less处理，改为`ycssmin`, 避免windows环境下dataurl less处理的路径bug。
- 0.1.2 修复 dataurl 当作相对路径处理的bug
