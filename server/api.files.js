const fs = require('fs');

module.exports = class ApiFiles {
    static apiPath = `${__dirname}/api`;
    static templatesPath = `${__dirname}/templates/api.template`;
    
    static exists() {
        return fs.existsSync(this.apiPath);
    }

    static create(name) {
        const path = `${this.apiPath}/${name}.js`;

        if(!fs.existsSync(this.path)) {
            return console.error(`[create] ${this.path} not exsits`);
        }

        if(fs.existsSync(path)) {
            return console.error(`[create] ${name} allready exsits`);
        }
        
        let fd;
        try {
            
            fd = fs.openSync(path, 'a');
            const content = require(this.templatesPath)(name);
            fs.appendFileSync(fd, content, 'utf8');
        } catch (err) {
            return console.error(err);;
        } finally {
        
            if (!fd) {
                fs.closeSync(fd);
            } 
        }
    }

    static read(name) {
        const path = `${this.apiPath}/${name}.js`;
        if(!fs.existsSync(path)) {
            console.error(`[read] ${path} not exsits`);
            return null;
        }
        return fs.readFileSync(path);
    }

    static remove(name) {
        const path = `${this.apiPath}/${name}.js`;
        if(!fs.existsSync(path)) {
            return console.error(`[remove] ${path} not exsits`);
        }
        return fs.rmSync(path, { force: true });
    }

    static update(name, content) {
        const path = `${this.apiPath}/${name}.js`;
        if(!fs.existsSync(path)) {
            return console.error(`[update] ${path} not exsits`);
        }
        return fs.writeFileSync(path, content);
    }

    static list({ withFileType }) {
        let result = [];
        if(this.exists()) {
            result = fs.readdirSync(this.apiPath);
            if(!withFileType) {
                result = result.map(a => a.split('.')[0]).filter(Boolean);
            }
        }
        return result;
   
    }
}