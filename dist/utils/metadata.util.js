"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function extendArrayMetadata(key, metadata, target) {
    const previousValue = Reflect.getMetadata(key, target) || [];
    const value = [...previousValue, ...metadata];
    Reflect.defineMetadata(key, value, target);
}
exports.extendArrayMetadata = extendArrayMetadata;
function extendMetadata(key, metadata, target) {
    const previousValue = Reflect.getMetadata(key, target) || [];
    const value = [...previousValue, metadata];
    Reflect.defineMetadata(key, value, target);
}
exports.extendMetadata = extendMetadata;
exports.getMetadata = (key, ...targets) => {
    for (let i = 0; i < targets.length; i++) {
        const metadata = Reflect.getMetadata(key, targets[i]);
        if (metadata) {
            return metadata;
        }
    }
    return void 0;
};
