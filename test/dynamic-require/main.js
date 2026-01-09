

const main = (lib) => {
    const a = require(lib);

    const appDiv = document.getElementById('app');
    const pre = document.createElement('pre');
    pre.textContent = 'Loaded: ' + JSON.stringify(a, null, 2);
    appDiv.appendChild(pre);

}

main('./lib');
window.main = main;
