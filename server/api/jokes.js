const one_liner_joke = require('one-liner-joke');

module.exports = (router) => {
    router.get('/', (req, res) => {
      	const { body } = one_liner_joke.getRandomJoke();
        return res.json(body);
    });
    return router;
}