var through = require('through2');
var gutil = require('gulp-util');
var applySourceMap = require('vinyl-sourcemaps-apply');
var path = require('path');
var merge = require('merge');

var path = require('path');
var cheerio = require('cheerio');
var uglify = require('uglify-js');
var less = require('less');
var fs = require('fs');
var fsutil = require('./fsutil');
var url = require('url');
var http = require('http');

var PluginError = gutil.PluginError;
var pluginName = 'gulp-htmlone';

function extend (dest, source, isOverwrite) {
    if (isOverwrite == undefined) isOverwrite = true;
    for (var k in source) {
        if (!(k in dest) || isOverwrite) {
            dest[k] = source[k]
        }
    }
    return dest;
}

var dealScripts = function (htmlpath, htmlFrag, options, cb) {

      //console.log(htmlFrag, options);
      var $ = cheerio.load(htmlFrag, {decodeEntities: false, normalizeWhitespace: false});
      
      // deal js
      var todoJs = 0;
      var doneJs = 0;
      var todownloadCss = 0;
      var downloadedCss = 0;
      var isJsDone = false;
      var isCssDone = false;

      var __minifyAndReplace = function ($js, jscon) {

          if (options.jsminify) {
            jscon = uglify.minify(jscon, {
              fromString: true,
              mangle: true
            }).code;
          }

          // $js.removeAttr(options.keyattr)
          //     .removeAttr('src')
          //     .html(jscon);
          $js.replaceWith('<script>'+jscon+'</script>')
      };
      var __checkJsDone = function () {
          if (doneJs === js.length) {
              isJsDone = true;
              __checkAllDone();
          }
      };

      var __checkAllDone = function () {
        if (isJsDone && isCssDone) {
          cb && cb($.html());
        }
      };

      var __uniqueId = function () {
        var i = 0;
        return function () {
          return i ++;
        }
      }()

      var js = $('script['+options.keyattr+']');
      if (js.length === 0) {
        isJsDone = true;
        __checkAllDone();
      } else {
        js.each(function (i, el) {
            var $js = $(this);
            var src = $(this).attr('src');

            var oldCon = $(this).html();
            var newCon = '\n';

            if (!/^http/.test(src)) {
              var jssrc = path.join(path.dirname(htmlpath), src);
              if (fs.lstatSync(jssrc).isFile()) { 
                newCon += fs.readFileSync(jssrc, {encoding: 'utf8'});
                __minifyAndReplace($js, newCon);
                doneJs ++;
                __checkJsDone();
              } else {
                console.log('"'+src+'" in "' + htmlpath + '" is an invalid file or url!');
              }
            } else {
              //download & replace
              if (/\?\?/.test(src)) {
                  //cdn combo
                  var destPath = path.join('temp', 'cdn_combo_'+__uniqueId() + '.js');
                } else {
                  var destPath = path.join('temp', url.parse(src).pathname); 
                }

              fsutil.download(src, destPath, function ($js, destPath) {
                return function () {
                  console.log('"'+destPath+'" downloaded!');
                  __minifyAndReplace($js, fs.readFileSync(destPath, {encoding:'utf8'}));
                  doneJs ++;
                  __checkJsDone();
                }
              }($js, destPath));
            }

        });
      }

      

      // deal css
      var css = $('link['+options.keyattr+']');
      var _i = 0;
      var _checkCssDone = function () {
        if (_i === css.length) {
          isCssDone = true;
          __checkAllDone();
        }
      };
      var __cssMinifyAndReplace = function ($css, cssCon) {
          if (options.cssminify) {
              less.render(cssCon, {compress:true}, function (e, output) {
                  var style = $('<style>'+output+'</style>');
                  $css.replaceWith(style);
                  _i ++;
                  _checkCssDone();
              });
          } else {
            var style = $('<style>'+cssCon+'</style>');
            $css.replaceWith(style);
            _i ++;
            _checkCssDone();
          }
      };

      if (css.length === 0) {
        isCssDone = true;
        __checkAllDone();
      } else {
        css.each(function (i, el) {
            var href = $(this).attr('href'); 
            var newCon = '\n';
            var me = this;
            var $css = $(this);

            if (!/^http/.test(href)) {
              var csshref = path.join(path.dirname(htmlpath), href);
              if (fs.lstatSync(csshref).isFile()) {
                newCon += (fs.readFileSync(csshref, {encoding:'utf8'}) + '\n');
                __cssMinifyAndReplace($css, newCon);
              } else {
                console.log('"'+href+'" in "' + htmlpath + '" is an invalid file or url!');
              }
            } else {
              if (/\?\?/.test(href)) {
                  //cdn combo
                  var tempDestFile = path.join('temp', 'cdn_combo_'+__uniqueId() + '.css');
                } else {
                  var tempDestFile = path.join('temp', url.parse(href).pathname); 
                }
                
                fsutil.download(href, tempDestFile, function ($css, tempDestFile) {
                  return function () {
                      console.log('"'+tempDestFile+'" downloaded!');
                      __cssMinifyAndReplace($css, fs.readFileSync(tempDestFile, {encoding:'utf8'}));
                  }
                }($css, tempDestFile));
            }

        });
      }
      
  };


module.exports = function (opt) {

    var options = extend({
        keyattr: 'data-htmlone',
        cssminify: true,
        jsminify: true
    }, (opt || {}));

    var _todo = 0;
    var _done = 0;

  function transform(file, enc, cb) {
    if (file.isNull()) return cb(null, file); 
    if (file.isStream()) return cb(new PluginError(pluginName, 'Streaming not supported'));

    var data;
    var str = file.contents.toString('utf8');
    var filepath = file.path;

    _todo ++;
    dealScripts(filepath, str, options, function (html) {
        file.contents = new Buffer(html);
        cb(null, file);

        _done ++;
        if (_done === _todo) {
            fsutil.rmdirSync('./temp/');
            gutil.log(gutil.colors.cyan('>> All html done!'));
        }
    });
  }

  return through.obj(transform);
}