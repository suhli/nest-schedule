"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ScheduleModule_1;
const common_1 = require("@nestjs/common");
const constants_1 = require("./constants");
const schedule_1 = require("./schedule");
let ScheduleModule = ScheduleModule_1 = class ScheduleModule {
    static register(globalConfig) {
        const scheduleProvider = {
            provide: constants_1.NEST_SCHEDULE_PROVIDER,
            useFactory: () => new schedule_1.Schedule(globalConfig),
        };
        return {
            module: ScheduleModule_1,
            providers: [scheduleProvider],
            exports: [scheduleProvider],
        };
    }
};
ScheduleModule = ScheduleModule_1 = __decorate([
    common_1.Global(),
    common_1.Module({})
], ScheduleModule);
exports.ScheduleModule = ScheduleModule;
