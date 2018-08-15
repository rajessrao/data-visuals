'use strict';
var config = require('../config');
var jwt = require('jsonwebtoken');
var http = require('http');
var https = require('https');
var Request = require('request');
var computeService = require('./ComputeService');
var fs = require('fs');

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
    refreshMachineData: async function () {
        var data = fs.readFileSync('./mockdata/DM_hero_hw_grind_mtl.json', 'utf8');
        var machine = 'DM_hero_hw_grind_mtl';
        var processedData = computeService.plotDataDateShiftWise(data, machine);
        console.log(machine, '\n=======================================\n', processedData, '\n');
        var alarms = computeService.getAlarms(data, machine);
        console.log(machine, '\n=======================================\n', alarms, '\n');
        var currShift = computeService.getCurrShiftAccurals(processedData);
        console.log(machine, '\n=======================================\n', currShift, '\n');
        /* var machines = ['DM_hero_sm_honn_mtl', 'DM_hero_sm_frd_mtl', 'DM_hero_sm_fb_mtl']; // DM_hero_hw_grind_mtl
        machines.forEach(function (machine) {
            https.get(config.apiEndpoint + '&a=find&ot=T_heromotocorp_iirp.' + machine + '&lmt=6000', (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    var processedData = computeService.plotDataDateShiftWise(data, machine);
                    console.log(machine, '\n=======================================>\n', processedData);
                });
            }).on("error", (err) => {
                console.log("Error: " + err.message);
            });
        }); */
    }
}