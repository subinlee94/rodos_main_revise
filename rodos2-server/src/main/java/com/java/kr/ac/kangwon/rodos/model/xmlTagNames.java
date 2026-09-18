package com.java.kr.ac.kangwon.rodos.model;

/**
 * XML 태그 이름 상수 정의
 * 이 파일을 수정하면 모든 XML 태그 이름이 일괄 변경됩니다.
 */
public class xmlTagNames {
    
    // Services 관련
    public static final String NO_OF_BASIC_SERVICE = "NoOfBasicService";
    public static final String NO_OF_OPTIONAL_SERVICE = "NoOfOptionalService";
    public static final String SERVICE_XML = "ServiceXML";
    
    // ServiceProfile 관련
    public static final String ID = "ID";
    public static final String METHOD_LIST = "methodList";
    public static final String PV_TYPE = "pvType";
    public static final String MO_TYPE = "moType";
    
    // ServiceMethod 관련
    public static final String METHOD_NAME = "methodName";
    public static final String DESCRIPTION = "description";
    public static final String ARG_TYPE = "argType";
    public static final String RET_TYPE = "retType";
    public static final String REQ_PROV_TYPE = "reqProvType";
    public static final String MODULE_ID = "moduleID";
    public static final String METHOD = "Method";
    
    // ArgSpec 관련
    public static final String ARG_TYPE_ATTR = "type";  // ArgSpec의 type 속성
    public static final String VALUE_NAME = "valueName";
    public static final String INOUT = "inout";
    
    // IOVariables 관련
    public static final String INPUTS = "Inputs";
    public static final String OUTPUTS = "Outputs";
    public static final String IN_OUTS = "InOuts";
    public static final String INPUT = "Input";
    public static final String OUTPUT = "Output";
    public static final String IN_OUT = "InOut";
    
    // IOVariable 관련
    public static final String ADDITIONAL_INFO = "additionalInfo";
    
    // Property 관련
    public static final String PROPERTY = "Property";
    public static final String VALUE = "value";  // Property의 value (소문자)
    
    // Values 관련
    public static final String ITEM_LOWER = "item";  // Values의 item (소문자)
    
    // ModuleID 관련
    public static final String M_ID = "mID";
    public static final String I_ID = "iID";
    
    // cim 관련
    public static final String MODULE_NAME = "moduleName";
    public static final String MANUFACTURER = "manufacturer";
    public static final String MANUFACTURES = "manufactures";
    public static final String EXAMPLES = "examples";
    public static final String ID_N_TYPE = "idnType";
    public static final String PROPERTIES = "properties";
    public static final String IO_VARIABLES = "ioVariables";
    public static final String SERVICES = "services";
    public static final String INFRA = "infra";
    public static final String SAFE_SECURE = "safeSecure";
    public static final String MODELLING = "modelling";
    public static final String EXECUTABLE_FORM = "executableForm";
    
    // GenInfo 관련
    public static final String INFORMATION_MODEL_VERSION = "informationModelVersion";
    
    // IDnType 관련
    public static final String MODULE_ID_TAG = "moduleID";
    
    // Safety 관련
    public static final String OVERALL = "overall";
    public static final String OVERALL_SAFETY_TYPE = "OverallSafetyType";
    
    // Security 관련
    public static final String CYBER_SECURITY = "CyberSecurity";
    public static final String OVERALL_CYB_SECURITY_LEVEL = "OverallCybSecurityLevel";
    
    // SafeSecure 관련
    public static final String SAFETY = "Safety";
    public static final String SECURITY = "Security";
    
    // Properties (sim) 관련
    public static final String OS_TYPE = "osType";
    public static final String COMPILER_TYPE = "compiler";
    public static final String EXECUTION_TYPES = "exeType";
    public static final String ITEM_UPPER = "Item";  // Properties의 Item (대문자)
    public static final String LIBRARIES = "Libraries";
    public static final String LIBRARY = "Library";
    public static final String ORGANIZATION = "organization";
    
    // OSType 관련
    public static final String TYPE = "type";
    public static final String BIT = "bit";
    public static final String VERSION = "version";
    
    // CompilerType 관련
    public static final String OS_NAME = "osName";
    public static final String VER_RANGE_OS = "verRangeOS";
    public static final String COMPILER_NAME = "compilerName";
    public static final String VER_RANGE_COMPILER = "verRangeCompiler";
    public static final String BIT_N_CPU_ARCH = "bitnCPUarch";
    
    // ExecutionType 관련
    public static final String PRIORITY = "priority";
    public static final String OPTYPE = "optype";
    public static final String HARD_RT = "hardRT";
    public static final String TIME_CONSTRAINT = "timeConstraint";
    public static final String INSTANCE_TYPE = "instanceType";
    
    // Library 관련
    public static final String NAME = "name";
    
    // Organization 관련
    public static final String OWNER = "owner";
    public static final String DEPENDENCY = "dependency";
}
