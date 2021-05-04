
module.exports = (router) => {
    router.get('/', (req, res) => {
        return res.send('testtest2');
    });
    return router;
}