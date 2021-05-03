
          module.exports = (router) => {
              router.get('/', (req, res) => {
                  return res.send('idan');
              });
              return router;
          }