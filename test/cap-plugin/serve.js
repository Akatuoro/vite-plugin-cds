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

    const csvs = {
        'CatalogService-Books.csv': `
            ID,title
            2,Hitchhiker
        `
    }

    await sqlite.initialized;

    const app = express();
    cds.db = await cds.connect.to('db');
    await cds.deploy(csn, null, csvs).to(cds.db);
    await cds.serve('all').from(csn).in(app);

    globalThis.app = app;

    // cds silently ignores system errors (exits process if cds.app?.server is set, nothing otherwise)
    cds.shutdown = (err) => console.error(err);

    const { INSERT } = cds.ql;
    const { CatalogService } = cds.services;
    const { Books } = CatalogService.entities;
    await INSERT.into(Books).entries({ ID: 1, title: 'LOTR' });

    console.debug('app started');
    const response = await app.handle({url: '/odata/v4/catalog/Books'})
    console.debug('response', response);
    return response;
}
