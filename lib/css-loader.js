'use strict';

var cssTree = require('css-tree');
var chalk = require('chalk');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var cssTree__default = /*#__PURE__*/_interopDefaultLegacy(cssTree);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
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

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var log = console.log;

var cssLoader = function cssLoader(source) {
  if (!this.resource) return source;

  try {
    var _this$resource$split = this.resource.split('?'),
        _this$resource$split2 = _slicedToArray(_this$resource$split, 2),
        _ = _this$resource$split2[0],
        query = _this$resource$split2[1];

    if (!query || !Object.keys(query).length) return source;
    var resourceQuery = JSON.parse(query);
    var ast = cssTree__default['default'].parse(source);
    cssTree__default['default'].walk(ast, function (node) {
      if (node.type === 'ClassSelector') {
        if (resourceQuery[node.name]) {
          node.name = "".concat(node.name, "_").concat(resourceQuery[node.name]);
        }
      }
    });
    return cssTree__default['default'].generate(ast);
  } catch (err) {
    log(chalk__default['default'].red(err));
    return source;
  }
};

module.exports = cssLoader;
