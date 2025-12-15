import cds from '@sap/cds';
import express from '../../node/polyfills/express.js';
// import express from 'express';
import fs from 'fs';

const env = JSON.parse(fs.readFileSync('cds-env.json'));
// import env from './cds-env.json';

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

const app = express();
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
// const response = await app.handle({url: '/odata/v4/catalog'})

// console.log(response);

const response2 = await app.handle({url: '/odata/v4/catalog/Books'})

console.log(response2);
