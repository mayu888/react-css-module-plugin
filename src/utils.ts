import { ParserOptions } from '@babel/parser';
import { PreStyle, PreFile } from './@types';
const preFileTransFormReg = (preFile: string | string[]): RegExp => {
    let test;
    if (Array.isArray(preFile)) {
        test = preFile.join('|');
    }
    if (typeof (preFile) === 'string') {
        test = preFile;
    }
    test = new RegExp(`\\.(${test})$`);
    return test;
}

const styleType: PreStyle[] = [".less", ".scss", ".sass", ".css"];

const fileType: PreFile[] = ["js", "jsx", "tsx", "ts"];

const preMap = {
    '.less': 'less-loader',
    '.scss': 'sass-loader',
    '.sass': 'sass-loader',
    '.css': 'css-loader',
}

const defaultConfig: ParserOptions = {
    sourceType: "module",
    plugins: ["dynamicImport", "jsx", "classProperties", "typescript"],
}


module.exports = {
    preFileTransFormReg,
    styleType,
    fileType,
    preMap,
    defaultConfig,
}