
/// <reference path="../typings/moment/moment.d.ts" />
/// <reference path="../typings/lodash/lodash.d.ts" />
/// <reference path="../typings/whatwg-fetch/whatwg-fetch.d.ts" />
/// <reference path="../typings/es6-promise/es6-promise.d.ts" />


///<reference path="../node_modules/rx/ts/rx.all.d.ts"/>
///<reference path="../node_modules/rx/ts/iterable.es6.d.ts"/>
///<reference path="../node_modules/webrx/dist/web.rx.d.ts"/>

/***
 * Webpack's require
 */
declare var require: {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};