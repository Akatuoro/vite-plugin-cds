const model = 'entity Browser {key ID: Integer; name: String}';
const appDiv = document.getElementById('app');

const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
worker.postMessage({ id: 1, model });

worker.addEventListener('message', event => {
    const { result, error } = event.data;
    const resultPre = document.createElement('pre');
    if (error) {
        resultPre.textContent = `Worker Error:\n\n${error}`;
    }
    else {
        resultPre.textContent = 'Worker Compiled:\n\n' + JSON.stringify(result.definitions, null, 2);
    }
    appDiv.appendChild(resultPre);
});
