import cds from '@sap/cds';
import express from 'express';
import sqlite from 'better-sqlite3';


export const serve = async () => {

    const model = `
    service CatalogService {
        entity Books {
            key ID: Integer;
            title: String;
        }
    }`;
    const csn = cds.compile(model);

    await sqlite.initialized;

    const app = express();
    cds.db = await cds.connect.to('db');
    await cds.deploy(csn).to(cds.db);
    await cds.serve('all').from(csn).in(app);

    globalThis.app = app;

    // cds silently ignores system errors (exits process if cds.app?.server is set, nothing otherwise)
    cds.shutdown = (err) => console.error(err);

    console.debug('app started');
    const response = await app.handle({url: '/odata/v4/catalog/Books'})
    console.log('response', response);
    return response;
}
