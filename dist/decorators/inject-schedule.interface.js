"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
exports.InjectSchedule = () => common_1.Inject(constants_1.NEST_SCHEDULE_PROVIDER);
