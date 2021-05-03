
module.exports = (router) => {
    router.get('/', (req, res) => {
        return res.send('files');
    });
    return router;
}