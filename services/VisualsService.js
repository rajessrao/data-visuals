'use strict';
var config = require('../config');
var jwt = require('jsonwebtoken');

module.exports = {
    sampleData: function (device) {
        let Res = '';
        if (device !== '') {
            Res = 'Data is successful for ' + device;
        } else {
            Res = 'Success From service..';
        }
        return Res;
    }
}