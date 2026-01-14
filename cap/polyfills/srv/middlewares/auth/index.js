// needs to be cjs to avoid ESM interop issues at runtime
const { requires } = require('@sap/cds');
const basic = require('@sap/cds/lib/srv/middlewares/auth/basic-auth.js');

module.exports = function(o) {
    const options = { ...requires.auth, ...o }
    return basic(options)
}