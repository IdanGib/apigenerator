
          module.exports = (router) => {
              router.get('/', (req, res) => {
                  return res.send('este');
              });
              return router;
          }