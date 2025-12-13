import cds from '@sap/cds';
import express from '../../node/polyfills/express.js';
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
await cds.serve('all', {}, env).from(csn).in(app);

globalThis.app = app;

app.listen(8080)
await app.handle({url: '/odata/v4/catalog'})