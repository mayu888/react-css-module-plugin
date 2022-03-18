'use strict';

var crosstree = require('css-tree');
var chalk = require('chalk');
var log = console.log;
module.exports = function (source) {
    var self = this;
    if (!self.resource)
        return source;
    try {
        var query = self.resource.split('?')[1];
        if (!query || !Object.keys(query).length)
            return source;
        var resourceQuery_1 = JSON.parse(query);
        var ast = crosstree.parse(source);
        crosstree.walk(ast, {
            visit: 'ClassSelector',
            enter: function (node) {
                if (resourceQuery_1[node.name]) {
                    node._postfix = "" + resourceQuery_1[node.name];
                }
            },
            leave: function (node) {
                node.name = node._postfix ? node._postfix : node.name;
            }
        });
        return crosstree.generate(ast);
    }
    catch (err) {
        log(chalk.red(err));
        return source;
    }
};
