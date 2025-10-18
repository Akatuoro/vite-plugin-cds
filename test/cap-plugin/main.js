import cds from '@sap/cds';

const model = 'entity Browser {key ID: Integer; name: String}';
const csn = cds.compile(model);

const appDiv = document.getElementById('app');
const pre = document.createElement('pre');
pre.textContent = 'Compiled:\n\n' + JSON.stringify(csn.definitions, null, 2);
appDiv.appendChild(pre);
