var cheerio = require('cheerio');
var htmlone = require('../index');
var path = require('path');
var fs = require('fs');
var assert = require('stream-assert');
var gulp = require('gulp');
var test = require('./test-stream');
var should = require('should');
var cssmin = require('ycssmin').cssmin;
var uglify = require('uglify-js');


describe('gulp-htmlone', function () {

    it('should combo relativeCss ', function (done) {
        test('<link rel="stylesheet" href="./css/sub.css"/>')
                .pipe(htmlone())
                .pipe(assert.length(1))
                .pipe(assert.first(function (d) { d.contents.toString().should.eql('<style>'+cssmin(fs.readFileSync(path.join(__dirname, 'css/sub.css'), 'utf8')+'</style>')) }))
                .pipe(assert.end(done))
    });

    it('should fix assets relative-path in css when combo to html', function (done) {
        test('<link rel="stylesheet" href="./css/assets.css" />')
            .pipe(htmlone({destDir:'dest/inner'}))
            .pipe(assert.length(1))
            .pipe(assert.first(function (d) { d.contents.toString().should.eql('<style>body{background:url(../../images/a.jpg)}</style>') }))
            .pipe(assert.end(done));
    });
    
    it('should download css url then combo contents to html', function (done) {
        test('<link rel="stylesheet" href="http://g.tbcdn.cn/mtb/app-simplepages/0.0.3/618/assets/index.css" />')
        .pipe(htmlone())
        .pipe(assert.first(function (d) {
            should(/^<style>body\,html\{height\:*.+font\-weight\:900\}<\/style>$/.test(d.contents.toString())).be.exactly(true);
        }))
        .pipe(assert.end(done))
    });

    it('should support `//` scheme', function (done) {
        test('<link rel="stylesheet" href="//g.tbcdn.cn/mtb/app-simplepages/0.0.3/618/assets/index.css" />')
        .pipe(htmlone())
        .pipe(assert.first(function (d) {
            should(/^<style>body\,html\{height\:*.+font\-weight\:900\}<\/style>$/.test(d.contents.toString())).be.exactly(true);
        }))
        .pipe(assert.end(done))
    });

    it('shoule support `will-remove` tag', function (done) {
        test('<link rel="icon" will-remove />')
                .pipe(htmlone())
                .pipe(assert.length(1))
                .pipe(assert.first(function (d) { d.contents.toString().should.eql('') }))
                .pipe(assert.end(done))
    });

    it('should support `keeplive`', function (done) {
        test('<link rel="stylesheet" href="./css/sub.css" keeplive/>')
                .pipe(htmlone())
                .pipe(assert.length(1))
                .pipe(assert.first(function (d) {
                    var keepliveTest = /<link\srel=\"stylesheet\"\shref="\.\/css\/sub\.css"*.+>/.test(d.contents.toString());
                    should(keepliveTest).be.exactly(true)
                }))
                .pipe(assert.end(done))
    });

    it('should combo relative-path js', function (done) {
        test('<script src="./js/testcase1.js"></script>')
        .pipe(htmlone())
        .pipe(assert.length(1))
        .pipe(assert.first(function (d) {
            //console.log(d.contents.toString())
            d.contents.toString().should.eql('<script>var testcase="111";</script>')
        })) 
        .pipe(assert.end(done))
    });

    it('should download and combo url js', function (done) {
        test('<script src="//g.tbcdn.cn/mtb/zepto/1.0.4/zepto.js"></script>')
        .pipe(htmlone())
        .pipe(assert.length(1))
        .pipe(assert.first(function (d) {
            var jsTest = /^<script>\!function*.+\(Zepto\);<\/script>$/.test(d.contents.toString());
            should(jsTest).be.exactly(true);
        })) 
        .pipe(assert.end(done))
    });

    it('should support tabao combo url by `??`', function (done) {
        test('<script src="//g.tbcdn.cn/mtb/??lib-motion/1.0.5/motion.js,lib-gesture/1.1.10/gesture.js"></script>')
        .pipe(htmlone())
        .pipe(assert.length(1))
        .pipe(assert.first(function (d) {
            var jsTest = /^<script>*.+motion*.+HTMLEvents*.+<\/script>$/.test(d.contents.toString());
            should(jsTest).be.exactly(true);
        })) 
        .pipe(assert.end(done))
    })
})