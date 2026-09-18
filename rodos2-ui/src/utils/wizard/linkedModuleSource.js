export function toModuleIDPair(moduleID = '') {
    if (moduleID && typeof moduleID === 'object') {
        const nested = moduleID.moduleID || moduleID;
        const mID = `${nested.mID || ''}`.trim();
        const iID = `${nested.iID || '00'}`.trim() || '00';
        return mID ? { mID, iID } : null;
    }

    const value = `${moduleID || ''}`.trim();
    if (!value) return null;
    const separator = value.lastIndexOf('-');
    if (separator > 0) {
        return { mID: value.slice(0, separator), iID: value.slice(separator + 1) || '00' };
    }
    return value.length > 2
        ? { mID: value.slice(0, -2), iID: value.slice(-2) }
        : null;
}

export function moduleIDKey(moduleID) {
    const pair = toModuleIDPair(moduleID);
    return pair ? `${pair.mID}:${pair.iID}`.toLowerCase() : '';
}

export function formatModuleID(moduleID) {
    const pair = toModuleIDPair(moduleID);
    return pair ? `${pair.mID}-${pair.iID}` : '';
}

export function getLinkedSourceLabel(moduleInfo = {}) {
    const moduleName = moduleInfo.moduleName || moduleInfo.moduleID || 'Unknown module';
    return moduleInfo.parentModuleName
        ? `${moduleInfo.parentModuleName} / ${moduleName}`
        : moduleName;
}
