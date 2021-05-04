
module.exports = (router) => {
    router.get('/', (req, res) => {
        return res.send('test3');
    });
    return router;
}