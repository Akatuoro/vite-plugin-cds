import sqlite3 from '../../node/polyfills/better-sqlite3.js';

await sqlite3.initialized;

const db = new sqlite3();

try {
    db.exec("create table t(a);");
    db.exec("insert into t(a) values(10),(20),(30);");
    const row = db.prepare('SELECT * FROM t').get();
    console.log(row.a);

    const r = db.exec("select * from t");
    console.log(r);
} finally {
    db.close();
}
