import cds from '@sap/cds';
import express from 'express';
import env from './cds-env.json';

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

    const app = express();
    await cds.serve('all', {}, env).from(csn).in(app);

    window.app = app;

    app.listen(8080)
}
