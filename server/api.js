const fs = require('fs');
const apiPath = `${__dirname}/api`;
module.exports = class API {
    static apiRouter = null;
    static express = null;

    static create(name) {
        const path = `${apiPath}/${name}.js`;

        if(!fs.existsSync(apiPath)) {
            return console.error(`${apiPath} not exsits`);
        }

        if(fs.existsSync(path)) {
            return console.error(`${name} allready exsits`);
        }
        
        let fd;
        try {
          fd = fs.openSync(path, 'a');
          const content = `
module.exports = (router) => {
    router.get('/', (req, res) => {
        return res.send('${name}');
    });
    return router;
}`;
          fs.appendFileSync(fd, content, 'utf8');
        } catch (err) {
            console.error(err);
          return null;
        } finally {
          if (fd !== undefined)
            fs.closeSync(fd);
        }
    }

    static read(name) {
        const path = `${apiPath}/${name}.js`;
        if(!fs.existsSync(path)) {
            console.error(`${path} not exsits`);
            return null;
        }
        return fs.readFileSync(path);
    }

    static delete(name) {
        const path = `${apiPath}/${name}.js`;
        if(!fs.existsSync(path)) {
            return console.error(`${path} not exsits`);
        }
        return fs.rmSync(path, { force: true });
    }

    static update(name, content) {
        const path = `${apiPath}/${name}.js`;
        if(!fs.existsSync(path)) {
            return console.error(`${path} not exsits`);
        }
        return fs.writeFileSync(path, content);
    }

    static installOne(newRouter, apiRouter, name) {
        const filePath = `${apiPath}/${name}`;
        const router = require(filePath)(newRouter);
        const path = name.split('.')[0];
        if(!path) {
            return console.error(`invalid path: ${path}`);
        }
        apiRouter.use(`/${path}`, router);
    }

    static install(app, express) {
        const apiRouter = express.Router();
        this.express = express;
        if(!fs.existsSync(apiPath)) {
            return console.error('no api directory');
        }

        const files = fs.readdirSync(apiPath);
        for(const name of files) {
            const newRouter = express.Router();
            this.installOne(newRouter, apiRouter, name);
        }

    
        apiRouter.get('/installed', (req, res) => {
            return res.json({ data: this.getRoutes(), err: null });
        });

        apiRouter.get('/read/:name', (req, res) => {
            const { name } = req.params;
            let data = '';
            if(!name) {
                return res.json({ data, err: 'no name' });
            }
            const buffer = this.read(name);
            data = buffer?.toString();
            return res.json({ data, err: '' });
        });

        apiRouter.post('/create/:name', (req, res) => {
            const { name } = req.params;
            if(!name) {
                return res.json({ err: 'no name', data: false });
            }
            const data = this.create(name);
            this.installOne(this.express.Router(), this.apiRouter, name);
            return res.json({ err: '', data });
        });

        apiRouter.put('/update/:name', (req, res) => {
            const { name } = req.params;
            const { content } = req.body;
            
            if(!name) {
                return res.json({ err: 'no name', data: false });
            }
            const data = this.update(name, content);

            return res.json({ err: '', data });
        });

        apiRouter.delete('/delete/:name', (req, res) => {
            const { name } = req.params;
            if(!name) {
                return res.json({ err: 'no name', data: false });
            }
            const data = this.delete(name);
            return res.json({ err: '', data });
        });


        this.apiRouter = apiRouter;
        console.log(this.getRoutes());
        app.use('/api', apiRouter);

    }

    static getRoutes() {
        if(!fs.existsSync(apiPath)) {
            return [];
        }
        const apis = fs.readdirSync(apiPath);
        return apis.map(a => a.split('.')[0]).filter(Boolean);
    }

}