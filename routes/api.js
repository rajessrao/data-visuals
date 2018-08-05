'use strict';

var express = require('express');
// var usersEndpoint = require('./users');
var dataEndpoint = require('./visuals');

var router = express.Router();

//---------------------------------------------------------------
// API Route specification
//---------------------------------------------------------------
// router.use('/users', usersEndpoint);
router.use('/visuals', dataEndpoint);

//---------------------------------------------------------------
// Swagger API Specification - swagger-jsdoc
//---------------------------------------------------------------
var swaggerJSDoc = require('swagger-jsdoc');

var options = {
	swaggerDefinition: {
		info: {
			title: 'Data Visuals Service API',
			description: 'Data Visuals service API is ExpressJS based microservices',
			version: '0.0.1',
			contact: {
				email: '',
				name: ''
			},
			license: {
				name: '',
				url: ''
			}
		},
		schemes: [
			'http',
			'https'
		],
		basePath: '/api',
		tags: [
			/* {
				name: 'Users',
				description: 'Get details of users'
			}, */
			{
				name: 'Visuals',
				description: 'Get data with details'
			}
		],
		externalDocs: {
			description: 'More information',
			url: ''
		}
	},
	apis: ['routes/api.js', 'routes/visuals.js'],//, 'routes/users.js'],
};

var swaggerSpec = swaggerJSDoc(options);

//---------------------------------------------------------------
// Expose swagger.json at /api/swagger.json
//---------------------------------------------------------------
router.get('/swagger.json', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.send(swaggerSpec);
});

module.exports = router;