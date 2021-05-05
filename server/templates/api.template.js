module.exports = (name) => {
    return `module.exports = (router) => {
    router.get('/', (req, res) => {
        return res.send('${name}');
    });
    return router;
}`;
}