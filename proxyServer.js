'use strict';
/*
 * Copyright (C) 2015 General Electric Company. All rights reserved.
 */

/**
 * Script for staring up the MaxQ view web server and proxy.
 *
 * @author 212028625
 *
 */

var express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    httpProxy = require('http-proxy'),
    fs = require('fs');

//Get settings from properties file
var settings = JSON.parse(fs.readFileSync('maxq.properties'));

//create the http proxy object
var proxyServ = httpProxy.createProxyServer({
    hostnameOnly: true,
    ignorePath: true
});

// Listen for the `error` event on `proxy`.
proxyServ.on('error', handleError);

var expressApp = express();
expressApp.use(bodyParser.urlencoded({'extended': 'true'}));
expressApp.use(bodyParser.json());
expressApp.use(express.static(__dirname));

var mpvConfig;
expressApp.get('/config', function (req, res) {

    try {
        mpvConfig = JSON.parse(fs.readFileSync('mpv-config.json'));
    } catch (e){
        console.log(e);
        res.sendStatus(404);
        return;
    }

    res.send(JSON.stringify(mpvConfig));
});

expressApp.post('/config', function (req, res) {
        var config = req.body;
        if (!config) {
            res.sendStatus(400);
            return;
        }

        fs.writeFile('mpv-config.json', JSON.stringify(config), 'utf-8', function (err) {
            if (err){
                console.log(err.toString());
                res.sendStatus(401);
                return;
            }

            mpvConfig = config;
            res.sendStatus(200);
        });
    }
);

// TODO: Move the routing to its own js file and refactor how the target urls are formed/deterrmined
//Listen for the PLS Endpoint for facilities
expressApp.get('/pls/facilities', function (req, res) {
        proxyServ.proxyRequest(req, res, {target: settings.plsURL + "/pls/facilities"});
    }
);

//Listen for the PLS Endpoint for care areas
expressApp.get('/pls/facilities/:facility/careareas', function (req, res) {
        var facility = req.params.facility;
        proxyServ.proxyRequest(req, res, {target: settings.plsURL + "/pls/facilities/" + facility + "/careareas"});
    }
);

//Listen for the PLS Endpoint for patients
expressApp.get('/pls/facilities/:facility/careareas/:careArea/patients', function (req, res) {
        var facility = req.params.facility;
        var careArea = req.params.careArea;
        proxyServ.proxyRequest(req, res, {target: settings.plsURL + "/pls/facilities/" + facility + "/careareas/" + careArea + '/patients'});
    }
);

//Listen for the request for the websocket URL
expressApp.get('/socket/:id', function (req, res) {
        var id = req.params.id;
        res.send(settings.solarflareURL + "/ws/umf?pid=" + id);
    }
);

expressApp.use(express.static(__dirname));

var http = require('http').Server(expressApp);
http.listen(settings.proxyPort, function () {
    console.log('listening on *:3000');
});

/**
 *
 * Error handler for the proxt;
 *
 * @param err the error that occurred
 * @param req http request object
 * @param res http response object
 */
function handleError(err, req, res) {
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });

    res.end('Error routing request to proxy.');
};

module.exports = http;





