process.env.DEBUG = 'all'
import cds from '@sap/cds';
import { serve } from './serve.js'

const model = 'entity Browser {key ID: Integer; name: String}';
const csn = cds.compile(model);

const main = (lib) => {
    const a = require(lib);

    const appDiv = document.getElementById('app');
    const pre = document.createElement('pre');
    pre.textContent = 'Loaded: ' + JSON.stringify(a, null, 2);
    appDiv.appendChild(pre);

}

// main('./lib.js');
window.main = main;

const appDiv = document.getElementById('app');
const pre = document.createElement('pre');
pre.textContent = 'Compiled:\n\n' + JSON.stringify(csn.definitions, null, 2);
appDiv.appendChild(pre);

// const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
// worker.postMessage({ id: 1, model });

// worker.addEventListener('message', event => {
//     const { result, error } = event.data;
//     const resultPre = document.createElement('pre');
//     if (error) {
//         resultPre.textContent = `Worker Error:\n\n${error}`;
//     }
//     else {
//         resultPre.textContent = 'Worker Compiled:\n\n' + JSON.stringify(result.definitions, null, 2);
//     }
//     appDiv.appendChild(resultPre);
// });

const response = await serve();
const responsePre = document.createElement('pre');
responsePre.textContent = `OData Response:\n\n${JSON.stringify(JSON.parse(response.body), null, 2)}`;
appDiv.appendChild(responsePre);
