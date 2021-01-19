"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const schedule = require("node-schedule");
const executor_1 = require("./executor");
const defaults_1 = require("./defaults");
const constants_1 = require("./constants");
const job_repeat_exception_1 = require("./exceptions/job-repeat.exception");
class Scheduler {
    static queueJob(job) {
        const config = Object.assign({}, defaults_1.defaults, job.config);
        if (config.enable) {
            if (job.type === 'cron') {
                Scheduler.scheduleCronJob(job.key, config.cron, job.method, config, job.tryLock);
            }
            if (job.type === 'interval') {
                Scheduler.scheduleIntervalJob(job.key, job.config.interval, job.method, config, job.tryLock);
            }
            if (job.type === 'timeout') {
                Scheduler.scheduleTimeoutJob(job.key, job.config.timeout, job.method, config, job.tryLock);
            }
        }
    }
    static cancelJob(key) {
        const job = this.jobs.get(key);
        if (job) {
            switch (job.type) {
                case 'cron':
                    job.instance.cancel();
                    break;
                case 'interval':
                    clearInterval(job.timer);
                    break;
                case 'timeout':
                    clearTimeout(job.timer);
                    break;
            }
            this.jobs.delete(key);
        }
    }
    static cancelJobs() {
        for (let key of this.jobs.keys()) {
            this.cancelJob(key);
        }
    }
    static scheduleCronJob(key, cron, cb, config, tryLock) {
        this.assertJobNotExist(key);
        const configs = Object.assign({}, defaults_1.defaults, config);
        let cronJob;
        if (typeof cron === 'object') {
            cronJob = Object.assign({}, cron);
        }
        else {
            cronJob = {
                start: config ? config.startTime : null,
                end: config ? config.endTime : null,
                rule: cron,
            };
        }
        const instance = schedule.scheduleJob(cronJob, () => __awaiter(this, void 0, void 0, function* () {
            const job = this.jobs.get(key);
            if (configs.waiting && job.status !== constants_1.READY) {
                return false;
            }
            job.status = constants_1.RUNNING;
            const executor = new executor_1.Executor(configs);
            const needStop = yield executor.execute(key, cb, tryLock);
            job.status = constants_1.READY;
            if (needStop) {
                this.cancelJob(key);
            }
        }));
        this.addJob(key, 'cron', config, { instance });
        if (configs.immediate) {
            this.runJobImmediately(key, configs, cb, tryLock);
        }
    }
    static scheduleIntervalJob(key, interval, cb, config, tryLock) {
        this.assertJobNotExist(key);
        const configs = Object.assign({}, config, config);
        const timer = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            const job = this.jobs.get(key);
            if (configs.waiting && job.status !== constants_1.READY) {
                return false;
            }
            job.status = constants_1.RUNNING;
            const executor = new executor_1.Executor(configs);
            const needStop = yield executor.execute(key, cb, tryLock);
            job.status = constants_1.READY;
            if (needStop) {
                this.cancelJob(key);
            }
        }), interval);
        this.addJob(key, 'interval', config, { timer });
        if (configs.immediate) {
            this.runJobImmediately(key, configs, cb, tryLock);
        }
    }
    static scheduleTimeoutJob(key, timeout, cb, config, tryLock) {
        this.assertJobNotExist(key);
        const configs = Object.assign({}, defaults_1.defaults, config);
        const timer = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            const job = this.jobs.get(key);
            if (configs.waiting && job.status !== constants_1.READY) {
                return false;
            }
            job.status = constants_1.RUNNING;
            const executor = new executor_1.Executor(configs);
            yield executor.execute(key, cb, tryLock);
            job.status = constants_1.READY;
            this.cancelJob(key);
        }), timeout);
        this.addJob(key, 'timeout', config, { timer });
        if (configs.immediate) {
            this.runJobImmediately(key, configs, cb, tryLock);
        }
    }
    static addJob(key, type, config, extra) {
        this.jobs.set(key, {
            type,
            config,
            key,
            timer: extra.timer,
            instance: extra.instance,
            status: constants_1.READY,
        });
    }
    static runJobImmediately(key, configs, cb, tryLock) {
        return __awaiter(this, void 0, void 0, function* () {
            const job = this.jobs.get(key);
            if (configs.waiting && job.status !== constants_1.READY) {
                return false;
            }
            job.status = constants_1.RUNNING;
            const executor = new executor_1.Executor(configs);
            const needStop = yield executor.execute(key, cb, tryLock);
            job.status = constants_1.READY;
            if (needStop) {
                this.cancelJob(key);
            }
        });
    }
    static assertJobNotExist(key) {
        if (this.jobs.has(key)) {
            throw new job_repeat_exception_1.JobRepeatException(`The job ${key} is exists.`);
        }
    }
}
Scheduler.jobs = new Map();
exports.Scheduler = Scheduler;
