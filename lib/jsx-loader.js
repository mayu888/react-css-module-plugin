'use strict';

var babelTraverse = require('babel-traverse');
var md5 = require('md5');
var core = require('@babel/core');
var path = require('path');
var babelTypes = require('babel-types');
var parser = require('@babel/parser');
var loaderUtils = require('loader-utils');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var babelTraverse__default = /*#__PURE__*/_interopDefaultLegacy(babelTraverse);
var md5__default = /*#__PURE__*/_interopDefaultLegacy(md5);
var core__default = /*#__PURE__*/_interopDefaultLegacy(core);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var babelTypes__default = /*#__PURE__*/_interopDefaultLegacy(babelTypes);
var parser__default = /*#__PURE__*/_interopDefaultLegacy(parser);
var loaderUtils__default = /*#__PURE__*/_interopDefaultLegacy(loaderUtils);

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var preFileTransFormReg = function preFileTransFormReg(preFile) {
  var test;

  if (Array.isArray(preFile)) {
    test = preFile.join('|');
  }

  if (typeof preFile === 'string') {
    test = preFile;
  }

  test = new RegExp("\\.(".concat(test, ")$"));
  return test;
};

var styleType$1 = [".less", ".scss", ".sass", ".css"];
var fileType = ["js", "jsx", "tsx", "ts"];
var preMap = {
  '.less': 'less-loader',
  '.scss': 'sass-loader',
  '.sass': 'sass-loader',
  '.css': 'css-loader'
};
var defaultConfig$1 = {
  sourceType: "module",
  plugins: ["dynamicImport", "jsx", "classProperties", "typescript"]
};
var utils = {
  preFileTransFormReg: preFileTransFormReg,
  styleType: styleType$1,
  fileType: fileType,
  preMap: preMap,
  defaultConfig: defaultConfig$1
};

var styleType = utils.styleType,
    defaultConfig = utils.defaultConfig;
var _cache = {};
var fileEnd = styleType;

function createHash(dep) {
  if (_cache[dep]) return _cache[dep];
  var hash = md5__default['default'](dep).substr(0, 6);
  _cache[dep] = hash;
  return hash;
}

function isSubPath(excludes, context) {
  if (typeof excludes === 'string') {
    return context.includes(excludes);
  }

  if (Array.isArray(excludes)) {
    return excludes.find(function (p) {
      return context.includes(p);
    });
  }
}

var jsxLoader = function jsxLoader(source) {
  var self = this;
  var thisOptions = loaderUtils__default['default'].getOptions(this);
  var resourcePath = self.resourcePath;

  if (thisOptions.includes) {
    var y = isSubPath(thisOptions.includes, resourcePath);
    if (!y) return source;
  }

  if (thisOptions.excludes) {
    var _y = isSubPath(thisOptions.excludes, resourcePath);

    if (_y) return source;
  }

  var ast = parser__default['default'].parse(source, defaultConfig);
  var canTraverse = false;
  babelTraverse__default['default'](ast, {
    ImportDeclaration: function ImportDeclaration(p) {
      var source = p.node.source;

      if (!babelTypes__default['default'].isStringLiteral(source)) {
        return p.skip();
      }

      var extname = path__default['default'].extname(source.value);

      if (styleType.includes(extname)) {
        canTraverse = true;
      }
    }
  });
  if (!canTraverse) return source;
  _cache = {};
  var classHashChange = {};
  var options = {
    JSXAttribute: function JSXAttribute(path) {
      var _path$node = path.node,
          name = _path$node.name,
          value = _path$node.value;
      if (name.name !== 'className') return;
      if (!babelTypes__default['default'].isStringLiteral(value)) return;
      var classNames = value.value;
      var newClassNames = new Set();
      classNames.split(" ").map(function (c) {
        if (c.includes('global-')) {
          newClassNames.add(c);
          return;
        }

        var deps = resourcePath + c;
        var hash = createHash(deps);
        var newC = "".concat(c, "_").concat(hash);
        classHashChange[c] = hash;
        newClassNames.add(newC);
      });
      value.value = _toConsumableArray(newClassNames).join(" ");
      return path.skip();
    }
  };
  babelTraverse__default['default'](ast, options);
  babelTraverse__default['default'](ast, {
    StringLiteral: function StringLiteral(p) {
      var value = p.node.value;
      if (!fileEnd.includes(path__default['default'].extname(value))) return p.skip();
      p.node.value = "".concat(value, "?").concat(JSON.stringify(classHashChange));
      return p.skip();
    }
  });

  var _babel$transformFromA = core__default['default'].transformFromAstSync(ast, null, {
    configFile: false
  }),
      code = _babel$transformFromA.code;

  return code;
};

module.exports = jsxLoader;
