import { Compiler } from 'webpack';
export interface ScopeJsxCssPluginI {
    isReg: (r: any) => boolean;
    apply: (compiler: Compiler) => void;
}
export declare type PreStyle = '.less' | '.scss' | '.sass' | '.css';
export declare type PreFile = 'js' | 'jsx' | 'ts' | 'tsx';
export declare type Cludes = string | string[];
export interface Options {
    preStyle: PreStyle;
    preFile: PreFile[] | PreFile;
    includes?: Cludes;
    excludes?: Cludes;
}
export interface JsConfig {
    test: RegExp;
    exclude: RegExp;
    loader: string;
    options: {
        excludes?: Cludes;
        includes?: Cludes;
    };
}
