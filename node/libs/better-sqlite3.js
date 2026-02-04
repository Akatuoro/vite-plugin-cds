import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { createBetterSqlite3Like } from './better-sqlite3-wasm-compat.js';


let _Database;
const init = () => {
    const fn = function(...args) {
        if (!_Database) throw new Error('Database not initialized')
        return new _Database(...args);
    };

    // OPFS warning is expected, see https://sqlite.org/forum/forumpost/6549a274f04ab0b4
    self.sqlite3ApiConfig = {
      warn: message => message?.includes('OPFS sqlite3_vfs') ? console.debug(message) : console.warn(message),
    }

    fn.initialized = sqlite3InitModule({ print: console.debug, printErr: console.error }).then(sqlite3 => {
        delete self.sqlite3ApiConfig;
        console.debug('sqlite3 initialized');
        _Database = createBetterSqlite3Like(sqlite3, { filename: ':memory:' }).Database;
        return _Database;
    }); // unable to use top-level await due to require('better-sqlite3').prototype

    return fn
}

globalThis.sqlite ??= init();
const Database = globalThis.sqlite;
export default Database;
export { Database, Database as __esModule };
