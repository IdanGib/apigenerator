module.exports = (name) => {
    return `\nmodule.exports = (router) => {
    router.get('/', (req, res) => {
        return res.send('${name}');
    });
    return router;
}`;
}