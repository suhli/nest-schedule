"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JobRepeatException {
    constructor(message, stack) {
        this.name = 'JobRepeatException';
        this.message = message;
        this.stack = stack;
    }
}
exports.JobRepeatException = JobRepeatException;
