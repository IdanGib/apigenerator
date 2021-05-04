
module.exports = (router) => {
    router.get('/', (req, res) => {
        return res.send('test');
    });
    return router;
}