
module.exports = (router) => {
    router.get('/', (req, res) => {
        return res.send('tst');
    });
    return router;
}