const routes = require('express').Router();
const controller = require('../controller/controller');

// Route to create or update a partnership deed
routes.route('/api/partnership-deed')
    .post(controller.createOrUpdatePartnershipDeed);

// Route to search for partnership deeds
routes.route('/api/searchPartnershipDeeds')
    .get(controller.searchPartnershipDeeds);

// Route to get a partnership deed by ID
routes.route('/api/partnership-deed/:id')
    .get(controller.getPartnershipDeedById);

module.exports = routes;
