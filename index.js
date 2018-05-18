#!/usr/bin/env node
var path = require('path');
var fs = require('fs');
var fromPath = "./src";
var toPath = "./dist";
var configFileName = "project.config.json";
var projectConfig = getConfig(fromPath, configFileName);

//执行替换操作
function walk(fromPath, toPath) {
    var fileList = fs.readdirSync(fromPath);
    // console.log('fileList', fileList);
    for (var index = 0; index < fileList.length; index++) {
        var name = fileList[index];
        var filePath = path.resolve(fromPath, name);
        var toFilePath = path.resolve(toPath, name);
        if (isUnwanted(name)) {
            continue;
        }
        if (fs.lstatSync(filePath).isDirectory()) {
            fs.mkdirSync(toFilePath);
            walk(filePath, toFilePath);
        } else {
            var content = fs.readFileSync(filePath, 'utf-8');
            //替换样式表中的对应样式变量
            if (/[\.wxss|\.json|\.wxml]$/.test(name)) {
                for (var key in projectConfig.theme) {
                    var reg = new RegExp(key, "g");
                    content = content.replace(reg, projectConfig.theme[key]);
                    fs.writeFile(toFilePath, content, function (err) {
                        if (err) throw err;
                    });
                }
            } else {
                fs.createReadStream(filePath).pipe(fs.createWriteStream(toFilePath));
            }

        }
    }
}

//获取配置文件
function getConfig(fpath, name) {
    var fileList = fs.readdirSync(fpath), currentName;
    // console.log('fileList', fileList);
    for (var index = 0; index < fileList.length; index++) {
        currentName = fileList[index];
        var filePath = path.resolve(fpath, currentName);
        if (fs.lstatSync(filePath).isDirectory()) {
            getConfig(filePath, name);
        } else {
            if (currentName == name) {
                var content = fs.readFileSync(filePath, 'utf-8');
                return JSON.parse(content);
            }
        }
    }
}

if (fs.existsSync(toPath)) {
    emptyFile(toPath);
    walk(fromPath, toPath);
    console.log(`处理完成`);
} else if (fs.existsSync(fromPath)) {
    fs.mkdirSync(toPath);
    walk(fromPath, toPath);
    console.log(`处理完成`);
} else {
    console.log(`${fromPatth}文件夹不存在`);
}

function isUnwanted(filename) {
    return /(?:Thumbs\.db|\.DS_Store|\.git|node_modules)$/i.test(filename);
}


function emptyFile(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                emptyFile(curPath);
                fs.rmdirSync(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        // fs.rmdirSync(path);
    }
};