'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spreadArray(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
}

var path = require('path');
var chalk = require('chalk');
var _a = require('./utils'), preFileTransFormReg = _a.preFileTransFormReg, styleType = _a.styleType, fileType = _a.fileType, preMap = _a.preMap;
var SCOPE_JSX_CSS_PLUGIN = 'scope-jsx-css-plugin';
var log = console.log;
var ScopeJsxCssPlugin = /** @class */ (function () {
    function ScopeJsxCssPlugin(options) {
        this.options = options;
        if (!options.preStyle) {
            throw Error('must have an type,such .less、.scss、.sass or .css');
        }
        if (typeof (options.preFile) === 'string') {
            if (!fileType.includes(options.preFile)) {
                throw Error('the preFile must one of [".js", ".jsx", ".tsx", ".ts"]');
            }
        }
        if (Array.isArray(options.preFile)) {
            if (options.preFile.length > 4) {
                log(chalk.red('it maybe has cannot resolve file'));
            }
            for (var i = 0; i < options.preFile.length; i++) {
                if (!fileType.includes(options.preFile[i])) {
                    throw Error('the preFile must one of ["js", "jsx", "tsx", "ts"]');
                }
            }
        }
    }
    ScopeJsxCssPlugin.prototype.isReg = function (r) {
        return r instanceof RegExp;
    };
    ScopeJsxCssPlugin.prototype.apply = function (compiler) {
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
                return evl.test instanceof RegExp && evl.test.test(pre);
            });
            if (!preLoader) {
                var oneOf = compiler.options.module.rules.find(function (evl) { return evl.oneOf && Array.isArray(evl.oneOf); });
                loaders = oneOf && oneOf.oneOf;
                if (Array.isArray(loaders)) {
                    preLoader = loaders.find(function (item) { return item.test && self.isReg(item.test) && item.test.test(pre); });
                }
            }
            var l = preMap[pre];
            if (preLoader && Array.isArray(preLoader.use)) {
                var index = preLoader.use.findIndex(function (item) {
                    if (typeof (item) === 'object') {
                        return item.loader.includes(l);
                    }
                    if (typeof (item) === 'string') {
                        return item.includes(l);
                    }
                });
                if (index > -1) {
                    var copyUse = __spreadArray([], __read(preLoader.use));
                    copyUse.splice(index, 0, { loader: path.join(__dirname, 'css-loader.js') });
                    preLoader.use = copyUse;
                }
            }
            var test = preFileTransFormReg(preFile);
            var jsConfig = {
                test: test,
                exclude: /node_modules/,
                loader: path.join(__dirname, 'jsx-loader'),
                options: {
                    excludes: excludes,
                    includes: includes,
                }
            };
            compiler.options.module.rules.push(jsConfig);
        });
    };
    return ScopeJsxCssPlugin;
}());
module.exports = ScopeJsxCssPlugin;
