var fs = require('fs');
var path = require('path');
var http = require('http');
 
var mkdirSync = function (url,mode,cb){
    var arr = url.split("/");
    mode = mode || 0755;
    cb = cb || function(){};
    if(arr[0]==="."){//处理 ./aaa
        arr.shift();
    }
    if(arr[0] == ".."){//处理 ../ddd/d
        arr.splice(0,2,arr[0]+"/"+arr[1])
    }
    function inner(cur){
        if(!fs.existsSync(cur)){//不存在就创建一个
            fs.mkdirSync(cur, mode)
        }
        if(arr.length){
            inner(cur + "/"+arr.shift());
        }else{
            cb();
        }
    }
    arr.length && inner(arr.shift());
}

var rmdirSync = (function(){
    function iterator(url,dirs){
        var stat = fs.statSync(url);
        if(stat.isDirectory()){
            dirs.unshift(url);//收集目录
            inner(url,dirs);
        }else if(stat.isFile()){
            fs.unlinkSync(url);//直接删除文件
        }
    }
    function inner(path,dirs){
        var arr = fs.readdirSync(path);
        for(var i = 0, el ; el = arr[i++];){
            iterator(path+"/"+el,dirs);
        }
    }
    return function(dir,cb){
        cb = cb || function(){};
        var dirs = [];
 
        try{
            iterator(dir,dirs);
            for(var i = 0, el ; el = dirs[i++];){
                fs.rmdirSync(el);//一次性删除所有收集到的目录
            }
            cb()
        }catch(e){//如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
            e.code === "ENOENT" ? cb() : cb(e);
        }
    }
})();

var getAllFolersAndFiles = (function(){
    function iterator(url, folders, files){
        var stat = fs.statSync(url);
        if(stat.isDirectory()){
            folders.unshift(url);//收集目录
            inner(url,folders, files);
        }else if(stat.isFile()){
            files.unshift(url);//收集文件
        }
    }
    function inner(path,folders,files){
        var arr = fs.readdirSync(path);
        for(var i = 0, el ; el = arr[i++];){
            iterator(path+"/"+el,folders,files);
        }
    }
    return function(dir){
        var folders = [], files = [];
        try{
            iterator(dir,folders,files);
        }catch(e){
        }finally{
            return {
                folders : folders,
                files   : files
            }
        }
    }
})();

var getAllFiles = function (root) {
  var result = [], files = fs.readdirSync(root)
  files.forEach(function(file) {
    var pathname = root+ "/" + file
      , stat = fs.lstatSync(pathname)
    if (stat === undefined) return
 
    // 不是文件夹就是文件
    if (!stat.isDirectory()) {
      result.push(pathname)
    // 递归自身
    } else {
      result = result.concat(getAllFiles(pathname))
    }
  });
  return result
};

var download = function (url, dest, cb) {
    var dirname = path.dirname(dest);
    !fs.existsSync(dirname) && mkdirSync(dirname);

      var file = fs.createWriteStream(dest);
      var request = http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          file.close(cb);  // close() is async, call cb after close completes.
        });
      }).on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
      });
}

var copyFile = function (from, to, cb) {
    if (!fs.existsSync(from)) return false;
    var toDir = path.dirname(to);
    !fs.existsSync(toDir) && mkdirSync(toDir);

    var toStream = fs.createWriteStream(to);
    fs.createReadStream(from).pipe(toStream);

    toStream.on('close', function () {
        cb && cb();
    });
}

var getFilesizeInBytes = function(filename) {
 var stats = fs.statSync(filename);
 var fileSizeInBytes = stats["size"];
 return fileSizeInBytes;
}

exports.mkdirSync = mkdirSync;
exports.rmdirSync = rmdirSync;
exports.getAllFolersAndFiles = getAllFolersAndFiles;
exports.getAllFiles = getAllFiles;
exports.download = download;
exports.copyFile = copyFile;
exports.getFilesizeInBytes = getFilesizeInBytes;