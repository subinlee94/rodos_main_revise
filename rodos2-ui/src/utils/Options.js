// PropertiesPage에서 사용하는 옵션들
export const COMPLEX_TYPE_OPTIONS = [
    { value: '', label: 'Select Complex Type' },
    { value: 'NONE', label: 'NONE' },
    { value: 'CLASS', label: 'CLASS' },
    { value: 'ARRAY', label: 'ARRAY' },
    { value: 'VECTOR', label: 'VECTOR' },
    { value: 'POINTER', label: 'POINTER' },
];

export const TYPE_OPTIONS = [
    { value: '', label: 'Select Type' },
    // 기본 타입
    { value: 'boolean', label: 'boolean' },
    { value: 'string', label: 'string' },
    { value: 'char', label: 'char' },
    { value: 'void', label: 'void' },
    { value: 'any', label: 'any' },
    // 정수 타입
    { value: 'int', label: 'int' },
    { value: 'int8', label: 'int8' },
    { value: 'int16', label: 'int16' },
    { value: 'int32', label: 'int32' },
    { value: 'int64', label: 'int64' },
    { value: 'uint8', label: 'uint8' },
    { value: 'uint16', label: 'uint16' },
    { value: 'uint32', label: 'uint32' },
    { value: 'uint64', label: 'uint64' },
    { value: 'byte', label: 'byte' },
    { value: 'short', label: 'short' },
    { value: 'long', label: 'long' },
    { value: 'unsigned', label: 'unsigned' },
    { value: 'signed', label: 'signed' },
    // 부동소수점 타입
    { value: 'float', label: 'float' },
    { value: 'float32', label: 'float32' },
    { value: 'float64', label: 'float64' },
    { value: 'double', label: 'double' },
    { value: 'decimal', label: 'decimal' },
    // 복합 타입
    { value: 'enumeration', label: 'enumeration' },
    { value: 'enum', label: 'enum' },
    { value: 'class', label: 'class' },
    { value: 'struct', label: 'struct' },
    { value: 'union', label: 'union' },
    { value: 'interface', label: 'interface' },
    { value: 'array', label: 'array' },
    { value: 'vector', label: 'vector' },
    { value: 'list', label: 'list' },
    { value: 'map', label: 'map' },
    { value: 'dictionary', label: 'dictionary' },
    { value: 'set', label: 'set' },
    { value: 'tuple', label: 'tuple' },
    { value: 'pointer', label: 'pointer' },
    { value: 'reference', label: 'reference' },
    // 특수 타입
    { value: 'null', label: 'null' },
    { value: 'undefined', label: 'undefined' },
    { value: 'object', label: 'object' },
    { value: 'function', label: 'function' },
    { value: 'callback', label: 'callback' },
    { value: 'event', label: 'event' },
    { value: 'stream', label: 'stream' },
    { value: 'buffer', label: 'buffer' },
    { value: 'blob', label: 'blob' },
    { value: 'file', label: 'file' },
    { value: 'date', label: 'date' },
    { value: 'time', label: 'time' },
    { value: 'datetime', label: 'datetime' },
    { value: 'timestamp', label: 'timestamp' },
    { value: 'custom', label: '직접입력' },
];

export const UNIT_OPTIONS = [
    { value: '', label: 'Select Unit' },
    { value: 'none', label: 'none' },
    // 길이 단위
    { value: 'cm', label: 'cm' },
    { value: 'mm', label: 'mm' },
    { value: 'm', label: 'm' },
    { value: 'km', label: 'km' },
    { value: 'inch', label: 'inch' },
    { value: 'foot', label: 'foot' },
    { value: 'yard', label: 'yard' },
    { value: 'mile', label: 'mile' },
    // 무게 단위
    { value: 'mg', label: 'mg' },
    { value: 'g', label: 'g' },
    { value: 'kg', label: 'kg' },
    { value: 'ton', label: 'ton' },
    { value: 'pound', label: 'pound' },
    { value: 'lb', label: 'lb' },
    { value: 'ounce', label: 'ounce' },
    { value: 'oz', label: 'oz' },
    // 각도 단위
    { value: 'degree', label: 'degree' },
    { value: 'radian', label: 'radian' },
    { value: 'gradian', label: 'gradian' },
    // 속도 단위
    { value: 'rpm', label: 'rpm' },
    { value: 'mps', label: 'm/s' },
    { value: 'kmph', label: 'km/h' },
    { value: 'mph', label: 'mph' },
    // 시간 단위
    { value: 'sec', label: 'sec' },
    { value: 's', label: 's' },
    { value: 'min', label: 'min' },
    { value: 'h', label: 'h' },
    { value: 'day', label: 'day' },
    { value: 'week', label: 'week' },
    { value: 'month', label: 'month' },
    { value: 'year', label: 'year' },
    // 데이터 전송률
    { value: 'bps', label: 'bps' },
    { value: 'Kbps', label: 'Kbps' },
    { value: 'Mbps', label: 'Mbps' },
    { value: 'Gbps', label: 'Gbps' },
    { value: 'Bps', label: 'Bps' },
    { value: 'KBps', label: 'KBps' },
    { value: 'MBps', label: 'MBps' },
    { value: 'GBps', label: 'GBps' },
    // 화면/이미지 단위
    { value: 'pixel', label: 'pixel' },
    { value: 'px', label: 'px' },
    { value: 'dpi', label: 'dpi' },
    { value: 'ppi', label: 'ppi' },
    // 전기 단위
    { value: 'ampere', label: 'ampere' },
    { value: 'A', label: 'A' },
    { value: 'mA', label: 'mA' },
    { value: 'volt', label: 'volt' },
    { value: 'V', label: 'V' },
    { value: 'watt', label: 'watt' },
    { value: 'W', label: 'W' },
    { value: 'milliwatt', label: 'milliwatt' },
    { value: 'mW', label: 'mW' },
    { value: 'kW', label: 'kW' },
    { value: 'ohm', label: 'ohm' },
    { value: 'Ω', label: 'Ω' },
    { value: 'farad', label: 'farad' },
    { value: 'henry', label: 'henry' },
    // 온도 단위
    { value: 'Celsius', label: 'Celsius' },
    { value: '°C', label: '°C' },
    { value: '°F', label: '°F' },
    { value: 'K', label: 'K' },
    // 압력 단위
    { value: 'Pa', label: 'Pa' },
    { value: 'bar', label: 'bar' },
    { value: 'psi', label: 'psi' },
    { value: 'atm', label: 'atm' },
    // 면적 단위
    { value: 'square_meter', label: 'm²' },
    { value: 'square_cm', label: 'cm²' },
    { value: 'square_km', label: 'km²' },
    { value: 'acre', label: 'acre' },
    { value: 'hectare', label: 'hectare' },
    // 부피 단위
    { value: 'cubic_meter', label: 'm³' },
    { value: 'cubic_cm', label: 'cm³' },
    { value: 'L', label: 'L' },
    { value: 'mL', label: 'mL' },
    { value: 'gallon', label: 'gallon' },
    { value: 'quart', label: 'quart' },
    // 주파수 단위
    { value: 'Hz', label: 'Hz' },
    { value: 'kHz', label: 'kHz' },
    { value: 'MHz', label: 'MHz' },
    { value: 'GHz', label: 'GHz' },
    // 기타
    { value: '%', label: '%' },
    { value: 'ratio', label: 'ratio' },
    { value: 'count', label: 'count' },
    { value: 'custom', label: '직접입력' },
];

// PropertiesPage 탭 옵션
export const PROPERTY_TABS = [
    { key: 'property', label: 'Property' },
    { key: 'os', label: 'OS' },
    { key: 'compiler', label: 'Compiler/Execution' },
    { key: 'libraries', label: 'Libraries' },
    { key: 'organization', label: 'Organization' },
];

export const DEPENDENCY_TYPE_OPTIONS = [
    { value: '', label: 'Select Dependency Type' },
    { value: 'OWNER', label: 'OWNER' },
    { value: 'OWNED', label: 'OWNED' },
    { value: 'OWNEROWNED', label: 'OWNEROWNED' },
    { value: 'NONE', label: 'NONE' },
];

// Enumerate.java에서 가져온 추가 옵션들
export const CONNECTOR_TYPE_OPTIONS = [
    { value: '', label: 'Select Connector Type' },
    { value: 'USB', label: 'USB' },
    { value: 'IEEE1394', label: 'IEEE1394' },
    { value: 'D_SUB', label: 'D_SUB' },
    { value: 'RIBBON', label: 'RIBBON' },
    { value: 'EDGE', label: 'EDGE' },
    { value: 'PS2', label: 'PS2' },
    { value: 'DIN', label: 'DIN' },
    { value: 'RJ', label: 'RJ' },
    { value: 'MT', label: 'MT' },
    { value: 'MPO', label: 'MPO' },
    { value: 'RS', label: 'RS' },
    { value: 'ACPOWER', label: 'ACPOWER' },
    { value: 'DCPOWER', label: 'DCPOWER' },
    { value: 'BNC', label: 'BNC' },
    { value: 'MTYPE', label: 'MTYPE' },
    { value: 'NTYPE', label: 'NTYPE' },
    { value: 'TNCTYPE', label: 'TNCTYPE' },
    { value: 'FTYPE', label: 'FTYPE' },
    { value: 'SMATYPE', label: 'SMATYPE' },
    { value: 'WTB', label: 'WTB' },
];

export const MEM_TYPE_OPTIONS = [
    { value: '', label: 'Select Memory Type' },
    { value: 'NVMEM', label: 'NVMEM' },
    { value: 'VMEM', label: 'VMEM' },
];

export const NO_BIT_OPTIONS = [
    { value: '', label: 'Select Bit' },
    { value: '_16', label: '16' },
    { value: '_32', label: '32' },
    { value: '_64', label: '64' },
    { value: '_null', label: 'null' },
];

export const ORIGIN_TYPE_OPTIONS = [
    { value: '', label: 'Select Origin Type' },
    { value: 'LT', label: 'LT' },
    { value: 'LB', label: 'LB' },
    { value: 'RT', label: 'RT' },
    { value: 'RB', label: 'RB' },
    { value: 'CENTER', label: 'CENTER' },
    { value: 'LBF', label: 'LBF' },
    { value: 'LTF', label: 'LTF' },
    { value: 'RBF', label: 'RBF' },
    { value: 'RTF', label: 'RTF' },
    { value: 'LBB', label: 'LBB' },
    { value: 'LTB', label: 'LTB' },
    { value: 'RBB', label: 'RBB' },
    { value: 'RTB', label: 'RTB' },
    { value: 'CENTER3', label: 'CENTER3' },
];

export const REQ_TYPE_OPTIONS = [
    { value: '', label: 'Select Requirement Type' },
    { value: 'PACKAGE', label: 'PACKAGE' },
    { value: 'LIBRARY', label: 'LIBRARY' },
    { value: 'MIDDLEWARE', label: 'MIDDLEWARE' },
];

export const INSTANCE_TYPES_OPTIONS = [
    { value: '', label: 'Select InstanceType' },
    { value: 'Singleton', label: 'Singleton' },
    { value: 'MultitionStatic', label: 'MultitionStatic' },
    { value: 'MultitionComm', label: 'MultitionComm' },
];

export const OP_TYPES_OPTIONS = [
    { value: '', label: 'Select OpType' },
    { value: 'PERIODIC', label: 'PERIODIC' },
    { value: 'EVENTDRIVEN', label: 'EVENTDRIVEN' },
    { value: 'NONRT', label: 'NONRT' },
];

export const EXE_STATUS_OPTIONS = [
    { value: '', label: 'Select Execution Status' },
    { value: 'CREATED', label: 'CREATED' },
    { value: 'IDLE', label: 'IDLE' },
    { value: 'EXECUTING', label: 'EXECUTING' },
    { value: 'DESTRUCTED', label: 'DESTRUCTED' },
    { value: 'ERROR', label: 'ERROR' },
];

export const MO_TYPE_OPTIONS = [
    { value: '', label: 'Select MO Type' },
    { value: 'MANDATORY', label: 'MANDATORY' },
    { value: 'OPTIONAL', label: 'OPTIONAL' },
];

export const IN_OUT_TYPE_OPTIONS = [
    { value: '', label: 'Select In/Out Type' },
    { value: 'IN', label: 'IN' },
    { value: 'OUT', label: 'OUT' },
    { value: 'INOUT', label: 'INOUT' },
];

export const PHYSICAL_VIRTUAL_OPTIONS = [
    { value: '', label: 'Select Physical/Virtual' },
    { value: 'Physical', label: 'Physical' },
    { value: 'Virtual', label: 'Virtual' },
];

export const REQ_PROV_TYPE_OPTIONS = [
    { value: '', label: 'Select Required/Provided Type' },
    { value: 'REQUIRED', label: 'REQUIRED' },
    { value: 'PROVIDED', label: 'PROVIDED' },
];

export const SAFETY_LEVEL_PL_OPTIONS = [
    { value: '', label: 'Select Safety Level PL' },
    { value: 'n', label: 'n' },
    { value: 'a', label: 'a' },
    { value: 'b', label: 'b' },
    { value: 'c', label: 'c' },
    { value: 'd', label: 'd' },
    { value: 'e', label: 'e' },
];

export const SAFETY_LEVEL_SIL_OPTIONS = [
    { value: '', label: 'Select Safety Level SIL' },
    { value: '_0', label: '0' },
    { value: '_1', label: '1' },
    { value: '_2', label: '2' },
    { value: '_3', label: '3' },
    { value: '_4', label: '4' },
];

export const SAFETY_TYPE_OPTIONS = [
    { value: '', label: 'Select Safety Type' },
    { value: 'ESTOP', label: 'ESTOP' },
    { value: 'PSTOP', label: 'PSTOP' },
    { value: 'LIMWS', label: 'LIMWS' },
    { value: 'SRSC', label: 'SRSC' },
    { value: 'SRFC', label: 'SRFC' },
    { value: 'HCOLA', label: 'HCOLA' },
    { value: 'STCON', label: 'STCON' },
];

export const PL_SIL_TYPE_OPTIONS = [
    { value: '', label: 'Select PL/SIL Type' },
    { value: 'PL', label: 'PL' },
    { value: 'SIL', label: 'SIL' },
    { value: 'BOTH', label: 'BOTH' },
    { value: 'NONE', label: 'NONE' },
];

export const CYB_SECURITY_LEVEL_OPTIONS = [
    { value: '', label: 'Select Cyber Security Level' },
    { value: '_0', label: '0' },
    { value: '_1', label: '1' },
    { value: '_2', label: '2' },
    { value: '_3', label: '3' },
    { value: '_4', label: '4' },
];

export const PHY_SECURITY_LEVEL_OPTIONS = [
    { value: '', label: 'Select Physical Security Level' },
    { value: 'LatchSensor', label: 'LatchSensor' },
    { value: 'LockwithKey', label: 'LockwithKey' },
    { value: 'LockwithActuator', label: 'LockwithActuator' },
    { value: 'NotDefined', label: 'NotDefined' },
];

export const SECURITY_TYPE_OPTIONS = [
    { value: '', label: 'Select Security Type' },
    { value: 'HU_IA', label: 'HU_IA' },
    { value: 'SD_IA', label: 'SD_IA' },
    { value: 'ACNT_MGT', label: 'ACNT_MGT' },
    { value: 'ID_MGT', label: 'ID_MGT' },
    { value: 'AUTH_MGT', label: 'AUTH_MGT' },
    { value: 'WIRELEE_MGT', label: 'WIRELEE_MGT' },
    { value: 'PW_AUTH', label: 'PW_AUTH' },
    { value: 'PK_CERT', label: 'PK_CERT' },
    { value: 'STR_PK_AUTH', label: 'STR_PK_AUTH' },
    { value: 'LOGIN_NO', label: 'LOGIN_NO' },
    { value: 'ACC_UNTRUST_NET', label: 'ACC_UNTRUST_NET' },
    { value: 'AUTHORIZE', label: 'AUTHORIZE' },
    { value: 'WIRELESS_USE', label: 'WIRELESS_USE' },
    { value: 'SESS_LOCK', label: 'SESS_LOCK' },
    { value: 'SESS_TERM', label: 'SESS_TERM' },
    { value: 'SECC_CNTR', label: 'SECC_CNTR' },
    { value: 'AUDT_EVT', label: 'AUDT_EVT' },
    { value: 'TIMESTM', label: 'TIMESTM' },
    { value: 'NON_REP', label: 'NON_REP' },
    { value: 'COMM_INTG', label: 'COMM_INTG' },
    { value: 'PROT_MALI_CODE', label: 'PROT_MALI_CODE' },
    { value: 'SECUR_VERIFY', label: 'SECUR_VERIFY' },
    { value: 'SW_INTGT', label: 'SW_INTGT' },
    { value: 'INPUT_VALD', label: 'INPUT_VALD' },
    { value: 'DET_OUT', label: 'DET_OUT' },
    { value: 'ERR_HNDL', label: 'ERR_HNDL' },
    { value: 'SESS_', label: 'SESS_' },
    { value: 'INTGT', label: 'INTGT' },
    { value: 'INFO_CONFI', label: 'INFO_CONFI' },
    { value: 'INFO_PERS', label: 'INFO_PERS' },
    { value: 'CRYTO', label: 'CRYTO' },
    { value: 'RSTIC_FLOW', label: 'RSTIC_FLOW' },
    { value: 'DoS', label: 'DoS' },
    { value: 'RESOU_MGT', label: 'RESOU_MGT' },
    { value: 'CNTR_RECOV_RECON', label: 'CNTR_RECOV_RECON' },
];

export const LOCATION_OPTIONS = [
    { value: '', label: 'Select Location' },
    { value: 'ROBOT', label: 'ROBOT' },
    { value: 'EDGE', label: 'EDGE' },
    { value: 'CLOUD', label: 'CLOUD' },
];

// 사전 정의된 OS 목록
export const OS_OPTIONS = [
    {
        name: 'Ubuntu',
        versions: ['16.04', '18.04', '20.04', '21.04', '21.10', '22.04', '22.10', '23.04', '23.10']
    },
    {
        name: 'Linux',
        versions: ['16.04', '18.04', '20.04', '21.04', '21.10', '22.04', '22.10', '23.04', '23.10']
    },
    {
        name: 'Windows',
        versions: ['Vista', '7', '8', '8.1', '10', '11']
    },
    {
        name: 'Debian',
        versions: ['8', '9', '10', '11', '12']
    },
    {
        name: 'CentOS',
        versions: ['6.10', '7.6', '7.7', '7.8', '7.9', '8.0', '8.1', '8.2', '8.3', '8.4', '8.5']
    },
    {
        name: 'RedHat',
        versions: ['6', '7', '8', '9']
    },
    {
        name: 'Fedora',
        versions: ['30', '31', '32', '33', '34', '35', '36', '37', '38', '39']
    },
    {
        name: 'macOS',
        versions: ['10.14', '10.15', '11.0', '11.1', '11.2', '11.3', '11.4', '11.5', '11.6', '11.7', '12.0', '12.1', '12.2', '12.3', '12.4', '12.5', '12.6', '13.0', '13.1', '13.2', '13.3', '13.4', '13.5', '13.6', '14.0', '14.1', '14.2']
    },
    {
        name: 'FreeBSD',
        versions: ['11.4', '12.0', '12.1', '12.2', '12.3', '12.4', '13.0', '13.1', '13.2']
    },
    {
        name: 'OpenSUSE',
        versions: ['15.0', '15.1', '15.2', '15.3', '15.4', '15.5', 'Leap 15.6', 'Tumbleweed']
    },
    {
        name: 'Alpine',
        versions: ['3.12', '3.13', '3.14', '3.15', '3.16', '3.17', '3.18', '3.19']
    },
    {
        name: 'Arch',
        versions: ['rolling']
    },
    {
        name: 'Gentoo',
        versions: ['rolling']
    },
    {
        name: 'Slackware',
        versions: ['14.2', '15.0']
    },
    {
        name: 'Mint',
        versions: ['19.3', '20.0', '20.1', '20.2', '20.3', '21.0', '21.1', '21.2', '21.3']
    },
    {
        name: 'Manjaro',
        versions: ['20.0', '20.1', '20.2', '21.0', '21.1', '21.2', '21.3', '22.0', '22.1']
    },
    {
        name: 'Zorin',
        versions: ['15', '16', '17']
    },
    {
        name: 'Pop!_OS',
        versions: ['20.04', '20.10', '21.04', '21.10', '22.04', '22.10', '23.04', '23.10']
    },
    {
        name: 'Elementary',
        versions: ['5.1', '6.0', '6.1', '7.0']
    },
    {
        name: 'Kali',
        versions: ['2020.1', '2020.2', '2020.3', '2020.4', '2021.1', '2021.2', '2021.3', '2021.4', '2022.1', '2022.2', '2022.3', '2022.4', '2023.1', '2023.2', '2023.3', '2023.4']
    },
    {
        name: 'Parrot',
        versions: ['4.0', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9', '4.10', '4.11', '4.12', '4.13', '5.0', '5.1', '5.2', '5.3']
    },
    {
        name: 'BlackArch',
        versions: ['rolling']
    },
    {
        name: 'BackBox',
        versions: ['6.0', '7.0', '8.0']
    },
    {
        name: 'Bugtraq',
        versions: ['rolling']
    },
    {
        name: 'Pentoo',
        versions: ['rolling']
    },
    {
        name: 'SamuraiWTF',
        versions: ['rolling']
    },
    {
        name: 'NetworkSecurityToolkit',
        versions: ['rolling']
    },
    {
        name: 'DEFT',
        versions: ['8.2', '9.0', '9.1', '9.2', '9.3', '9.4', '9.5', '9.6', '9.7', '9.8', '9.9', '9.10', '9.11', '9.12', '9.13', '9.14', '9.15', '9.16', '9.17', '9.18', '9.19', '9.20', '9.21', '9.22', '9.23', '9.24', '9.25', '9.26', '9.27', '9.28', '9.29', '9.30', '9.31', '9.32', '9.33', '9.34', '9.35', '9.36', '9.37', '9.38', '9.39', '9.40', '9.41', '9.42', '9.43', '9.44', '9.45', '9.46', '9.47', '9.48', '9.49', '9.50', '9.51', '9.52', '9.53', '9.54', '9.55', '9.56', '9.57', '9.58', '9.59', '9.60', '9.61', '9.62', '9.63', '9.64', '9.65', '9.66', '9.67', '9.68', '9.69', '9.70', '9.71', '9.72', '9.73', '9.74', '9.75', '9.76', '9.77', '9.78', '9.79', '9.80', '9.81', '9.82', '9.83', '9.84', '9.85', '9.86', '9.87', '9.88', '9.89', '9.90', '9.91', '9.92', '9.93', '9.94', '9.95', '9.96', '9.97', '9.98', '9.99', '9.100']
    }
];

// OS 이름만 추출한 옵션 (dropdown용)
export const OS_NAME_OPTIONS = [
    { value: '', label: 'Select OS Type' },
    ...OS_OPTIONS.map(os => ({ value: os.name, label: os.name }))
];

// 특정 OS의 버전 옵션을 가져오는 함수
export const getOSVersionOptions = (osname) => {
    const os = OS_OPTIONS.find(os => os.name === osname);
    if (!os) return [{ value: '', label: 'Select Version' }];

    return [
        { value: '', label: 'Select Version' },
        ...os.versions.map(version => ({ value: version, label: version }))
    ];
};

export const COMPILER_OPTIONS = [
    {
        name: "gcc",
        versions: ["4.8", "4.9", "5.0", "6.0", "7.0", "8.0", "9.0", "10.0", "11.0", "12.0", "13.0", "14.0"]
    },
    {
        name: "g++",
        versions: ["4.8", "4.9", "5.0", "6.0", "7.0", "8.0", "9.0", "10.0", "11.0", "12.0", "13.0", "14.0"]
    },
    {
        name: "clang",
        versions: ["3.9", "4.0", "5.0", "6.0", "7.0", "8.0", "9.0", "10.0", "11.0", "12.0", "13.0", "14.0", "15.0", "16.0"]
    },
    {
        name: "clang++",
        versions: ["3.9", "4.0", "5.0", "6.0", "7.0", "8.0", "9.0", "10.0", "11.0", "12.0", "13.0", "14.0", "15.0", "16.0"]
    },
    {
        name: "msvc",
        versions: ["14.0", "14.1", "14.2", "14.3", "14.4", "14.5", "14.6", "14.7", "14.8", "14.9", "14.10", "14.11", "14.12", "14.13", "14.14", "14.15", "14.16"]
    },
    {
        name: "icc",
        versions: ["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"]
    },
    {
        name: "nvcc",
        versions: ["9.0", "9.1", "9.2", "10.0", "10.1", "10.2", "11.0", "11.1", "11.2", "11.3", "11.4", "11.5", "11.6", "11.7", "11.8", "12.0", "12.1", "12.2", "12.3", "12.4", "12.5", "12.6", "12.7", "12.8", "12.9", "13.0", "13.1", "13.2", "13.3", "13.4", "13.5", "13.6", "13.7", "13.8", "13.9", "14.0", "14.1", "14.2", "14.3", "14.4", "14.5", "14.6", "14.7", "14.8", "14.9", "15.0"]
    },
    {
        name: "javac",
        versions: ["1.8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
    },
    {
        name: "kotlinc",
        versions: ["1.0", "1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8", "1.9", "1.10", "1.11", "1.12", "1.13", "1.14", "1.15", "1.16", "1.17", "1.18", "1.19", "1.20", "1.21", "1.22", "1.23", "1.24", "1.25", "1.26", "1.27", "1.28", "1.29", "1.30", "1.31", "1.32", "1.33", "1.34", "1.35", "1.36", "1.37", "1.38", "1.39", "1.40", "1.41", "1.42", "1.43", "1.44", "1.45", "1.46", "1.47", "1.48", "1.49", "1.50", "1.51", "1.52", "1.53", "1.54", "1.55", "1.56", "1.57", "1.58", "1.59", "1.60", "1.61", "1.62", "1.63", "1.64", "1.65", "1.66", "1.67", "1.68", "1.69", "1.70", "1.71", "1.72", "1.73", "1.74", "1.75", "1.76", "1.77", "1.78", "1.79", "1.80", "1.81", "1.82", "1.83", "1.84", "1.85", "1.86", "1.87", "1.88", "1.89", "1.90", "1.91", "1.92", "1.93", "1.94", "1.95", "1.96", "1.97", "1.98", "1.99", "1.100"]
    },
    {
        name: "scalac",
        versions: ["2.10", "2.11", "2.12", "2.13", "3.0", "3.1", "3.2", "3.3", "3.4"]
    }
];

// 특정 컴파일러의 버전 옵션을 가져오는 함수
export const getCompilerVersionOptions = (compilerName) => {
    const compiler = COMPILER_OPTIONS.find(comp => comp.name === compilerName);
    if (!compiler) return [{ value: '', label: 'Select Version' }, { value: 'custom', label: '직접입력' }];

    return [
        { value: '', label: 'Select Version' },
        ...compiler.versions.map(version => ({ value: version, label: version })),
        { value: 'custom', label: '직접입력' }
    ];
};

// 컴파일러 이름 옵션 (COMPILER_OPTIONS에서 동적으로 생성)
export const COMPILER_NAME_OPTIONS = [
    { value: '', label: 'Select Compiler' },
    ...COMPILER_OPTIONS.map(comp => ({ value: comp.name, label: comp.name })),
    { value: 'custom', label: '직접입력' },
];

// CPU 아키텍처 옵션
export const CPU_ARCH_OPTIONS = [
    { value: '', label: 'Select CPU Architecture' },
    { value: 'x86', label: 'x86' },
    { value: 'x86_64', label: 'x86_64' },
    { value: 'amd64', label: 'AMD64' },
    { value: 'arm', label: 'ARM' },
    { value: 'arm64', label: 'ARM64' },
    { value: 'aarch64', label: 'AArch64' },
    { value: 'mips', label: 'MIPS' },
    { value: 'mips64', label: 'MIPS64' },
    { value: 'powerpc', label: 'PowerPC' },
    { value: 'ppc64', label: 'PPC64' },
    { value: 'sparc', label: 'SPARC' },
    { value: 'sparc64', label: 'SPARC64' },
    { value: 'riscv', label: 'RISC-V' },
    { value: 'riscv64', label: 'RISC-V64' },
    { value: 'ia64', label: 'IA-64' },
    { value: 'custom', label: '직접입력' },
];

// 비트 옵션 (더 상세)
export const BIT_OPTIONS = [
    { value: '', label: 'Select Bit' },
    { value: '_16', label: '16-bit' },
    { value: '_32', label: '32-bit' },
    { value: '_64', label: '64-bit' },
    { value: '_null', label: 'null' },
    { value: 'custom', label: '직접입력' },
];

// ServicesPage에서 사용하는 옵션들
export const SERVICE_TYPE_OPTIONS = [
    { value: '', label: 'Select Service Type' },
    { value: 'IDL', label: 'IDL' },
    { value: 'XML', label: 'XML' },
];

export const PV_TYPE_OPTIONS = [
    { value: '', label: 'Select PV Type' },
    { value: 'PHYSICAL', label: 'Physical' },
    { value: 'VIRTUAL', label: 'Virtual' },
];