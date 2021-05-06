const express = require('express');
const config = require('./config.json');
const PORT = process.env.PORT || config.port;
const { urlencoded, json } = require('body-parser');
const Installer = require('./installer');

const app = express();

app.use(urlencoded({ extended: true }));
app.use(json());

app.use(express.static('client'));

Installer.install(app, express);

app.listen(PORT, () => {
    console.log(`server listen on port: ${PORT}`);
});