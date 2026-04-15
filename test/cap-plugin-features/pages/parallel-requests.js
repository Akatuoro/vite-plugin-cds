process.env.DEBUG = 'all'
import cds from '@sap/cds';
import express from 'express';
import sqlite from 'better-sqlite3';
import { set } from '../lib/utils';

const sleep = t => new Promise(r => setTimeout(r, t));

const serve = async () => {
    const model = `
    @requires: 'admin'
    service AdminService {
        entity Books {
            key ID: Integer;
            title: String;
            createdBy: String @cds.on.insert: $user;
            updatedBy: String @cds.on.update: $user;
        }
    }`;
    const csn = cds.compile(model);

    await sqlite.initialized;

    const app = express();
    cds.model = cds.compile.for.nodejs (csn)
    cds.db = await cds.connect.to('db');
    await cds.deploy(csn).to(cds.db);
    await cds.serve('all').from(csn).in(app);

    globalThis.app = app;

    // cds silently ignores system errors (exits process if cds.app?.server is set, nothing otherwise)
    cds.shutdown = (err) => console.error(err);
}

const appDiv = document.getElementById('app');
await serve();
(async () => {

    const { INSERT, UPDATE, DELETE } = cds.ql;
    const { AdminService } = cds.services;
    const { Books } = AdminService.entities;

    let id = 1;
    async function insert(name, t = 100) {
        const user = { id: name, name, roles: ['admin'] }
        await AdminService.tx({ user }, async tx => {     // <-- setting context
            const book = { ID: id++, title: 'should be created by: ' + name };
            const query = INSERT.into(Books).entries(book);
            console.debug('insert', name)
            await tx.run(query)
        })
    }


    {
        await DELETE.from(Books)
        await Promise.race([Promise.all([insert('alice'), insert('bob'), insert('ceric', 50)]), sleep(10000)])

        const result = await cds.ql `select from ${Books} {title, createdBy, updatedBy}`
        console.info('result after insert:', JSON.stringify(result, null, 2))

        set('insert', 'Result insert:\n\n' + JSON.stringify(result, null, 2))
    }


    async function insertAndUpdate(name, t = 100) {
        const user = { id: name, name, roles: ['admin'] }
        await AdminService.tx({ user }, async tx => {     // <-- setting context
            const book = { ID: id++, title: 'should be created and updated by: ' + name };
            const query = INSERT.into(Books).entries(book);
            console.debug('insert', name)
            await tx.run(query)
            console.debug('wait', name)
            await new Promise(resolve => setTimeout(resolve, t))
            const update = UPDATE.entity(Books).set(book).where({ ID: book.ID })
            console.debug('update', name)
            await tx.run(update)
        })

    }

    {
        await DELETE.from(Books)
        await Promise.race([Promise.all([insertAndUpdate('alice'), insertAndUpdate('bob'), insertAndUpdate('ceric', 50)]), sleep(1000)])

        const result = await cds.ql `select from ${Books} {title, createdBy, updatedBy}`
        console.info('result after insertAndUpdate:', JSON.stringify(result, null, 2))

        set('insertAndUpdate', 'Result insertAndUpdate:\n\n' + JSON.stringify(result, null, 2))
    }

    console.debug('done')
})().catch(console.error);
