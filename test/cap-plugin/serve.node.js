import cds from '@sap/cds';
// import express from 'express';
import express from '../../node/polyfills/express.js';
import env from './cds-env.json' with { type: 'json' };
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
    // cds.root = '/home'
    cds.db = await cds.connect.to('db');
    await cds.deploy(csn).to(cds.db);
    await cds.serve('all', {}, env).from(csn).in(app);

    globalThis.app = app;

    app.listen(8080)


    const response = await app.handle({url: '/odata/v4/catalog/Books'})
    console.log('response', response);
}

await serve()
