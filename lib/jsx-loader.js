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

var traverse = require("babel-traverse").default;
var md5 = require('md5');
var babel = require("@babel/core");
var path = require('path');
var t = require("babel-types");
var parser = require("@babel/parser");
var loaderUtils = require('loader-utils');
var _a = require('./utils'), styleType = _a.styleType, defaultConfig = _a.defaultConfig;
var _cache = {};
var fileEnd = styleType;
function createHash(dep) {
    if (_cache[dep])
        return _cache[dep];
    var hash = md5(dep).substr(0, 6);
    _cache[dep] = hash;
    return hash;
}
function isSubPath(excludes, context) {
    if (typeof (excludes) === 'string') {
        return context.includes(excludes);
    }
    if (Array.isArray(excludes)) {
        return !!(excludes.find(function (p) { return context.includes(p); }));
    }
    return false;
}
module.exports = function (source) {
    var self = this;
    var thisOptions = loaderUtils.getOptions(this);
    var resourcePath = self.resourcePath;
    if (thisOptions.includes) {
        var y = isSubPath(thisOptions.includes, resourcePath);
        if (!y)
            return source;
    }
    if (thisOptions.excludes) {
        var y = isSubPath(thisOptions.excludes, resourcePath);
        if (y)
            return source;
    }
    var ast = parser.parse(source, defaultConfig);
    var canTraverse = false;
    traverse(ast, {
        ImportDeclaration: function (p) {
            var source = p.node.source;
            if (!t.isStringLiteral(source)) {
                return p.skip();
            }
            var extname = path.extname(source.value);
            if (styleType.includes(extname)) {
                canTraverse = true;
            }
        }
    });
    if (!canTraverse)
        return source;
    _cache = {};
    var classHashChange = {};
    var options = {
        JSXAttribute: function (path) {
            var _a = path.node, name = _a.name, value = _a.value;
            if (name.name !== 'className')
                return;
            if (!t.isStringLiteral(value))
                return;
            var classNames = value.value;
            var newClassNames = new Set();
            classNames.split(" ").map(function (c) {
                if (c.includes('global-')) {
                    newClassNames.add(c);
                    return;
                }
                var deps = resourcePath + c;
                var hash = createHash(deps);
                var newC = c + "_" + hash;
                classHashChange[c] = hash;
                newClassNames.add(newC);
            });
            value.value = __spreadArray([], __read(newClassNames)).join(" ");
            return path.skip();
        },
    };
    traverse(ast, options);
    traverse(ast, {
        StringLiteral: function StringLiteral(p) {
            var value = p.node.value;
            if (!fileEnd.includes(path.extname(value)))
                return p.skip();
            p.node.value = value + "?" + JSON.stringify(classHashChange);
            return p.skip();
        },
    });
    var code = babel.transformFromAstSync(ast, null, {
        configFile: false
    }).code;
    return code;
};
