import path from 'path';
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2'
const resolveFile = function (filePath) {
    return path.join(__dirname, filePath);
};

const plugins = [
    typescript(),
    commonjs(),
    babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [
            ['@babel/preset-env', { modules: false }]
        ],
        plugins: [
            '@babel/plugin-syntax-class-properties',
            ['@babel/plugin-transform-classes', {
                'loose': true
            }]
        ]
    }),
];

export default [
    {
        input: resolveFile('src/index.ts'),
        output: {
            file: resolveFile('lib/index.js'),
            format: 'cjs',
            exports: 'auto',
        },
        plugins,
    },
    {
        input: resolveFile('src/css-loader.ts'),
        context: '',
        output: {
            file: resolveFile('lib/css-loader.js'),
            format: 'cjs',
            exports: 'auto',
        },
        plugins,

    },
    {
        input: resolveFile('src/jsx-loader.ts'),
        output: {
            file: resolveFile('lib/jsx-loader.js'),
            format: 'cjs',
            exports: 'auto',
        },
        plugins,
    },
    {
        input: resolveFile('src/utils.ts'),
        output: {
            file: resolveFile('lib/utils.js'),
            format: 'cjs',
            exports: 'auto',
        },
        plugins,
    },
]
