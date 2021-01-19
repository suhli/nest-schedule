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
const constants_1 = require("./constants");
const scheduler_1 = require("./scheduler");
const module_util_1 = require("./utils/module.util");
class NestDistributedSchedule {
    constructor() {
        this.__lockers = new Map();
        this.__jobs = Reflect.getMetadata(constants_1.NEST_SCHEDULE_JOB_KEY, new.target.prototype);
        const lockers = Reflect.getMetadata(constants_1.NEST_SCHEDULE_LOCKER, new.target.prototype);
        if (lockers) {
            lockers.forEach(item => this.__lockers.set(item.key, item.Locker));
        }
        this.init();
    }
    getLocker(key) {
        if (!this.__lockers.has(key)) {
            return null;
        }
        const Locker = this.__lockers.get(key);
        if (Locker) {
            const module = module_util_1.chooseModule(Locker);
            if (module) {
                const instance = module_util_1.getInstance(module, Locker);
                if (instance) {
                    return instance;
                }
            }
            return new Locker();
        }
    }
    init() {
        if (this.__jobs) {
            this.__jobs.forEach((config) => __awaiter(this, void 0, void 0, function* () {
                const tryLock = () => __awaiter(this, void 0, void 0, function* () {
                    const locker = this.getLocker(config.method);
                    locker.init(config.key, config);
                    const succeed = yield locker.tryLock();
                    if (!succeed) {
                        return false;
                    }
                    return () => locker.release();
                });
                const job = {
                    key: config.key,
                    config,
                    type: config.cron ? 'cron' : config.interval ? 'interval' : 'timeout',
                    method: () => this[config.method](),
                    tryLock: this.isLockerExist(config.method)
                        ? tryLock
                        : this.tryLock.bind(this),
                };
                scheduler_1.Scheduler.queueJob(job);
            }));
        }
    }
    isLockerExist(key) {
        return !!this.__lockers.has(key);
    }
}
exports.NestDistributedSchedule = NestDistributedSchedule;
