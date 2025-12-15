import sqlite3InitModule from '@sqlite.org/sqlite-wasm'; // however you load it
import { createBetterSqlite3Like } from './better-sqlite3-wasm-compat.js';

let _Database;

const Database = function(...args) {
    if (!_Database) throw new Error('Database not initialized')
    return new _Database(...args);
}

Database.initialized = new Promise((resolve, reject) => sqlite3InitModule({ print: console.log, printErr: console.error }).then(sqlite3 => {
    _Database = createBetterSqlite3Like(sqlite3, { filename: ':memory:' }).Database;
    resolve(_Database);
})); // unable to use top-level await due to require('better-sqlite3').prototype

export default Database;
export { Database };
