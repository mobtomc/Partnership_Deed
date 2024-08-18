const routes=require('express').Router();
const controller=require('../controller/controller');


routes.route('/api/partnership-deed')
    .post(controller.createPartnershipDeed)

    //search

routes.route('/api/searchPartnershipDeeds')
    .get(controller.searchPartnershipDeeds)

//id
routes.route('/api/partnership-deed/:id')
    .get(controller.getPartnershipDeedById)

module.exports=routes