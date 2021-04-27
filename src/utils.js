
const preFileTransFormReg = (preFile) => {
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

const styleType = [".less", ".scss", ".sass", ".css"];

const fileType = ["js", "jsx", "tsx", "ts"];

const preMap = {
    '.less': 'less-loader',
    '.scss': 'sass-loader',
    '.sass': 'sass-loader',
    '.css': 'css-loader',
}

const defaultConfig = {
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