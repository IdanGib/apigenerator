
          module.exports = (router) => {
              router.get('/', (req, res) => {
                  return res.json({ test: 'jojoj' });
              });
              return router;
          }