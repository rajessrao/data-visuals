'use strict';
var config = require('../config');
var jwt = require('jsonwebtoken');

module.exports = {
    sampleData: function () {
        const Res = 'Success From service..';
        return Res;
    }
}