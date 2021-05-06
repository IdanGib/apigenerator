const apiFiles = require('./api.files');

module.exports = class Installer {
    static installOne(newRouter, apiRouter, name, apiPath) {
        const filePath = `${apiPath}/${name}`;
        const apiPlugin = require(filePath);

        if(typeof apiPlugin !== 'function') {
            return console.error(`${name} not export a function`);
        }
        
        const router = apiPlugin(newRouter);
        const path = name.split('.')[0];

        if(!path) {
            return console.error(`invalid path: ${path}`);
        }

        if(router) {
            try {
                apiRouter.use(`/${path}`, router);
            } catch(e) {
                console.error(e.message);
            }
  
        }
    }
    
    static install(app, express) {
        const apiPath = apiFiles.apiPath;
        if(!apiFiles.exists()) {
            return console.error('no api directory');
        }

        const api = require('./api');
        const apiRouter = api(express);

        const files = apiFiles.list({ withFileType: true });

        for(const name of files) {
            const newRouter = express.Router();
            this.installOne(newRouter, apiRouter, name, apiPath);
        }

        app.use('/api', apiRouter);
    }



}