
module.exports = (router) => {
    router.get('/', (req, res) => {
        return res.send('Test');
    });
    return router;
}