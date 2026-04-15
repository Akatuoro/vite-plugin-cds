import cds from '@sap/cds';
import sqlite from 'better-sqlite3';
import { repl } from '../lib/utils';

const model = `
entity Books {
    key ID: Integer;
    title: String;
}`;

const csvs = { 'Books.csv': `
ID,title
1,Hitchhiker
`}

const csn = cds.compile(model);
await sqlite.initialized;

cds.db = await cds.connect.to('db');
await cds.deploy(csn, null, csvs).to(cds.db);


const { Books } = cds.entities
await repl(async () => await cds.ql `select from Books { title }`)
await repl(async () => await INSERT.into(Books).entries({ ID: 2, title: 'LOTR' }))
await repl(async () => await cds.ql `select from Books { ID, title }`)
await repl(async () => await UPDATE.entity(Books).set({ title: 'LOTR 2' }).where({ ID: 2 }))
await repl(async () => await cds.ql `select from Books { ID, title }`)
await repl(async () => await DELETE.from(Books).where({ ID: 2 }))
await repl(async () => await cds.ql `select from Books { ID, title }`)

