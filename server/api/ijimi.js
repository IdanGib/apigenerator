
          module.exports = (router) => {
              router.get('/', (req, res) => {
                  return res.send('ijimi');
              });
              return router;
          }