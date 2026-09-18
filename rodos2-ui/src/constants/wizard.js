// Wizard 페이지 상수들
export const WIZARD_PAGES = {
    GEN_INFO: 'genInfo',
    IDN_TYPE: 'idnType',
    PROPERTIES: 'properties',
    IO_VARIABLES: 'ioVariables',
    SERVICES: 'services',
    INFRASTRUCTURE: 'infrastructure',
    SAFE_SECURE: 'safeSecure',
    EXECUTABLE_FORM: 'executableForm',
    CHECK: 'check'
};

// Wizard 페이지 순서
export const WIZARD_PAGE_ORDER = [
    WIZARD_PAGES.GEN_INFO,
    WIZARD_PAGES.IDN_TYPE,
    WIZARD_PAGES.PROPERTIES,
    WIZARD_PAGES.IO_VARIABLES,
    WIZARD_PAGES.SERVICES,
    WIZARD_PAGES.INFRASTRUCTURE,
    WIZARD_PAGES.SAFE_SECURE,
    WIZARD_PAGES.EXECUTABLE_FORM,
    WIZARD_PAGES.CHECK
];

// Wizard 페이지 제목들
export const WIZARD_PAGE_TITLES = {
    [WIZARD_PAGES.GEN_INFO]: 'General Information',
    [WIZARD_PAGES.IDN_TYPE]: 'ID and Type',
    [WIZARD_PAGES.PROPERTIES]: 'Properties',
    [WIZARD_PAGES.IO_VARIABLES]: 'I/O Variables',
    [WIZARD_PAGES.SERVICES]: 'Services',
    [WIZARD_PAGES.INFRASTRUCTURE]: 'Infrastructure',
    [WIZARD_PAGES.SAFE_SECURE]: 'Safety & Security',
    [WIZARD_PAGES.EXECUTABLE_FORM]: 'Executable Form',
    [WIZARD_PAGES.CHECK]: 'Check & Preview'
};

// Wizard 페이지 설명들
export const WIZARD_PAGE_DESCRIPTIONS = {
    [WIZARD_PAGES.GEN_INFO]: 'Enter basic module information and generate Module ID',
    [WIZARD_PAGES.IDN_TYPE]: 'Configure module identification and type information',
    [WIZARD_PAGES.PROPERTIES]: 'Set operating system, compiler, and execution properties',
    [WIZARD_PAGES.IO_VARIABLES]: 'Define input/output variables and data structures',
    [WIZARD_PAGES.SERVICES]: 'Configure service profiles and methods',
    [WIZARD_PAGES.INFRASTRUCTURE]: 'Set up database, middleware, and communication',
    [WIZARD_PAGES.SAFE_SECURE]: 'Configure safety and security requirements',
    [WIZARD_PAGES.EXECUTABLE_FORM]: 'Define executable forms and libraries',
    [WIZARD_PAGES.CHECK]: 'Review all information and generate XML'
};

// 입력 검증 규칙들
export const VALIDATION_RULES = {
    HEX_2: {
        pattern: /^[0-9A-Fa-f]{0,2}$/,
        maxLength: 2,
        message: '2자리 16진수만 입력 가능합니다'
    },
    HEX_4: {
        pattern: /^[0-9A-Fa-f]{0,4}$/,
        maxLength: 4,
        message: '4자리 16진수만 입력 가능합니다'
    },
    SERIAL_NUMBER: {
        pattern: /^[0-9]{0,10}$/,
        maxValue: 4294967295,
        message: '10자리 이하의 숫자만 입력 가능합니다'
    },
    INSTANCE_ID: {
        pattern: /^[0-9]{0,3}$/,
        maxValue: 255,
        message: '0-255 사이의 숫자만 입력 가능합니다'
    }
};

// 필수 필드들
export const REQUIRED_FIELDS = {
    [WIZARD_PAGES.GEN_INFO]: [
        'moduleName',
        'manufacturer',
        'vendorPid1', 'vendorPid2', 'vendorPid3',
        'revisionNumber1', 'revisionNumber2',
        'serialNumber',
        'instanceId',
        'category1', 'category2'
    ],
    [WIZARD_PAGES.IDN_TYPE]: [
        'idtype',
        'infoModelVersion'
    ]
};

// 기본값들
export const DEFAULT_VALUES = {
    [WIZARD_PAGES.GEN_INFO]: {
        moduleName: '',
        manufacturer: '',
        description: '',
        examples: '',
        vendorPid1: '',
        vendorPid2: '',
        vendorPid3: '',
        revisionNumber1: '',
        revisionNumber2: '',
        serialNumber: '',
        instanceId: '',
        category1: '',
        category2: '',
        compositeType: 'basic',
        idType: 'Bas',
        safety: false,
        security: false
    },
    [WIZARD_PAGES.IDN_TYPE]: {
        idtype: '',
        infoModelVersion: '1.0'
    }
}; 