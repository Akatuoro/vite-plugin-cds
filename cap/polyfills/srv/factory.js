const factory = function ServiceFactory (name, model, options) {
    return Promise.resolve(require('@sap/cds/srv/app-service.js'));
};
factory.b = true;
module.exports = factory;
