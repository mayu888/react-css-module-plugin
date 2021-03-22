const path = require('path');
const chalk = require('chalk');
const { preFileTransFormReg, styleType, fileType, preMap } = require('./utils');
const SCOPE_JSX_CSS_PLUGIN = 'scope-jsx-css-plugin';
const log = console.log;
class ScopeJsxCssPlugin{

    constructor(options) {
        this.options = options;
        if (!options.preStyle) {
            throw  Error('must have an type,such .less、.scss、.sass or .css')
        }
        if (typeof (options.preFile) === 'string') {
            if (!fileType.includes(options.preFile)) {
                throw Error('the preFile must one of [".js", ".jsx", ".tsx", ".ts"]')
            }
        }
        if (Array.isArray(options.preFile)) {
            if (options.preFile.length > 4) {
                log(chalk.red('it maybe has cannot resolve file'));
            }
            for (let i = 0; i < options.preFile.length; i++){
                if (!fileType.includes(options.preFile[i])) {
                    throw Error('the preFile must one of ["js", "jsx", "tsx", "ts"]')
                }
            }
        }
    }

    isReg(r) {
        return r instanceof RegExp;
    }

    apply(compiler) {
        const self = this;
        const options = this.options;
        if (!styleType.includes(options.preStyle)) {
            throw Error('the preStyle must one of [".less", ".scss", ".sass", ".css"]')
        }
        const pre = options.preStyle;
        const excludes = options.excludes;
        const includes = options.includes;
        const preFile = options.preFile || 'js';

        compiler.hooks.afterPlugins.tap(
            SCOPE_JSX_CSS_PLUGIN,
            () => {
                let loaders = compiler.options.module.rules;
                let preLoader = loaders.find(evl => {
                    return self.isReg(evl.test) && evl.test.test(pre);
                });
                if (!preLoader) {
                    const oneOf = compiler.options.module.rules.find(evl => evl.oneOf && Array.isArray(evl.oneOf));
                    loaders = oneOf && oneOf.oneOf;
                    if (Array.isArray(loaders)) {
                        preLoader = loaders.find(item => item.test && self.isReg(item.test) && item.test.test(pre));
                    }
                };
                const l = preMap[pre];
                if (preLoader && Array.isArray(preLoader.use)) {
                    const index = preLoader.use.findIndex(item => {
                        if (typeof (item) === 'object') {
                            return item.loader.includes(l);
                        }
                        if (typeof (item) === 'string') {
                            return item.includes(l);
                        }
                    });
                    if (index > -1) {
                        const copyUse = [...preLoader.use];
                        copyUse.splice(index, 0, { loader: path.join(__dirname, 'css-loader.js') });
                        preLoader.use = copyUse;
                    }
                }
                const test = preFileTransFormReg(preFile)
                const jsConfig = {
                    test,
                    exclude: /node_modules/,
                    loader: path.join(__dirname, 'jsx-loader'),
                    options: {
                        excludes,
                        includes,
                    }
                };
                compiler.options.module.rules.push(jsConfig);
            }
          );
    }
}
module.exports = ScopeJsxCssPlugin;
