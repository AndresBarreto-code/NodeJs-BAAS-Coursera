const express = require('express');
const cors = require('cors');

const app = express();

const whitelist = ['http://localhost:3000','https://localhost:3443']

let corsOptionsDelegate = (req, callback) => {
    let corsOptions = whitelist.indexOf(req.header('Origin')) !== -1 ? { origin: true}: { origin: false}; 
    callback(null, corsOptions);
}

module.exports.cors = cors();
module.exports.corsWithOptions = cors(corsOptionsDelegate);