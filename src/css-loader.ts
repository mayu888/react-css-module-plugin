
const crosstree = require('css-tree');
const chalk = require('chalk');
const log = console.log;

module.exports = function<T> (source:T): T{
    const self:any = this;
    if (!self.resource) return source;
    try {
        const query = self.resource.split('?')[1];
        if (!query || !Object.keys(query).length) return source;
        const resourceQuery = JSON.parse(query);
        const ast = crosstree.parse(source);
        crosstree.walk(ast, {
            visit: 'ClassSelector',
            enter(node: any) {
                if (resourceQuery[node.name]) {
                    node._postfix = `_${resourceQuery[node.name]}`;
                }
            },
            leave(node: any) {
                node.name = node._postfix ? node.name + node._postfix : node.name;
            }
        });
        return crosstree.generate(ast);
    } catch (err) {
        log(chalk.red(err));
        return source;
    }
}