"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@nestjs/core/injector/constants");
function chooseModule(metatype) {
    let NestCloud;
    try {
        const Core = require('@nestcloud/core');
        NestCloud = Core.NestCloud;
    }
    catch (e) {
        return null;
    }
    const container = NestCloud.global.getContainer();
    if (container) {
        const modules = container.getModules();
        for (const module of modules.values()) {
            const instanceWrapper = module.injectables.get(metatype.name);
            if (instanceWrapper &&
                module.injectables.has(metatype.name) &&
                instanceWrapper.metatype === metatype) {
                return module;
            }
        }
    }
    return void 0;
}
exports.chooseModule = chooseModule;
function getInstance(module, metatype) {
    const instanceWrapper = module.injectables.get(metatype.name);
    if (instanceWrapper) {
        const instanceHost = instanceWrapper.getInstanceByContextId(constants_1.STATIC_CONTEXT);
        if (instanceHost.isResolved && instanceHost.instance) {
            return instanceHost.instance;
        }
    }
}
exports.getInstance = getInstance;
