import { Compiler, RuleSetRule } from 'webpack';
import { ScopeJsxCssPluginI, Options, PreStyle, JsConfig } from './@types';
const path = require('path');
const chalk = require('chalk');
const { preFileTransFormReg, styleType, fileType, preMap } = require('./utils');
const SCOPE_JSX_CSS_PLUGIN = 'scope-jsx-css-plugin';
const log = console.log;
class ScopeJsxCssPlugin implements ScopeJsxCssPluginI{
    private options: Options;
    constructor(options: Options) {
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

    isReg(r:any): boolean {
        return r instanceof RegExp;
    }

    apply(compiler: Compiler): void {
        const self = this;
        const options: Options = this.options;
        if (!styleType.includes(options.preStyle)) {
            throw Error('the preStyle must one of [".less", ".scss", ".sass", ".css"]')
        }
        const pre: PreStyle = options.preStyle;
        const excludes = options.excludes;
        const includes = options.includes;
        const preFile = options.preFile || 'js';

        compiler.hooks.afterPlugins.tap(
            SCOPE_JSX_CSS_PLUGIN,
            () => {
                let loaders: RuleSetRule[] | any = compiler.options.module.rules;
                let preLoader: RuleSetRule = loaders.find((evl: RuleSetRule) => {
                    return evl.test instanceof RegExp && evl.test.test(pre);
                });
                if (!preLoader) {
                    const oneOf: RuleSetRule | any = compiler.options.module.rules.find((evl: any) => evl.oneOf && Array.isArray(evl.oneOf));
                    loaders = oneOf && oneOf.oneOf;
                    if (Array.isArray(loaders)) {
                        preLoader = loaders.find((item: any) => item.test && self.isReg(item.test) && item.test.test(pre));
                    }
                };
                const l: string = preMap[pre];
                if (preLoader && Array.isArray(preLoader.use)) {
                    const index: number = preLoader.use.findIndex((item: any) => {
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
                const test: RegExp = preFileTransFormReg(preFile)
                const jsConfig: JsConfig = {
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
