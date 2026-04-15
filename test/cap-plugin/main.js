process.env.DEBUG = 'all'
import cds from '@sap/cds';
import { serve } from './serve.js'

function set(name, content) {
    document.getElementById(name).textContent = content
}

const model = 'entity Books {key ID: Integer; name: String}';
const csn = cds.compile(model);

set('compiled', 'Compiled:\n\n' + JSON.stringify(csn.definitions, null, 2));

const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
worker.postMessage({ id: 1, model });

worker.addEventListener('message', event => {
    const { result, error } = event.data;
    if (error) {
        set('worker-compiled', `Worker Error:\n\n${error}`);
    }
    else {
        set('worker-compiled', 'Worker Compiled:\n\n' + JSON.stringify(result.definitions, null, 2));
    }
});

const response = await serve();
set('odata', `OData Response:\n\n${JSON.stringify(JSON.parse(response.body), null, 2)}`)
