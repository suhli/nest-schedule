"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scheduler_1 = require("./scheduler");
const defaults_1 = require("./defaults");
class Schedule {
    constructor(globalConfig) {
        this.scheduler = scheduler_1.Scheduler;
        if (globalConfig) {
            for (const key in globalConfig) {
                defaults_1.defaults[key] = globalConfig[key];
            }
        }
    }
    cancelJob(key) {
        this.scheduler.cancelJob(key);
    }
    cancelJobs() {
        this.scheduler.cancelJobs();
    }
    scheduleCronJob(key, cron, callback, config) {
        this.scheduler.scheduleCronJob(key, cron, callback, config);
    }
    scheduleIntervalJob(key, interval, callback, config) {
        this.scheduler.scheduleIntervalJob(key, interval, callback, config);
    }
    scheduleTimeoutJob(key, timeout, callback, config) {
        this.scheduler.scheduleTimeoutJob(key, timeout, callback, config);
    }
}
exports.Schedule = Schedule;
