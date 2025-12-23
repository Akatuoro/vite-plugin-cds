const cds = require('@sap/cds');

module.exports = function(o) {
    const options = { ...cds.requires.auth, ...o }
    return require('@sap/cds/lib/srv/middlewares/auth/basic-auth.js')(options)
}