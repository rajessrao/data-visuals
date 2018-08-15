'use strict';
var Moment = require('moment');

module.exports = {
    today: Moment(new Date()),
    yesterday: Moment(new Date()),
    currShift: '',
    ShiftTime: 480,
    Cycletime: 30,
    PlannedStops: 30,
    Rejections: 1,

    configureDatesAndShift: function () {
        const currHour = this.today.hour();
        if (currHour < 6) {
            this.today = this.today.date(this.today.date() - 1);
            this.yesterday = this.yesterday.date(this.yesterday.date() - 2);
        } else {
            this.today = this.today;
            this.yesterday = this.yesterday.date(this.yesterday.date() - 1);
        }
        if (currHour >= 6 && currHour < 14) {
            this.currShift = 'A';
        } else if (currHour >= 14 && currHour < 22) {
            this.currShift = 'B';
        } else if (currHour >= 22 && currHour < 6) {
            this.currShift = 'C';
        }
    },
    plotDataDateShiftWise: function (data, machine) {
        this.configureDatesAndShift();
        const processedData = [];
        let date = this.today.date().toString().length === 1 ? '0' + this.today.date() : this.today.date();
        const todayKey = this.today.year() + '' + Moment(this.today).format('MMM') + '' + date;
        date = this.yesterday.date().toString().length === 1 ? '0' + this.yesterday.date() : this.yesterday.date();
        const yesterdayKey = this.yesterday.year() + '' + Moment(this.yesterday).format('MMM') + '' + date;
        const signalname = machine.indexOf('honn') > -1 ? 'CYCLECOUNT_SP_HON_9202093' : 'PartsCount';

        const results = JSON.parse(data).results;
        results.forEach(function (d) {
            const signal = d.body.signals.find(function (s) {
                return s.signalname === signalname;
            });
            if (signal) {
                const enddate = machine.indexOf('grind') > -1 ? signal.updatedate : signal.enddate;
                const dateSplit = enddate.split(' ');
                const currDate = Moment(new Date(dateSplit[5] + ' ' + dateSplit[1] + ' ' + dateSplit[2])); // Moment([dateSplit[5], dateSplit[1], dateSplit[2]]);
                const key = dateSplit[5] + '' + dateSplit[1] + '' + dateSplit[2];
                // if (key === todayKey || key === yesterdayKey) {
                if (processedData[key] === undefined) {
                    processedData[key] = null;
                }
                if (processedData[key] !== undefined) {
                    const currDateTime = Moment(new Date(dateSplit[5] + ' ' + dateSplit[1] + ' ' + dateSplit[2] + ' ' + dateSplit[3])); // Moment([dateSplit[5], dateSplit[1], dateSplit[2], dateSplit[3]]);
                    let value = signal.value;
                    if (value < 0 || value === null) {
                        value = 0;
                    }
                    if (processedData[key] === null) {
                        const shiftAStartDateTime = Moment(currDate).hour(6).minute(0).second(0);
                        const shiftAEndDateTime = Moment(shiftAStartDateTime).add(8, 'hours').minute(0).second(0);
                        const shiftBEndDateTime = Moment(shiftAEndDateTime).add(8, 'hours').minute(0).second(0);
                        const shiftCEndDateTime = Moment(shiftBEndDateTime).add(8, 'hours').minute(0).second(0);
                        processedData[key] = {
                            shiftAStartDateTime: shiftAStartDateTime,
                            shiftAEndDateTime: shiftAEndDateTime,
                            shiftBEndDateTime: shiftBEndDateTime,
                            shiftCEndDateTime: shiftCEndDateTime,
                            A: { shiftStart: shiftAStartDateTime, shiftEnd: shiftAEndDateTime, partsCount: 0, OEE: 0, plannedCount: 0, breakDownTime: 0, data: [] },
                            B: { shiftStart: shiftAEndDateTime, shiftEnd: shiftBEndDateTime, partsCount: 0, OEE: 0, plannedCount: 0, breakDownTime: 0, data: [] },
                            C: { shiftStart: shiftBEndDateTime, shiftEnd: shiftCEndDateTime, partsCount: 0, OEE: 0, plannedCount: 0, breakDownTime: 0, data: [] },
                            OLE: 0
                        }
                    }

                    if (currDateTime >= processedData[key].shiftAStartDateTime && currDateTime < processedData[key].shiftAEndDateTime) {
                        processedData[key].A.data.push({ id: d._id, enddate: currDateTime, value: value });
                    } else if (currDateTime >= processedData[key].shiftAEndDateTime && currDateTime < processedData[key].shiftBEndDateTime) {
                        processedData[key].B.data.push({ id: d._id, enddate: currDateTime, value: value });
                    } else if (currDateTime >= processedData[key].shiftBEndDateTime && currDateTime < processedData[key].shiftCEndDateTime) {
                        processedData[key].C.data.push({ id: d._id, enddate: currDateTime, value: value });
                    }
                }
                // }
            }
        });
        this.calculateValues(processedData, machine);
        return processedData;
    },
    calculateValues: function (processedData, machine) {
        for (var p in processedData) {
            if (processedData[p] !== undefined) {
                for (var s in processedData[p]) {
                    if (processedData[p][s] !== undefined) {
                        if (processedData[p][s].data !== undefined) {
                            /* const result = this.calculatePartsCount(processedData[p][s].data, processedData[p][s].shiftStart, processedData[p][s].shiftEnd, machine);
                            processedData[p][s].partsCount = result.partsCount;
                            processedData[p][s].OEE = result.OEE;
                            processedData[p][s].breakDownTime = result.breakDownTime;
                            processedData[p][s].plannedCount = result.plannedCount; */
                            const result = this.calculatePartsCountDesc(processedData[p][s].data, processedData[p][s].shiftStart, processedData[p][s].shiftEnd, machine);
                            processedData[p][s].partsCount = result.partsCount;
                            processedData[p][s].OEE = result.OEE;
                            processedData[p][s].breakDownTime = result.breakDownTime;
                            processedData[p][s].plannedCount = result.plannedCount;
                            delete processedData[p][s].data;
                        } else if (s !== 'OLE') {
                            delete processedData[p][s];
                        }
                    }
                }
                processedData[p].OLE = Math.min(processedData[p].A.OEE, processedData[p].B.OEE, processedData[p].C.OEE);
            }
        }
    },
    calculatePartsCount: function (data, shiftStart, shiftEnd, machine) {
        let prevValue = 0, partsCount = 0;
        let prevDateTime, downTime = 0;
        let changeFlag = false;
        data.forEach(function (d) {
            const currValue = parseInt(d.value);
            if (!isNaN(currValue)) {
                if (data.indexOf(d) === 0 && prevValue === 0) {
                    prevValue = currValue;
                    prevDateTime = shiftEnd;
                    changeFlag = true;
                } else {
                    let diff = prevValue - currValue;
                    if (diff > 0) {
                        partsCount += diff;
                        prevValue = currValue;
                        if (changeFlag || data.indexOf(d) === data.length - 1) {
                            const currdate = data.indexOf(d) === data.length - 1 ? shiftStart : d.enddate;
                            const differenceInTime = prevDateTime.diff(currdate, 'minutes');
                            if (differenceInTime > 30) {
                                downTime += differenceInTime;
                                changeFlag = false;
                            } else if (differenceInTime <= 30) {
                                prevDateTime = d.enddate;
                                changeFlag = false;
                            }
                        } else if (!changeFlag) {
                            prevDateTime = d.enddate;
                            changeFlag = true;
                        }
                    } else {
                        prevValue = currValue;
                    }
                }
            }
        });
        if (partsCount >= 0) {
            const result = this.calculateOEE(partsCount, downTime > 480 ? 0 : downTime, machine);
            return { partsCount: machine.indexOf('frd') > -1 ? partsCount * 2 : partsCount, OEE: result.OEE, plannedCount: result.plannedCount, breakDownTime: downTime };
        }
    },
    calculatePartsCountDesc: function (data, shiftStart, shiftEnd, machine) {
        let prevValue = 0, partsCount = 0;
        let prevDateTime, downTime = 0;
        let changeFlag = false;
        let plansActuals = [];
        data.sort(function (a, b) { return a.enddate - b.enddate });
        data.forEach(function (d) {
            const currValue = parseInt(d.value);
            if (!isNaN(currValue)) {
                if (data.indexOf(d) === 0 && prevValue === 0) {
                    prevValue = currValue;
                    prevDateTime = shiftStart;
                    changeFlag = true;
                } else {
                    let diff = currValue - prevValue;
                    if (diff > 0) {
                        partsCount += diff;
                        // Newly added start
                        let currMin = d.enddate.diff(shiftStart, 'minutes'); // currEnd.diff(prevDateTime, 'minutes');
                        const AvailableTime = currMin - 30;
                        const cycleTime = machine.indexOf('frd') > -1 ? 300 : 30;
                        const PlannedCount = (AvailableTime / (cycleTime / 60)) * (machine.indexOf('frd') > -1 ? 2 : 1);
                        plansActuals.push({ Time: d.enddate.format('HH:mm:ss'), plan: PlannedCount, actual: partsCount });
                        // Newly added end
                        prevValue = currValue;
                        if (changeFlag || data.indexOf(d) === data.length - 1) {
                            const currdate = data.indexOf(d) === data.length - 1 ? shiftEnd : d.enddate;
                            const differenceInTime = (prevDateTime.diff(currdate, 'minutes')) * -1;
                            if (differenceInTime > 30) {
                                downTime += differenceInTime;
                                changeFlag = false;
                            } else if (differenceInTime <= 30) {
                                prevDateTime = d.enddate;
                                changeFlag = false;
                            }
                        } else if (!changeFlag) {
                            prevDateTime = d.enddate;
                            changeFlag = true;
                        }
                    } else {
                        prevValue = currValue;
                    }
                }
            }
        });
        if (partsCount >= 0) {
            const result = this.calculateOEE(partsCount, downTime > 480 ? 0 : downTime, machine);
            return { partsCount: machine.indexOf('frd') > -1 ? partsCount * 2 : partsCount, OEE: result.OEE, plannedCount: result.plannedCount, breakDownTime: downTime, plansActuals: plansActuals };
        }
    },
    calculateOEE: function (partsCount, downTime, machine) {
        const PartsCount = machine.indexOf('frd') > -1 ? partsCount * 2 : partsCount;
        const AvailableTime = this.ShiftTime - this.PlannedStops;
        const NetUptime = AvailableTime - (downTime - this.PlannedStops);
        const goodCount = PartsCount <= 0 ? 0 : (PartsCount - this.Rejections);
        const cycleTime = machine.indexOf('frd') > -1 ? 300 : this.Cycletime;
        const PlannedCount = (AvailableTime / (cycleTime / 60)) * (machine.indexOf('frd') > -1 ? 2 : 1);
        const Quality = goodCount <= 0 ? 0 : (goodCount / PartsCount);
        const Availability = NetUptime / AvailableTime;
        const Performance = PartsCount / PlannedCount;
        const OEE = (Availability * Performance * Quality) * 100;

        return { OEE: isNaN(OEE) ? 0 : (typeof (OEE) === 'number' ? OEE.toFixed(2) : parseFloat(OEE).toFixed(2)), plannedCount: PlannedCount };
    },
    getAlarms: function (data, machine) {
        let SpindleOilFlow = '', SpindleOilTemp = '', CoolantFlow = '';
        const results = JSON.parse(data).results;
        results.forEach(function (d) {
            if (SpindleOilFlow === '') {
                const oilFlowSignal = d.body.signals.find(function (s) {
                    return s.signalname.toLowerCase() === 'oil_flow';
                });
                if (oilFlowSignal) {
                    SpindleOilFlow = oilFlowSignal.value;
                }
            }
            if (SpindleOilTemp === '') {
                const oilTempSignal = d.body.signals.find(function (s) {
                    return s.signalname.toLowerCase() === 'oil_temperature';
                });
                if (oilTempSignal) {
                    SpindleOilTemp = oilTempSignal.value;
                }
            }
            if (CoolantFlow === '') {
                const coolantFlowSignal = d.body.signals.find(function (s) {
                    return s.signalname.toLowerCase() === 'coolant_flow';
                });
                if (coolantFlowSignal) {
                    CoolantFlow = coolantFlowSignal.value;
                }
            }
        });
        let Alarms = {
            'XSlideLoad': '42%',
            'XSlideLubPressure': '0.5',
            'XAxisMotorTemp': '20',
            'ZSlideLoad': '29%',
            'ZSlideLubPressure': '0.2',
            'ZAxisMotorTemp': '30',
            'SpinOilAlertBypassed': 'True',
            'SpindleOilTemp': SpindleOilTemp || '25',
            'SpindleLubrication': '340',
            'WorkHeadRPM': '.5/.2',
            'SpindleOilFlow': SpindleOilFlow || '5',
            'CoolantFlow': CoolantFlow || '25'
        };
        return Alarms;
    },
    getCurrShiftAccurals: function (data) {
        if (data['2018May24'].A) {
            let currShiftData = data['2018May24'].A;
            let result = {
                'TotalCount': currShiftData.partsCount || '607',
                'TotalOK': (currShiftData.partsCount - 7) || '600',
                'TotalNG': '2',
                'ReworkCount': '5',
                'Inspection': parseInt(((currShiftData.partsCount - 7) / (currShiftData.partsCount)) * 100) + '%' || '98%',
                'AvgCycleTime': '30'
            };
            return result;
        }
    }
}