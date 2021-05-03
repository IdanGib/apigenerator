const express = require('express');
const router = express.Router();
const { urlencoded, json } = require('body-parser');
const api = require('./api');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(urlencoded({ extended: true }));
app.use(json());

app.use(express.static('client'));

api.install(app, express);

app.listen(PORT, () => {
    console.log(`server listen on port: ${PORT}`);
});