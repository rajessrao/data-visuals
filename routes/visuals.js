'use strict';

var express = require('express');
var jwt = require('jsonwebtoken');
var config = require('../config');
var log = require('../utils/Logger');
var visualService = require('../services/VisualsService');

let router = express.Router();
let sampleError = {
    type: 'ErrorType',
    message: 'Error occured',
    messageCode: 1052 // Optional message code (numeric)
};

/* router.use(function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
}); */

/**
 * @swagger
 * /visuals:
 *   get:
 *     summary: Get data
 *     description: Returns data
 *     tags:
 *       - Visuals
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successful
 *       500:
 *         description: Server Error
 */
router.get('/', function (req, res) {
    try {
        let result = visualService.sampleData('');
        res.status(200).send({ results: result });
    } catch (e) {
        log.error('Route failed with error', e);
        res.status(500).send(e);
    }
});

/**
 * @swagger
 * /visuals/somesample:
 *   post:
 *     summary: sample post route
 *     description: Returns the sample data
 *     tags:
 *       - Visuals
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: device
 *         description: device Name
 *         in: body
 *         required: true
 *         type: string
 *         example: hero-grinder
 *     responses:
 *       200:
 *         description: Successful
 *       500:
 *         description: Server Error
 */
router.post('/somesample', function (req, res) {
    try {
        visualService.refreshMachineData();
        
        var result = visualService.sampleData(req.body.machine);

        result.then(function (data) {
            res.status(200).send({ results: data });
        })
    } catch (e) {
        log.error('Route /somesample/ failed with error', e);
        res.status(500).send(e);
    }
});

module.exports = router;