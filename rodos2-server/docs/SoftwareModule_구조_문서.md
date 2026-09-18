# SoftwareModule 클래스 구조 문서

## 목차
1. [개요](#개요)
2. [SoftwareModule 클래스](#softwaremodule-클래스)
3. [하위 클래스 구조](#하위-클래스-구조)
4. [클래스 상세 설명](#클래스-상세-설명)

---

## 개요

`SoftwareModule`은 RODOS2 시스템에서 소프트웨어 모듈의 정보를 표현하는 핵심 클래스입니다. 이 클래스는 CIM(Common Information Model) 기반의 XML 구조를 Java 객체로 매핑하며, 모듈의 모든 메타데이터를 포함합니다.

### 주요 특징
- XML 직렬화/역직렬화 지원 (Jackson XML)
- 계층적 구조로 모듈 정보 관리
- 모듈 실행, 속성, I/O 변수, 서비스 등 포괄적 정보 포함

---

## SoftwareModule 클래스

### 클래스 정보
- **패키지**: `com.java.kr.ac.kangwon.rodos.model.sim`
- **XML 루트 엘리먼트**: `<Module>`
- **타입 속성**: `type="SIM"` (기본값)

### 주요 필드

| 필드명 | 타입 | XML 태그 | 설명 |
|--------|------|----------|------|
| `type` | `String` | `@type` (속성) | 모듈 타입 (기본값: "SIM") |
| `moduleName` | `String` | `<ModuleName>` | 모듈 이름 |
| `manufacturer` | `String` | `<Manufactures>` | 제조사 |
| `description` | `String` | `<Description>` | 설명 |
| `examples` | `String` | `<Examples>` | 예제 |
| `idnType` | `SWIDnType` | `<IDnType>` | 식별자 및 타입 정보 |
| `properties` | `Properties` | `<Properties>` | 모듈 속성 |
| `ioVariables` | `IOVariables` | `<IOVariables>` | 입출력 변수 |
| `services` | `Services` | `<Services>` | 서비스 정보 |
| `infrastructure` | `Infrastructure` | `<Infra>` | 인프라스트럭처 |
| `safeSecure` | `SafeSecure` | `<SafeSecure>` | 안전/보안 정보 |
| `modelling` | `Modelling` | `<Modelling>` | 모델링 정보 |
| `executableForm` | `ExecutableForm` | `<ExecutableForm>` | 실행 가능한 형태 |

### 주요 메서드

#### 정적 메서드
- `fromXml(String xmlContent)`: XML 문자열을 SoftwareModule 객체로 파싱

#### 인스턴스 메서드
- `getExecutableCommand()`: 첫 번째 ExeForm의 ShellCmd 반환
- `getExecutableImage()`: 첫 번째 ExeForm의 ExeFileURL 반환

---

## 하위 클래스 구조

```
SoftwareModule
├── SWIDnType (IDnType 상속)
│   └── ModuleID
│       ├── mID
│       └── iID
├── Properties
│   ├── Property (List)
│   │   ├── Values
│   │   └── Property (List, 재귀적)
│   ├── OSType
│   │   └── NoBit (Enum)
│   ├── CompilerType
│   │   └── RangeString
│   ├── ExecutionType (List)
│   ├── Library (List)
│   └── Organization
│       └── Owner
│           └── ModuleID
├── IOVariables
│   ├── Input (List, IOVariable 상속)
│   │   └── Input (List, 재귀적)
│   ├── Output (List, IOVariable 상속)
│   │   └── Output (List, 재귀적)
│   └── InOut (List, IOVariable 상속)
│       └── InOut (List, 재귀적)
├── Services
│   └── ServiceProfile (List)
│       ├── ServiceMethod (List)
│       │   └── ArgSpec (List)
│       └── NameValue (List)
├── Infrastructure
│   ├── Database (List<InfraType>)
│   ├── Middleware (List<InfraType>)
│   └── Communications (List)
│       └── Communication
│           ├── mostTopProtocol (List<Protocol>)
│           └── underlyingProtocol (Protocol)
├── SafeSecure
│   ├── Safety
│   │   └── OverallSafety
│   ├── Security
│   │   └── CyberSecurity
│   ├── SafetyFunction (List)
│   └── Security (List)
├── Modelling
│   └── ModelCase (List)
│       ├── ModelFile (List)
│       ├── DynamicSW (List, ExeForm 상속)
│       └── NameValue (List)
└── ExecutableForm
    ├── ExeForm (List)
    │   ├── Property (List)
    │   ├── ExeFileURL
    │   └── ShellCmd
    └── LibURLs
        └── urlnPaths (List<String>)
```

---

## 클래스 상세 설명

### 1. SWIDnType

**패키지**: `com.java.kr.ac.kangwon.rodos.model.sim`  
**상속**: `IDnType`

모듈의 식별자 및 타입 정보를 담는 클래스입니다.

#### 필드
- `mSWAspects` (List<ModuleID>): SW Aspects 목록

#### 상위 클래스: IDnType
- `type` (String): 타입
- `moduleID` (ModuleID): 모듈 ID
- `informationModelVersion` (String): 정보 모델 버전

#### ModuleID
- `mID` (String): 모듈 ID
- `iID` (String): 인스턴스 ID

---

### 2. Properties

**패키지**: `com.java.kr.ac.kangwon.rodos.model.sim`

모듈의 속성 정보를 담는 클래스입니다.

#### 필드
- `properties` (List<Property>): 속성 목록
- `osType` (OSType): 운영체제 타입
- `compilerType` (CompilerType): 컴파일러 타입
- `executionTypes` (List<ExecutionType>): 실행 타입 목록
- `libraries` (List<Library>): 라이브러리 목록
- `organization` (Organization): 조직 정보

#### Property
- `name` (String): 속성 이름
- `type` (String): 속성 타입
- `unit` (String): 단위
- `description` (String): 설명
- `complexType` (ComplexType Enum): 복합 타입
- `complexName` (String): 복합 이름
- `values` (Values): 값 목록
- `properties` (List<Property>): 중첩 속성 (재귀적)

#### Values
- `item` (List<String>): 값 목록

#### OSType
- `type` (String): OS 타입
- `bit` (NoBit Enum): 비트 수
- `version` (String): 버전

#### CompilerType
- `osName` (String): OS 이름
- `verRangeOS` (RangeString): OS 버전 범위
- `compilerName` (String): 컴파일러 이름
- `verRangeCompiler` (RangeString): 컴파일러 버전 범위
- `bitsnCPUarch` (String): 비트 및 CPU 아키텍처

#### RangeString
- `min` (String): 최소값
- `max` (String): 최대값

#### ExecutionType
- `priority` (String): 우선순위
- `opType` (OpTypes Enum): 작업 타입
- `hardRT` (String): 하드 실시간 여부
- `timeConstraint` (String): 시간 제약
- `instanceType` (InstanceTypes Enum): 인스턴스 타입

#### Library
- `name` (String): 라이브러리 이름
- `version` (String): 버전

#### Organization
- `owner` (Owner): 소유자
- `dependency` (String): 의존성

#### Owner
- `moduleID` (ModuleID): 모듈 ID

---

### 3. IOVariables

**패키지**: `com.java.kr.ac.kangwon.rodos.model.cim`

입출력 변수 정보를 담는 클래스입니다.

#### 필드
- `Inputs` (List<Input>): 입력 변수 목록
- `Outputs` (List<Output>): 출력 변수 목록
- `InOuts` (List<InOut>): 입출력 변수 목록

#### IOVariable (추상 클래스)
모든 I/O 변수의 기본 클래스입니다.

**공통 필드**:
- `name` (String): 변수 이름
- `className` (String): 클래스 이름
- `complex` (String): 복합 타입
- `type` (String): 타입
- `values` (Values): 값 목록
- `unit` (String): 단위
- `description` (String): 설명
- `inDataType` (String): 입력 데이터 타입
- `additionalInfo` (List<NameValue>): 추가 정보
- `complexType` (ComplexType Enum): 복합 타입

**추상 메서드**:
- `getClassType()`: 하위 타입 목록 반환

#### Input (IOVariable 상속)
- `inputs` (List<Input>): 중첩 입력 변수 (재귀적)

#### Output (IOVariable 상속)
- `outputs` (List<Output>): 중첩 출력 변수 (재귀적)

#### InOut (IOVariable 상속)
- `InOuts` (List<InOut>): 중첩 입출력 변수 (재귀적)

---

### 4. Services

**패키지**: `com.java.kr.ac.kangwon.rodos.model.cim`

서비스 정보를 담는 클래스입니다.

#### 필드
- `noOfBasicService` (String): 기본 서비스 개수
- `noOfOptionalService` (String): 선택적 서비스 개수
- `serviceProfiles` (List<ServiceProfile>): 서비스 프로파일 목록

#### ServiceProfile
- `type` (String): 타입 (IDL, XML)
- `ID` (String): ID
- `PVType` (PhysicalVirtual Enum): 물리/가상 타입
- `MOType` (MOType Enum): MO 타입
- `path` (String): 경로
- `additionalInfo` (List<NameValue>): 추가 정보
- `serviceMethods` (List<ServiceMethod>): 서비스 메서드 목록

#### ServiceMethod
- `methodName` (String): 메서드 이름
- `argSpecs` (List<ArgSpec>): 인자 명세 목록
- `retType` (String): 반환 타입
- `MOType` (MOType Enum): MO 타입
- `reqProvType` (ReqProvType Enum): 요청/제공 타입

#### ArgSpec
- `argType` (String): 인자 타입
- `argName` (String): 인자 이름
- `argIO` (InOutType Enum): 입출력 타입

---

### 5. Infrastructure

**패키지**: `com.java.kr.ac.kangwon.rodos.model.sim`

인프라스트럭처 정보를 담는 클래스입니다.

#### 필드
- `databases` (List<InfraType>): 데이터베이스 목록
- `middlewares` (List<InfraType>): 미들웨어 목록
- `communications` (List<Communications>): 통신 정보 목록

#### InfraType
- `name` (String): 이름
- `version` (RangeString): 버전 범위

#### Communications
- `communicationList` (List<Communication>): 통신 목록

#### Communication
- `mostTopProtocol` (List<Protocol>): 최상위 프로토콜 목록
- `underlyingProtocol` (Protocol): 하위 프로토콜

#### Protocol
- `name` (String): 프로토콜 이름
- `layerType` (String): 레이어 타입

---

### 6. SafeSecure

**패키지**: `com.java.kr.ac.kangwon.rodos.model.cim`

안전 및 보안 정보를 담는 클래스입니다.

#### 필드
- `safety` (Safety): 안전 정보
- `security` (Security): 보안 정보
- `overallValidSafetyLevelType` (PLSILType Enum): 전체 유효 안전 레벨 타입
- `overallSafetyLevelPL` (SafetyLevelPL Enum): 전체 안전 레벨 PL
- `overallSafetyLevelSIL` (SafetyLevelSIL Enum): 전체 안전 레벨 SIL
- `overallPhySecurityLevel` (PhySecurityLevel Enum): 전체 물리 보안 레벨
- `overallCybSecurityLevel` (CybSecurityLevel Enum): 전체 사이버 보안 레벨
- `safetyFunction` (List<SafetyFunction>): 안전 기능 목록
- `inCybSecurityLevel` (List<Security>): 사이버 보안 레벨 목록
- `additionalInfo` (List<NameValue>): 추가 정보

#### Safety
- `overall` (OverallSafety): 전체 안전 정보

#### OverallSafety
- `overallSafetyType` (String): 전체 안전 타입

#### Security
- `cyberSecurity` (CyberSecurity): 사이버 보안 정보
- `type` (SecurityType Enum): 보안 타입
- `value` (CybSecurityLevel Enum): 보안 레벨 값

#### CyberSecurity
- `overallCybSecurityLevel` (String): 전체 사이버 보안 레벨

#### SafetyFunction
- `safetyFunctionType` (SafetyType Enum): 안전 기능 타입
- `validSafetyLevelType` (PLSILType Enum): 유효 안전 레벨 타입
- `eachSafetyLevelPL` (SafetyLevelPL Enum): 각 안전 레벨 PL
- `eachSafetyLevelSIL` (SafetyLevelSIL Enum): 각 안전 레벨 SIL

---

### 7. Modelling

**패키지**: `com.java.kr.ac.kangwon.rodos.model.sim`

모델링 정보를 담는 클래스입니다.

#### 필드
- `list_simulationModel` (List<ModelCase>): 시뮬레이션 모델 목록

#### ModelCase
- `simulator` (String): 시뮬레이터 이름
- `modelFiles` (List<ModelFile>): 모델 파일 목록
- `dynamicSWs` (List<DynamicSW>): 동적 소프트웨어 목록
- `additionalInfo` (List<NameValue>): 추가 정보

#### ModelFile
- `type` (String): 파일 타입
- `fileName` (String): 파일 이름
- `filePath` (String): 파일 경로

#### DynamicSW (ExeForm 상속)
ExeForm의 모든 필드를 상속받습니다.

---

### 8. ExecutableForm

**패키지**: `com.java.kr.ac.kangwon.rodos.model.sim`

실행 가능한 형태 정보를 담는 클래스입니다.

#### 필드
- `exeForms` (List<ExeForm>): 실행 형태 목록
- `lib` (LibURLs): 라이브러리 URL 목록

#### ExeForm
- `exeFileURL` (String): 실행 파일 URL
- `shellCmd` (String): 셸 명령어
- `properties` (List<Property>): 속성 목록

#### LibURLs
- `urlnPaths` (List<String>): URL 및 경로 목록

---

### 9. 공통 클래스

#### NameValue
- `name` (String): 이름
- `value` (String): 값

---

## XML 구조 예시

```xml
<Module type="SIM">
    <ModuleName>ExampleModule</ModuleName>
    <Manufactures>Example Corp</Manufactures>
    <Description>Example Description</Description>
    <IDnType>
        <ModuleID>
            <mID>12345678</mID>
            <iID>00000001</iID>
        </ModuleID>
        <SWAspects>
            <ModuleID>...</ModuleID>
        </SWAspects>
    </IDnType>
    <Properties>
        <Property name="prop1" type="String">...</Property>
        <OSType>...</OSType>
        <CompilerType>...</CompilerType>
    </Properties>
    <IOVariables>
        <Inputs>
            <input name="input1" type="String">...</input>
        </Inputs>
        <output name="output1" type="String">...</output>
    </IOVariables>
    <Services>...</Services>
    <Infra>...</Infra>
    <SafeSecure>...</SafeSecure>
    <Modelling>...</Modelling>
    <ExecutableForm>
        <ExeForms>
            <item>
                <ExeFileURL>docker://image:tag</ExeFileURL>
                <ShellCmd>rosrun package node</ShellCmd>
            </item>
        </ExeForms>
        <lib>...</lib>
    </ExecutableForm>
</Module>
```

---

## 주요 사용 패턴

### 1. XML에서 객체로 변환
```java
String xmlContent = "...";
SoftwareModule module = SoftwareModule.fromXml(xmlContent);
```

### 2. 실행 명령어 및 이미지 가져오기
```java
String command = module.getExecutableCommand();
String image = module.getExecutableImage();
```

### 3. 속성 접근
```java
Properties props = module.getProperties();
List<Property> propertyList = props.getProperties();
```

### 4. I/O 변수 접근
```java
IOVariables ioVars = module.getIoVariables();
List<Input> inputs = ioVars.getInputs();
List<Output> outputs = ioVars.getOutputs();
```

---

## 주의사항

1. **재귀적 구조**: Property, Input, Output, InOut 클래스는 자기 자신을 포함할 수 있는 재귀적 구조입니다.

2. **Jackson XML 어노테이션**: 모든 클래스는 `@JacksonXmlProperty`, `@JacksonXmlElementWrapper` 등의 어노테이션을 사용하여 XML 직렬화/역직렬화를 지원합니다.

3. **Null 안전성**: 대부분의 리스트 필드는 null 체크 후 초기화하는 패턴을 사용합니다.

4. **Enum 타입**: 많은 필드가 `Enumerate` 클래스의 Enum 타입을 사용합니다.

5. **JSON 직렬화 제외**: `@JsonIgnore` 어노테이션이 붙은 필드는 JSON 직렬화에서 제외됩니다.

---

## 참고사항

- 이 문서는 RODOS2 서버의 SoftwareModule 클래스 구조를 기반으로 작성되었습니다.
- 실제 XML 구조는 CIM(Common Information Model) 표준을 따릅니다.
- 모든 클래스는 Jackson XML 라이브러리를 사용하여 XML 직렬화/역직렬화를 지원합니다.
