'use strict';

var path = require('path');
var chalk = require('chalk');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

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

var preFileTransFormReg$1 = function preFileTransFormReg(preFile) {
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
var fileType$1 = ["js", "jsx", "tsx", "ts"];
var preMap$1 = {
  '.less': 'less-loader',
  '.scss': 'sass-loader',
  '.sass': 'sass-loader',
  '.css': 'css-loader'
};
var defaultConfig = {
  sourceType: "module",
  plugins: ["dynamicImport", "jsx", "classProperties", "typescript"]
};
var utils = {
  preFileTransFormReg: preFileTransFormReg$1,
  styleType: styleType$1,
  fileType: fileType$1,
  preMap: preMap$1,
  defaultConfig: defaultConfig
};

var preFileTransFormReg = utils.preFileTransFormReg,
    styleType = utils.styleType,
    fileType = utils.fileType,
    preMap = utils.preMap;
var SCOPE_JSX_CSS_PLUGIN = 'scope-jsx-css-plugin';
var log = console.log;

var ScopeJsxCssPlugin = /*#__PURE__*/function () {
  function ScopeJsxCssPlugin(options) {
    this.options = options;

    if (!options.preStyle) {
      throw Error('must have an type,such .less、.scss、.sass or .css');
    }

    if (typeof options.preFile === 'string') {
      if (!fileType.includes(options.preFile)) {
        throw Error('the preFile must one of [".js", ".jsx", ".tsx", ".ts"]');
      }
    }

    if (Array.isArray(options.preFile)) {
      if (options.preFile.length > 4) {
        log(chalk__default['default'].red('it maybe has cannot resolve file'));
      }

      for (var i = 0; i < options.preFile.length; i++) {
        if (!fileType.includes(options.preFile[i])) {
          throw Error('the preFile must one of ["js", "jsx", "tsx", "ts"]');
        }
      }
    }
  }

  var _proto = ScopeJsxCssPlugin.prototype;

  _proto.isReg = function isReg(r) {
    return r instanceof RegExp;
  };

  _proto.apply = function apply(compiler) {
    var self = this;
    var options = this.options;

    if (!styleType.includes(options.preStyle)) {
      throw Error('the preStyle must one of [".less", ".scss", ".sass", ".css"]');
    }

    var pre = options.preStyle;
    var excludes = options.excludes;
    var includes = options.includes;
    var preFile = options.preFile || 'js';
    compiler.hooks.afterPlugins.tap(SCOPE_JSX_CSS_PLUGIN, function () {
      var loaders = compiler.options.module.rules;
      var preLoader = loaders.find(function (evl) {
        return self.isReg(evl.test) && evl.test.test(pre);
      });

      if (!preLoader) {
        var oneOf = compiler.options.module.rules.find(function (evl) {
          return evl.oneOf && Array.isArray(evl.oneOf);
        });
        loaders = oneOf && oneOf.oneOf;

        if (Array.isArray(loaders)) {
          preLoader = loaders.find(function (item) {
            return item.test && self.isReg(item.test) && item.test.test(pre);
          });
        }
      }
      var l = preMap[pre];

      if (preLoader && Array.isArray(preLoader.use)) {
        var index = preLoader.use.findIndex(function (item) {
          if (_typeof(item) === 'object') {
            return item.loader.includes(l);
          }

          if (typeof item === 'string') {
            return item.includes(l);
          }
        });

        if (index > -1) {
          var copyUse = _toConsumableArray(preLoader.use);

          copyUse.splice(index, 0, {
            loader: path__default['default'].join(__dirname, 'css-loader.js')
          });
          preLoader.use = copyUse;
        }
      }

      var test = preFileTransFormReg(preFile);
      var jsConfig = {
        test: test,
        exclude: /node_modules/,
        loader: path__default['default'].join(__dirname, 'jsx-loader'),
        options: {
          excludes: excludes,
          includes: includes
        }
      };
      compiler.options.module.rules.push(jsConfig);
    });
  };

  return ScopeJsxCssPlugin;
}();

var src = ScopeJsxCssPlugin;

module.exports = src;
