import cds from '@sap/cds';
import express from 'express';
import env from './cds-env.json';
import fs from 'fs';


export const serve = async () => {

    const model = `
    service CatalogService {
        entity Books {
            key ID: Integer;
            title: String;
        }
    }`;
    const csn = cds.compile(model);

    // const modules = import.meta.glob(['./../../node_modules/@sap/cds/lib/srv/protocols/*'])
    // window.modules = modules

    fs.writeFileSync('/home/.cdsrc.json', JSON.stringify(env));
    fs.writeFileSync('/home/package.json', `{
        "name": "fake",
        "cds": {}
    }`)

    console.log(fs.files);

    const app = express();
    cds.root = '/home'
    cds.env = cds.env.for(cds);
    console.log(cds.env);
    cds.requires = cds.env.requires;
    const o = {
        impl: '@cap-js/sqlite',
        credentials: { url: ':memory:' },
        kind: 'sqlite'
    }
    cds.db = await cds.connect.to('db');
    await cds.deploy(csn).to(cds.db);
    await cds.serve('all', {}, env).from(csn).in(app);

    globalThis.app = app;

    app.listen(8080)


    const response = await app.handle({url: '/odata/v4/catalog/Books'})
    console.log(response);
}
