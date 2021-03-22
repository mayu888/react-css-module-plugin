
const csstree = require('css-tree');
const chalk = require('chalk');
const log = console.log;

module.exports = function (source) {
    if (!this.resource) return source;
    try {
        const [_, query] = this.resource.split('?');
        if (!query || !Object.keys(query).length) return source;
        const resourceQuery = JSON.parse(query);
        const ast = csstree.parse(source);
        csstree.walk(ast, (node) => {
            if (node.type === 'ClassSelector') {
                if (resourceQuery[node.name]) {
                    node.name = `${node.name}_${resourceQuery[node.name]}`
                }
            }
        });
        return csstree.generate(ast);
    } catch (err) {
        log(chalk.red(err));
        return source;
    }
}