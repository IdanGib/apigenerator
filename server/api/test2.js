const moment = require('moment');

module.exports = (router) => {
    router.get('/', (req, res) => {
        return res.send('test2');
    });
    return router;
}