import cds from '@sap/cds';
import express from 'express';
import env from './cds-env.json';
import fs from 'fs';
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

    // TODO: some default configurations are loaded by checking the package.json and cds-plugin.js of npm dependencies -> provide preload
    fs.writeFileSync('/home/.cdsrc.json', JSON.stringify(env));

    const app = express();
    cds.root = '/home'
    cds.env = cds.env.for(cds);
    cds.requires = cds.env.requires;
    cds.db = await cds.connect.to('db');
    await cds.deploy(csn).to(cds.db);
    await cds.serve('all', {}, env).from(csn).in(app);

    globalThis.app = app;

    app.listen(8080)

    // cds silently ignores system errors (exits process if cds.app?.server is set, nothing otherwise)
    cds.shutdown = (err) => console.error(err);

    console.debug('app started');
    const response = await app.handle({url: '/odata/v4/catalog/Books'})
    console.log('response', response);
}
