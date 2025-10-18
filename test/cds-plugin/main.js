import cdsModel from './index.cds';

const appDiv = document.getElementById('app');
const pre = document.createElement('pre');
pre.textContent = 'CDS Model:\n\n' + JSON.stringify(cdsModel, null, 2);
appDiv.appendChild(pre);