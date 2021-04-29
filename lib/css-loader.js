'use strict';

var __read = ( && .__read) || function (o, n) {
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
};
var crosstree = require('css-tree');
var chalk = require('chalk');
var log = console.log;
module.exports = function (source) {
    var self = this;
    if (!self.resource)
        return source;
    try {
        var _a = __read(self.resource.split('?'), 2), _ = _a[0], query = _a[1];
        if (!query || !Object.keys(query).length)
            return source;
        var resourceQuery_1 = JSON.parse(query);
        var ast = crosstree.parse(source);
        crosstree.walk(ast, function (node) {
            if (node.type === 'ClassSelector') {
                if (resourceQuery_1[node.name]) {
                    node.name = node.name + "_" + resourceQuery_1[node.name];
                }
            }
        });
        return crosstree.generate(ast);
    }
    catch (err) {
        log(chalk.red(err));
        return source;
    }
};
