const fs = require('fs');
const dir = `${__dirname}/logs`;
const logFile = 'logs.txt';
const fullpath = `${dir}/${logFile}`;
if(!fs.existsSync(dir)) {
   fs.mkdirSync(dir); 
}
module.exports = class Logger {
    static LOGS_PATH = fullpath;

    static log(text, newLine) {
        if(!text) {
            return;
        }
        Logger.append(text, true);
    }

    static clear() {
        if(fs.existsSync(fullpath)) {
            fs.rmSync(fullpath);
            Logger.append('');
        }
    }

    static append(text, newLine) {
        const line = `${text}${newLine ? '\r\n' : ''}`;
        const fd = fs.appendFileSync(fullpath, line, { flag: 'a' });
        if(fd) {    
            fs.closeSync(fd);
        }
    }

    static exists() {
        return fs.existsSync(fullpath);
    }
}