'use strict';

var express = require('express');
var jwt = require('jsonwebtoken');
var config = require('../config');
var userService = require('../services/UsersService');
var log = require('../utils/Logger');

let router = express.Router();
let sampleError = {
    type: 'ErrorType',
    message: 'Error occured',
    messageCode: 1052 // Optional message code (numeric)
};
let User = {
    firstName: '',
    lastName: '',
    designation: '',
    organisation: '',
    phone: 0,
    addressLine1: '',
    addressLine2: '',
    landMark: '',
    city: '',
    state: '',
    country: '',
    pincode: 0,
    email: '',
    password: '',
    admin: false,
    adminType: ''
};

function clearUserRecord() {
    User.firstName = '';
    User.lastName = '';
    User.designation = '';
    User.organisation = '';
    User.phone = 0;
    User.addressLine1 = '';
    User.addressLine2 = '';
    User.landMark = '';
    User.city = '';
    User.state = '';
    User.country = '';
    User.pincode = 0;
    User.email = '';
    User.password = '';
}

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Returns all users with details
 *     tags:
 *       - Users
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
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        var tokenVerified = userService.verifyToken(token);
        if (tokenVerified.success) {
            var promise = userService.getAllUsers();

            promise.then(function (data) {
                // Do something (if required) with the data, then send it to the client
                res.status(200).send(data);
            });

            promise.catch(function (error) {
                // Never send stack traces to the client.
                log.error('Failed')
                res.status(500).send(error);
            });
        } else {
            log.error('Failed to authenticate token.')
            res.status(500).send('Failed to authenticate token.');
        }
    } catch (e) {
        // Use a good logging framework for logging to file
        log.error('Route /users/ failed with error', e);
        res.status(500).send(e);
    }
});

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: register the user
 *     description: Returns the user
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: name of the user to fetch
 *         in: body
 *         required: true
 *         type: string
 *         example: rajesh
 *       - name: email
 *         description: email of the user to fetch
 *         in: body
 *         required: true
 *         type: string
 *         example: rajesh@gmail.com
 *       - name: password
 *         description: password of the user to fetch
 *         in: body
 *         required: true
 *         type: string
 *         example: rajesh
 *     responses:
 *       200:
 *         description: Successful
 *       500:
 *         description: Server Error
 */
router.post('/register', function (req, res) {
    try {
        var promise = userService.getUser(req.body.email, req.body.password);

        promise.then(function (data) {
            if (data.length === 0) {

                User.firstName = req.body.firstName;
                User.lastName = req.body.lastName;
                User.designation = req.body.designation;
                User.organisation = req.body.organisation;
                User.phone = req.body.phone;
                User.addressLine1 = req.body.addressLine1;
                User.addressLine2 = req.body.addressLine2;
                User.landMark = req.body.landMark;
                User.city = req.body.city;
                User.state = req.body.state;
                User.country = req.body.country;
                User.pincode = req.body.pincode;
                User.email = req.body.email;
                User.password = req.body.password;

                const user = userService.createUser(User);
                clearUserRecord();
                res.status(200).send({ user: user, message: 'User registered successfully.' });
            }
        });

        promise.catch(function (error) {
            log.error('Failed')
            res.status(500).send(error);
        });
    } catch (e) {
        log.error('Route /users/ failed with error', e);
        res.status(500).send(e);
    }
});

/**
 * @swagger
 * /users/authenticate:
 *   post:
 *     summary: Authenticate the user
 *     description: Returns the token
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: email of the user to fetch
 *         in: body
 *         required: true
 *         type: string
 *         example: rajesh
 *       - name: password
 *         description: password of the user to fetch
 *         in: body
 *         required: true
 *         type: string
 *         example: rajesh
 *     responses:
 *       200:
 *         description: Successful
 *       500:
 *         description: Server Error
 */
router.post('/authenticate', function (req, res) {
    try {
        var promise = userService.getUser(req.body.email, req.body.password);

        promise.then(function (data) {
            var token = jwt.sign({ user: data[0] }, config.secret, {
                expiresIn: 1440 // expires in 24 hours
            });
            data = {
                success: true,
                user: data[0],
                token: token
            };
            res.status(200).send(data);
        });

        promise.catch(function (error) {
            log.error('Failed')
            res.status(500).send(error);
        });
    } catch (e) {
        log.error('Route /users/ failed with error', e);
        res.status(500).send(e);
    }
});

/**
 * @swagger
 * /users/changepwd:
 *   post:
 *     summary: change password of the user
 *     description: Returns the user
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: email of the user to fetch
 *         in: body
 *         required: true
 *         type: string
 *         example: rajesh
 *       - name: oldpassword
 *         description: password of the user to fetch
 *         in: body
 *         required: true
 *         type: string
 *         example: rajesh
 *       - name: newpassword
 *         description: password of the user to fetch
 *         in: body
 *         required: true
 *         type: string
 *         example: rajesh
 *     responses:
 *       200:
 *         description: Successful
 *       500:
 *         description: Server Error
 */
router.post('/changepwd', function (req, res) {
    try {
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        var tokenVerified = userService.verifyToken(token);
        if (tokenVerified.success) {
            var promise = userService.getUser(req.body.email, req.body.oldpassword);

            promise.then(function (data) {
                if (data) {
                    userService.changePwd(req.body.email, req.body.oldpassword, req.body.newpassword);
                    res.status(200).send({ message: 'Password changed successfully.' });
                }
            });

            promise.catch(function (error) {
                log.error('Failed')
                res.status(500).send(error);
            });
        } else {
            log.error('Failed to authenticate token.')
            res.status(500).send('Failed to authenticate token.');
        }
    } catch (e) {
        log.error('Route /users/ failed with error', e);
        res.status(500).send(e);
    }
});

module.exports = router;

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