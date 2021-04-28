
const crosstree = require('css-tree');
const chalk = require('chalk');
const log = console.log;

module.exports = function<T> (source:T): T{
    const self:any = this;
    if (!self.resource) return source;
    try {
        const [_, query] = self.resource.split('?');
        if (!query || !Object.keys(query).length) return source;
        const resourceQuery = JSON.parse(query);
        const ast = crosstree.parse(source);
        crosstree.walk(ast, (node:any) => {
            if (node.type === 'ClassSelector') {
                if (resourceQuery[node.name]) {
                    node.name = `${node.name}_${resourceQuery[node.name]}`
                }
            }
        });
        return crosstree.generate(ast);
    } catch (err) {
        log(chalk.red(err));
        return source;
    }
}