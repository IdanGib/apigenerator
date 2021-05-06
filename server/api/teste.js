
module.exports = (router) => {
    router.get('/', (req, res) => {
        return res.send('teste');
    });
    return router;
}