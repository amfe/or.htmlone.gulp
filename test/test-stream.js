var array = require('stream-array');
var File = require('gulp-util').File;
var path = require('path');

module.exports = function () {
  var args = Array.prototype.slice.call(arguments);

  var i = 0;

  function create(contents) {
    return new File({
      cwd: __dirname,
      base: __dirname,
      path: path.join(__dirname, ('file' + (++i) + '.html')),
      contents: new Buffer(contents),
      stat: {mode: 0666}
    });
  }

  return array(args.map(create))
};