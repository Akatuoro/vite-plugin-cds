import cds from '@sap/cds';
import express from 'express';
import sqlite from 'better-sqlite3';

import { csvs } from './csvs';
import model from './index.cds'

export const serve = async () => {
    const csn = cds.compile(model);

    await sqlite.initialized;

    const app = express();
    cds.model = cds.compile.for.nodejs (csn)
    cds.db = await cds.connect.to('db');
    await cds.deploy(csn, null, csvs).to(cds.db);
    await cds.serve('all').from(csn).in(app);

    globalThis.app = app;

    // cds silently ignores system errors (exits process if cds.app?.server is set, nothing otherwise)
    cds.shutdown = (err) => console.error(err);

}
