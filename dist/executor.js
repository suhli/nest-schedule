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
const common_1 = require("@nestjs/common");
class Executor {
    constructor(configs) {
        this.configs = configs;
        this.currentRetryCount = 0;
        this.logger = new common_1.Logger('ScheduleModule');
    }
    execute(jobKey, callback, tryLock) {
        return __awaiter(this, void 0, void 0, function* () {
            let release;
            if (typeof tryLock === 'function') {
                try {
                    release = yield tryLock(jobKey);
                    if (!release) {
                        return false;
                    }
                }
                catch (e) {
                    this.logger.error(`Try lock job ${jobKey} fail. ${e.message}`, e.stack);
                    return false;
                }
            }
            const result = yield this.run(jobKey, callback);
            try {
                typeof release === 'function' ? release() : void 0;
            }
            catch (e) {
                this.logger.error(`Release lock job ${jobKey} fail.`, e.stack);
            }
            return result;
        });
    }
    run(jobKey, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield callback();
                this.clear();
                return result;
            }
            catch (e) {
                this.logger.error(`Execute job ${jobKey} fail.`, e.stack);
                if (this.configs.maxRetry !== -1 &&
                    this.currentRetryCount < this.configs.maxRetry) {
                    if (this.timer) {
                        clearTimeout(this.timer);
                    }
                    yield new Promise(resolve => {
                        this.timer = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                            this.currentRetryCount++;
                            resolve(yield this.run(jobKey, callback));
                        }), this.configs.retryInterval);
                    });
                    return false;
                }
                else {
                    this.logger.error(`Job ${jobKey} already has max retry count.`, e.stack);
                    return false;
                }
            }
        });
    }
    clear() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
            this.currentRetryCount = 0;
        }
    }
}
exports.Executor = Executor;
