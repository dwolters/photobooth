#!/usr/bin/node
const path = require('path');
const express = require('express');
const config = require('./config.json');
const http = require('http');

let port = config.port;
let pubDir = path.resolve(config.publicDir);

let app = express();
app.set('port', port);

app.use('/capture', require('./routes/capture'));
app.use('/list', require('./routes/list'));
app.use('/convert', require('./routes/convert'));
app.use('/jquery', express.static('node_modules/jquery/dist'));
app.use('/pictures', express.static(config.smallPicturesDir));
app.use(express.static(pubDir));

let server = http.createServer(app);
server.listen(port);
console.log('Server is running on port: ' + port);
