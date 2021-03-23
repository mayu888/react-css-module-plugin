# react-css-module-plugin
[![NPM](https://img.shields.io/npm/v/react-css-module-plugin.svg)](https://www.npmjs.com/package/lazylist-react) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
## Why write this plugin
Because the process of using traditional cssModule is a bit cumbersome.You must first write the css class name in advance, and then import.And the class name can only be a word name or a camel case name, if you use "_" or "-" when specifying the class name, you need to write style['classname'] like this.So I have been thinking about whether there is an easier way to specify the scope of css.
## tips
If you are accessing this plugin from an old system,It is best to use the `includes` attribute to support your new components.Avoid old style confusion.If it is a new system,Feel free to use it boldly.**global-className**can specify global style
## install
```bash
npm i react-css-module-plugin --dev
// or
yarn add react-css-module-plugin --dev
```
## Usage
```js
// webpack.config.js
const ReactCssModulePlugin = require("react-css-module-plugin");
module.exports = {
    // ...some config
    plugins:[
        new ReactCssModulePlugin({ preStyle:'.less', preFile:["js","jsx"] })
    ]
}
```
## Props
* preStyle: .less、.scss、.sass or .css.**necessary**,Represents which style file you will deal with
* preFile: ["js","jsx","ts","tsx"],Some or all of them,**necessary**,Represents what kind of react file to process.
* includes: type Array,Which files are only processed.
* excludes: type Array,Which files are not processed.






