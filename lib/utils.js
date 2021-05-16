'use strict';

var preFileTransFormReg = function (preFile) {
    var test;
    if (Array.isArray(preFile)) {
        test = preFile.join('|');
    }
    if (typeof (preFile) === 'string') {
        test = preFile;
    }
    test = new RegExp("\\.(" + test + ")$");
    return test;
};
var styleType = [".less", ".scss", ".sass", ".css"];
var fileType = ["js", "jsx", "tsx", "ts"];
var preMap = {
    '.less': 'less-loader',
    '.scss': 'sass-loader',
    '.sass': 'sass-loader',
    '.css': 'css-loader',
};
var defaultConfig = {
    sourceType: "module",
    plugins: ["dynamicImport", "jsx", "classProperties", "typescript"],
};
module.exports = {
    preFileTransFormReg: preFileTransFormReg,
    styleType: styleType,
    fileType: fileType,
    preMap: preMap,
    defaultConfig: defaultConfig,
};
