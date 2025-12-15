import cds from '@sap/cds';
import * as a from '@sap/cds/lib/srv/factory.js'
import { serve } from './serve.js'
// import { initializeSQLite } from './initsqlite.js'
import sqlite3 from 'better-sqlite3'
window.a = a

const model = 'entity Browser {key ID: Integer; name: String}';
const csn = cds.compile(model);

const appDiv = document.getElementById('app');
const pre = document.createElement('pre');
pre.textContent = 'Compiled:\n\n' + JSON.stringify(csn.definitions, null, 2);
appDiv.appendChild(pre);

const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
worker.postMessage({ id: 1, model });

worker.addEventListener('message', event => {
    const { result, error } = event.data;
    const resultPre = document.createElement('pre');
    if (error) {
        resultPre.textContent = `Worker Error:\n\n${error}`;
    }
    else {
        resultPre.textContent = 'Worker Compiled:\n\n' + JSON.stringify(result.definitions, null, 2);
    }
    appDiv.appendChild(resultPre);
});

await sqlite3.initialized;

const db = new sqlite3(':memory:', 'ct');
db.exec("create table t(a);");
db.exec("insert into t(a) values(10),(20),(30);");
const row = db.prepare('SELECT * FROM t').get();
console.log(row.a);

await serve();

