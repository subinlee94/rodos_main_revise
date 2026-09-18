/** SW 모듈 properties 블록 병합 (Robot/Controller 위자드 계승용) */

const normalizeNoBit = (bitValue) => {
    if (!bitValue || typeof bitValue !== 'string') return bitValue || '';
    const map = { _16: 'BIT16', _32: 'BIT32', _64: 'BIT64' };
    return map[bitValue] || bitValue;
};

function normalizeCompilerName(name = '') {
    if (!name || typeof name !== 'string') return '';
    const lower = name.toLowerCase();
    if (lower === 'gcc' || lower === 'g++' || lower === 'clang') return lower;
    return name;
}

function normalizeOsType(osType = {}) {
    if (!osType || typeof osType !== 'object') return {};
    const rawBit = osType.bit;
    const bit = typeof rawBit === 'string'
        ? normalizeNoBit(rawBit)
        : (rawBit?.name ? normalizeNoBit(rawBit.name) : normalizeNoBit(String(rawBit || '')));

    return {
        type: osType.type || osType.name || '',
        bit,
        version: osType.version || ''
    };
}

function normalizeCompilerType(compiler = {}) {
    if (!compiler || typeof compiler !== 'object') return {};
    const verRangeOS = compiler.verRangeOS || {};
    const verRangeCompiler = compiler.verRangeCompiler || {};
    return {
        osname: compiler.osname || compiler.osName || '',
        compilerName: normalizeCompilerName(compiler.compilerName || ''),
        verRangeOS: {
            min: verRangeOS.min || '',
            max: verRangeOS.max || ''
        },
        verRangeCompiler: {
            min: verRangeCompiler.min || '',
            max: verRangeCompiler.max || ''
        },
        bitsnCPUarch: compiler.bitsnCPUarch || compiler.bitnCPUarch || ''
    };
}

function normalizeOpType(value = '') {
    if (!value) return '';
    const upper = String(value).toUpperCase().replace(/\s+/g, '');
    if (upper === 'EVENTDRIVEN') return 'EVENTDRIVEN';
    if (upper === 'PERIODIC') return 'PERIODIC';
    if (upper === 'NONRT') return 'NONRT';
    return upper;
}

function normalizeInstanceType(value = '') {
    if (!value) return '';
    const trimmed = String(value).trim();
    if (trimmed.toLowerCase() === 'singleton') return 'Singleton';
    return trimmed;
}

function normalizeLibrary(lib = {}) {
    if (!lib || typeof lib !== 'object') return null;
    const name = lib.name || '';
    if (!name) return null;

    let version = lib.version;
    if (version && typeof version === 'object') {
        const min = version.min || '';
        const max = version.max || '';
        version = min && max ? `${min} - ${max}` : (min || max || '');
    }
    return {
        name,
        version: version != null ? String(version) : ''
    };
}

function normalizeLibraries(libraries = []) {
    if (!Array.isArray(libraries)) return [];
    return libraries
        .map(normalizeLibrary)
        .filter(Boolean);
}

function moduleIdToString(moduleRef = {}) {
    if (!moduleRef || typeof moduleRef !== 'object') return '';
    if (typeof moduleRef === 'string') return moduleRef;

    const nested = moduleRef.moduleID || moduleRef.moduleId;
    if (typeof nested === 'string') return nested;
    if (nested && typeof nested === 'object') {
        const mID = nested.mID || nested.mid || '';
        const iID = nested.iID || nested.iid || '';
        if (mID && iID) return `${mID}-${iID}`;
        return mID || '';
    }

    const mID = moduleRef.mID || moduleRef.mid || '';
    const iID = moduleRef.iID || moduleRef.iid || '';
    if (mID && iID) return `${mID}-${iID}`;
    return mID || '';
}

function normalizeOrganization(org = {}) {
    if (!org || typeof org !== 'object') {
        return {
            owner: '',
            dependency: '',
            orgMemberType: { moduleID: '', dependency: '' },
            additionalInfo: []
        };
    }

    let owner = org.owner;
    if (owner && typeof owner === 'object') {
        owner = moduleIdToString(owner);
    }

    const orgMemberType = org.orgMemberType && typeof org.orgMemberType === 'object'
        ? {
            moduleID: org.orgMemberType.moduleID || moduleIdToString(org.orgMemberType) || '',
            dependency: org.orgMemberType.dependency || ''
        }
        : { moduleID: '', dependency: '' };

    return {
        owner: owner != null ? String(owner) : '',
        dependency: org.dependency || '',
        orgMemberType,
        additionalInfo: Array.isArray(org.additionalInfo) ? [...org.additionalInfo] : []
    };
}

export function normalizeLinkedPropertiesBlock(block = {}) {
    const properties = Array.isArray(block.properties) ? block.properties : [];
    const osType = normalizeOsType(block.osType || block.ostype || {});
    let compilerType = normalizeCompilerType(block.compilerType || {});
    if (!compilerType.osname && osType.type) {
        compilerType = { ...compilerType, osname: osType.type };
    }

    const rawExecutions = block.executionTypes || block.exeType || [];
    const executionTypes = (Array.isArray(rawExecutions) ? rawExecutions : []).map((et) => ({
        optype: normalizeOpType(et?.optype || et?.opType || ''),
        priority: et?.priority != null ? String(et.priority) : '',
        hardRT: et?.hardRT != null ? String(et.hardRT) : '',
        timeConstraint: et?.timeConstraint != null ? String(et.timeConstraint).trim() : '',
        instanceType: normalizeInstanceType(et?.instanceType || '')
    }));

    return {
        properties,
        osType,
        compilerType,
        executionTypes,
        libraries: normalizeLibraries(block.libraries),
        organization: normalizeOrganization(block.organization)
    };
}

function propertyKey(p) {
    return `${p?.name || ''}|${p?.type || ''}|${p?.description || ''}`;
}

export function mergePropertyLists(existing = [], incoming = []) {
    const merged = [...(Array.isArray(existing) ? existing : [])];
    const seen = new Set(merged.map(propertyKey));
    (Array.isArray(incoming) ? incoming : []).forEach((item) => {
        const key = propertyKey(item);
        if (!seen.has(key)) {
            seen.add(key);
            merged.push({ ...item });
        }
    });
    return merged;
}

function mergeListByKey(existing = [], incoming = [], keyFn) {
    const merged = [...(Array.isArray(existing) ? existing : [])];
    const seen = new Set(merged.map(keyFn));
    (Array.isArray(incoming) ? incoming : []).forEach((item) => {
        const key = keyFn(item);
        if (!key || seen.has(key)) return;
        seen.add(key);
        merged.push({ ...item });
    });
    return merged;
}

/** Robot/Controller IM에 SW properties 전체(또는 일부) 병합 */
export function mergePropertiesBlocks(target = {}, source = {}) {
    const base = normalizeLinkedPropertiesBlock(target);
    const add = normalizeLinkedPropertiesBlock(source);

    const hasOs = !!(add.osType?.type || add.osType?.bit || add.osType?.version);
    const hasCompiler = !!(
        add.compilerType?.osname ||
        add.compilerType?.compilerName ||
        add.compilerType?.verRangeOS?.min ||
        add.compilerType?.verRangeCompiler?.min
    );
    const hasExecutions = Array.isArray(add.executionTypes) && add.executionTypes.length > 0;
    const hasLibraries = Array.isArray(add.libraries) && add.libraries.length > 0;
    const hasOrganization = !!(
        add.organization?.owner ||
        add.organization?.dependency ||
        add.organization?.orgMemberType?.moduleID ||
        (Array.isArray(add.organization?.additionalInfo) && add.organization.additionalInfo.length > 0)
    );

    return {
        properties: mergePropertyLists(base.properties, add.properties),
        osType: hasOs ? { ...base.osType, ...add.osType } : base.osType,
        compilerType: hasCompiler ? { ...base.compilerType, ...add.compilerType } : base.compilerType,
        executionTypes: hasExecutions
            ? mergeListByKey(base.executionTypes, add.executionTypes, (et) => `${et?.optype || ''}|${et?.instanceType || ''}`)
            : base.executionTypes,
        libraries: hasLibraries
            ? mergeListByKey(base.libraries, add.libraries, (lib) => `${lib?.name || ''}|${lib?.version || ''}`)
            : base.libraries,
        organization: hasOrganization
            ? {
                ...base.organization,
                ...add.organization,
                orgMemberType: {
                    ...(base.organization?.orgMemberType || {}),
                    ...(add.organization?.orgMemberType || {})
                },
                additionalInfo: mergeListByKey(
                    base.organization?.additionalInfo,
                    add.organization?.additionalInfo,
                    (info) => `${info?.name || ''}|${info?.value || ''}`
                )
            }
            : base.organization
    };
}
