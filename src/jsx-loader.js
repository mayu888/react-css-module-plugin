const traverse = require("babel-traverse");
const md5 = require('md5');
const babel = require("@babel/core");
const path = require('path');
const t = require("babel-types");
const parser = require("@babel/parser");
const loaderUtils = require('loader-utils');
const { styleType, defaultConfig } = require('./utils');

let _cache = {};
const fileEnd = styleType;

function createHash(dep) {
    if (_cache[dep]) return _cache[dep];
    const hash = md5(dep).substr(0, 6);
    _cache[dep] = hash;
    return hash;
};

function isSubPath(excludes,context) {
    if (typeof (excludes) === 'string') {
        return context.includes(excludes);
    }
    if (Array.isArray(excludes)) {
        return excludes.find(p => context.includes(p));
    }
}

module.exports = function (source) {
    const self = this;
    const thisOptions = loaderUtils.getOptions(this);
    const resourcePath = self.resourcePath;
    if (thisOptions.includes) {
        const y = isSubPath(thisOptions.includes, resourcePath);
        if (!y) return source;
    }
    if (thisOptions.excludes) {
        const y = isSubPath(thisOptions.excludes, resourcePath);
        if (y) return source;
    }
    const ast = parser.parse(source, defaultConfig);
    let canTraverse = false;
    traverse(ast, {
        ImportDeclaration: function (p) {
            const source = p.node.source;
            if (!t.isStringLiteral(source)) {
                return p.skip();
            }
            const extname = path.extname(source.value);
            if (styleType.includes(extname)) {
                canTraverse = true;
            }
        }
    });
    if (!canTraverse) return source;
    _cache = {};
    const classHashChange = {};
    const options = {
        JSXAttribute: function(path) {
            const { name, value } = path.node;
            if (name.name !== 'className') return;
            if (!t.isStringLiteral(value)) return;
            const classNames = value.value;
            const newClassNames = new Set();
            classNames.split(" ").map(c => {
                if (c.includes('global-')) {
                    newClassNames.add(c)
                    return;
                } 
                const deps = resourcePath + c;
                const hash = createHash(deps);
                const newC = `${c}_${hash}`;
                classHashChange[c] = hash;
                newClassNames.add(newC);
            })
            value.value = [...newClassNames].join(" ");
            return path.skip()
        },

    }
    traverse(ast, options);
    traverse(ast, {
        StringLiteral: function StringLiteral(p) {
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