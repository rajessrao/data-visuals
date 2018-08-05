
'use strict';

var User = require('../models/user');
var userService = require('../services/UsersService');

module.exports = {
    init: function () {
        User.remove({}, function (err) {
            if (!err) {
                console.log('Collection removed.........');
                var user = {
                    firstName: 'Abcdef',
                    lastName: 'Xyz',
                    designation: 'someDesig',
                    organisation: 'someOrg',
                    phone: '9012345678',
                    addressLine1: 'Line 1',
                    addressLine2: 'Line 2',
                    landMark: 'Land mark',
                    city: 'City A',
                    state: 'State K',
                    country: 'India',
                    pincode: '500013',
                    email: 'sample@gmail.com',
                    password: 'sample',
                    admin: false,
                    adminType: ''
                };
                userService.createUser(user);
                console.log('Collection created and added sample data..................');
            }
        });
    }
}