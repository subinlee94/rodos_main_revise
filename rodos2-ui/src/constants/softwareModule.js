// SoftwareModule 구조 상수들
export const SOFTWARE_MODULE_FIELDS = {
    // 기본 속성들
    TYPE: 'type',
    IS_SAFETY: 'isSafety',
    IS_SECURITY: 'isSecurity',
    IS_HW: 'isHw',
    IS_SW: 'isSw',
    IS_TOOL: 'isTool',
    COMPLEX_LIST: 'complexList',

    // 직접 속성들 (genInfo 제거)
    MODULE_NAME: 'moduleName',
    MANUFACTURER: 'manufacturer',
    DESCRIPTION: 'description',
    EXAMPLES: 'examples',

    // 하위 객체들
    IDN_TYPE: 'idnType',
    PROPERTIES: 'properties',
    IO_VARIABLES: 'ioVariables',
    SERVICES: 'services',
    INFRASTRUCTURE: 'infrastructure',
    SAFE_SECURE: 'safeSecure',
    MODELLING: 'modelling',
    EXECUTABLE_FORM: 'executableForm'
};

// Wizard 단계와 SoftwareModule 필드 매핑
export const STEP_FIELD_MAPPING = {
    0: 'general',      // General Information (직접 속성들)
    1: SOFTWARE_MODULE_FIELDS.IDN_TYPE,      // ID and Type
    2: SOFTWARE_MODULE_FIELDS.PROPERTIES,    // Properties
    3: SOFTWARE_MODULE_FIELDS.IO_VARIABLES,  // I/O Variables
    4: SOFTWARE_MODULE_FIELDS.SERVICES,      // Services
    5: SOFTWARE_MODULE_FIELDS.INFRASTRUCTURE, // Infrastructure
    6: SOFTWARE_MODULE_FIELDS.SAFE_SECURE,   // Safety & Security
    7: SOFTWARE_MODULE_FIELDS.EXECUTABLE_FORM, // Executable Form
    8: 'check' // Check & Preview (특별한 단계)
};

// 기본 SoftwareModule 상태 (Java 구조에 맞춤)
export const DEFAULT_SOFTWARE_MODULE_STATE = {
    type: 'SIM',
    isSafety: false,
    isSecurity: false,
    isHw: false,
    isSw: true,
    isTool: false,
    complexList: ['None', 'array', 'class', 'pointer', 'vector'],

    // 직접 속성들 (genInfo 제거)
    moduleName: '',
    manufacturer: '',
    description: '',
    examples: '',

    // 하위 객체들
    idnType: {
        informationModelVersion: '1.0',
        idtype: '',
        moduleID: { mID: '', iID: '' }
    },
    properties: {},
    ioVariables: {},
    services: {},
    infrastructure: {},
    safeSecure: {},
    modelling: {},
    executableForm: {}
};

// 단계별 완료 조건 (Java 구조에 맞춤)
export const STEP_COMPLETION_CRITERIA = {
    0: (moduleState) => {
        // 직접 속성들 확인
        return !!(moduleState?.moduleName && moduleState?.manufacturer);
    },
    1: (moduleState, moduleID) => {
        const idn = moduleState?.idnType;
        return !!(idn && idn.informationModelVersion && idn.idtype && moduleID);
    },
    2: (moduleState) => {
        const p = moduleState?.properties;
        return !!(p && ((p.osType && p.osType.type) || (p.compilerType && p.compilerType.osname) || (p.compilerType && p.compilerType.compilerName)));
    },
    3: (moduleState) => {
        const io = moduleState?.ioVariables;
        return !!(io && (io.inputs?.length > 0 || io.outputs?.length > 0 || io.inouts?.length > 0));
    },
    4: (moduleState) => {
        const s = moduleState?.services;
        return !!(s && (s.serviceProfiles?.length > 0 || s.noOfBasicService || s.noOfOptionalService));
    },
    5: (moduleState) => {
        const infra = moduleState?.infrastructure;
        return !!(infra && (infra.databases?.length > 0 || infra.middlewares?.length > 0 || (infra.communications?.length > 0)));
    },
    6: (moduleState) => {
        const safeSecure = moduleState?.safeSecure;
        const isSafety = moduleState?.isSafety;
        const isSecurity = moduleState?.isSecurity;

        if (!isSafety && !isSecurity) {
            return true;
        }

        if (isSafety) {
            const hasSafetyLevel = safeSecure?.safetyLevel && safeSecure.safetyLevel !== '';
            if (!hasSafetyLevel) return false;
        }

        if (isSecurity) {
            const hasSecurityLevel = safeSecure?.securityLevel && safeSecure.securityLevel !== '';
            if (!hasSecurityLevel) return false;
        }

        return true;
    },
    7: (moduleState) => {
        const exec = moduleState?.executableForm;
        return !!(exec && exec.exeForms && exec.exeForms.length > 0);
    }
}; 