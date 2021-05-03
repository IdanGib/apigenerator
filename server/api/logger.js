
module.exports = (router) => {
    router.get('/', (req, res) => {
        return res.send('logger');
    });
    return router;
}