
const config = require('./config.json');
const child_process = require('child_process');
const apiFiles = require('./api.files');
const PORT = process.env.PORT || config.port;

module.exports = (express) => {
    const router = express.Router();
    router.get('/installed', (req, res) => {
        const data = apiFiles.list({ withFileType: false });
        const err = null;
        return res.json({ data, err });
    });

    router.get('/read/:name', (req, res) => {
        const { name } = req.params;
        let data = '';
        if(!name) {
            return res.json({ data, err: 'no name' });
        }
        const buffer = apiFiles.read(name);
        data = buffer?.toString();
        return res.json({ data, err: '' });
    });

    router.post('/create/:name', (req, res) => {
        const { name } = req.params;
        if(!name) {
            return res.json({ err: 'no name', data: false });
        }
        const data = apiFiles.create(name);
        return res.json({ err: '', data });
    });

    router.put('/update/:name', (req, res) => {
        const { name } = req.params;
        const { content } = req.body;
        if(!name) {
            return res.json({ err: 'no name', data: false });
        }
        const data = apiFiles.update(name, content);
        return res.json({ err: '', data });
    });

    router.delete('/delete/:name', (req, res) => {
        const { name } = req.params;
        if(!name) {
            return res.json({ err: 'no name', data: false });
        }
        const data = apiFiles.remove(name);
        return res.json({ err: '', data });
    });


    router.get('/package', (req, res) => {
        return res.sendFile(`${__dirname}/package.json`);
    });

    router.get('/allow-packages', (req, res) => {
        const data = config.allowPackages;
        const err = null;
        return res.json({ data, err });
    });

    router.get('/url/:name', (req, res) => {
        const { name } = req.params;
        let data = null;
        let err = null;
        if(name && apiFiles.exists(name)) {
            data = `http://localhost:${PORT}/api/${name}`;
        } else {
            err = { msg: 'not exists: ' + name};
        }
        return res.json({ data, err });
    });

    router.post('/installpackage', (req, res) => {
        const { name } = req.body;
        const err = {};
        
        if(!config.allowPackages.includes(name)) {
            return console.error(`${name} - forbidden package`);
        }
        const command =  `npm install --save ${name}`;
        const { output } = child_process.spawnSync(command, { cwd: `${__dirname}`, shell: true });
        const data =  output.map(o => o.toString());
        return res.json({ data, err });
    });

    return router;
}
