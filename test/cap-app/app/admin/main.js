
// endpoint injected via vite.config.js
fetch(endpoint)
    .then(response => response.json())
    .then(data => {
        const appDiv = document.getElementById('app');
        const pre = document.createElement('pre');
        pre.textContent = 'OData response from ' + endpoint + ':\n\n' + JSON.stringify(data, null, 2);
        appDiv.appendChild(pre);
    });
