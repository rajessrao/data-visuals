'use strict';

var express = require('express');
var usersEndpoint = require('./users');

var router = express.Router();

//---------------------------------------------------------------
// API Route specification
//---------------------------------------------------------------
router.use('/users', usersEndpoint);

//---------------------------------------------------------------
// Swagger API Specification - swagger-jsdoc
//---------------------------------------------------------------
var swaggerJSDoc = require('swagger-jsdoc');

var options = {
	swaggerDefinition: {
		info: {
			title: 'Auth Service API',
			description: 'Auth service API is ExpressJS based microservices',
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
		tags: [{
			name: 'Users',
			description: 'Get details of users'
		}],
		externalDocs: {
			description: 'More information',
			url: ''
		}
	},
	apis: ['routes/api.js', 'routes/users.js'],
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