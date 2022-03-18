import { Options } from './@types';
const traverse = require("babel-traverse").default;
const md5 = require('md5');
const babel = require("@babel/core");
const path = require('path');
const t = require("babel-types");
const parser = require("@babel/parser");
const loaderUtils = require('loader-utils');
const { styleType, defaultConfig } = require('./utils');

let _cache: any = {};
const fileEnd = styleType;

function createHash(dep: string): string {
    if (_cache[dep]) return _cache[dep];
    const hash: string = md5(dep).substr(0, 6);
    _cache[dep] = hash;
    return hash;
};

function isSubPath(excludes: string | string[],context: string): boolean {
    if (typeof (excludes) === 'string') {
        return context.includes(excludes);
    }
    if (Array.isArray(excludes)) {
        return !!(excludes.find(p => context.includes(p)));
    }
    return false;
}

function selectFileName(_path: string): string {
    if (typeof (_path) !== 'string') throw ('the path is not string');
    let { name, dir } = path.parse(_path);
    if (name === 'index') {
        name = dir.split(path.sep)[dir.split(path.sep).length - 1];
    }
    return name;
}

module.exports = function<T>(source: T): T {
    const self: any = this;
    const thisOptions: Options = loaderUtils.getOptions(this);
    const resourcePath: string = self.resourcePath;
    if (thisOptions.includes) {
        const y: boolean = isSubPath(thisOptions.includes, resourcePath);
        if (!y) return source;
    }
    if (thisOptions.excludes) {
        const y: boolean = isSubPath(thisOptions.excludes, resourcePath);
        if (y) return source;
    }
    const ast: import("@babel/types").File = parser.parse(source, defaultConfig);
    let canTraverse: boolean = false;
    traverse(ast, {
        ImportDeclaration: function (p: any) {
            const source = p.node.source;
            if (!t.isStringLiteral(source)) {
                return p.skip();
            }
            const extname: string = path.extname(source.value);
            if (styleType.includes(extname)) {
                canTraverse = true;
            }
        }
    });
    if (!canTraverse) return source;
    const preName = selectFileName(resourcePath);
    _cache = {};
    const classHashChange: any = {};
    const options = {
        JSXAttribute: function(path: any) {
            const { name, value } = path.node;
            if (name.name !== 'className') return;
            if (!t.isStringLiteral(value)) return;
            const classNames: string = value.value;
            const newClassNames: Set<string> = new Set();
            classNames.split(" ").map(className => {
                if (className.includes('global-')) {
                    newClassNames.add(className)
                    return;
                } 
                const newClassName = `${preName}_${className}_${createHash(resourcePath + className)}`;
                classHashChange[className] = newClassName;
                newClassNames.add(newClassName);
            })
            value.value = [...newClassNames].join(" ");
            return path.skip()
        },

    }
    traverse(ast, options);
    traverse(ast, {
        StringLiteral: function StringLiteral(p: any) {
            const { value } = p.node;
            if (!fileEnd.includes(path.extname(value))) return p.skip();
            p.node.value = `${value}?${JSON.stringify(classHashChange)}`;
            return p.skip();
        },

    });

    const { code } = babel.transformFromAstSync(ast, null, {
        configFile: false
    });
    return code;
}