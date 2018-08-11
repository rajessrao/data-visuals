'use strict';
var config = require('../config');
var jwt = require('jsonwebtoken');
var http = require('http');
var https = require('https');
var Request = require('request');
var computeService = require('./ComputeService');

module.exports = {
    sampleData: async function (machine) {
        let Res = '';
        if (machine !== '') {
            Res = 'Data is successful for ' + machine;
        } else {
            Res = 'Success From service..';
        }
        return Res;
    },
    getMachineData: async function (machine, limit = 6000) { // DM_hero_sm_honn_mtl, DM_hero_sm_frd_mtl, DM_hero_sm_fb_mtl
        if (machine !== '') {
            https.get(config.apiEndpoint + '&a=find&ot=T_heromotocorp_iirp.' + machine + '&lmt=' + limit, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    var processedData = computeService.plotDataDateShiftWise(data, 'frd');
                    console.log(processedData);
                    return processedData;
                });
            }).on("error", (err) => {
                console.log("Error: " + err.message);
            });
        }
    }
}