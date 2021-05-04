
module.exports = (router) => {
    router.get('/', (req, res) => {
        return res.send('mako');
    });
    return router;
}