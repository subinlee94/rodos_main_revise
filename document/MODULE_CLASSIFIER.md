# 모듈 분류기 (ModuleClassifier) 정리 문서

## 개요

`ModuleClassifier`는 모듈 ID를 분석하여 모듈을 자동으로 분류하는 서비스입니다. 모듈 ID의 CategoryID 부분을 비트 패턴으로 분석하여 AI, Software, Controller, Edge, Cloud, Robot 등으로 분류합니다.

**파일 위치**: `rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/ModuleClassifier.java`

---

## 주요 메서드

### 1. `classifyModule(String moduleID)` - 메인 분류 메서드

모듈 ID를 분석하여 분류를 반환합니다.

**반환값**: `"ai"`, `"software"`, `"controller"`, `"edge"`, `"cloud"`, `"robot"`, `"unknown"`

---

## 분류 프로세스

### Step 1: mCID 추출

모듈 ID에서 CategoryID 부분(mCID)을 추출합니다.

#### 모듈 ID 형태

**새로운 형태** (현재 사용):
```
mID-iID
예: 0c95eb9da4e156248d865fea1499ca3fff00000000000000baffffaa140000-00
```

**기존 형태** (레거시):
```
mID-iID-iID-iID-iID-mCID
예: d6c36f43f76e58ca90b2c49be0841fb000FFFFFFFFFFFFFF000004052001000-00-00-00-405-2001000
```

#### mCID 추출 로직

```java
String[] mIDs = moduleID.split("-");

if (mIDs.length >= 5) {
    // 기존 형태: 5개 이상의 부분으로 분리됨
    mCID = mIDs[4];  // 5번째 요소
} else if (mIDs.length == 2) {
    // 새로운 형태: 2개 부분으로 분리됨 (mID-iID)
    String mID = mIDs[0];
    mCID = mID.substring(mID.length() - 6);  // mID의 마지막 6자리
}
```

**예시**:
- 새로운 형태: `"0c95eb9da4e156248d865fea1499ca3fff00000000000000baffffaa140000-00"`
  - mID: `"0c95eb9da4e156248d865fea1499ca3fff00000000000000baffffaa140000"`
  - mCID: `"140000"` (마지막 6자리)

---

### Step 2: 16진수 → 2진수 변환

mCID를 24비트 2진수로 변환합니다.

```java
int dCID = Integer.parseInt(mCID, 16);  // 16진수 → 10진수
String bCID = toBinaryStringWithLeadingZero(dCID, 24);  // 10진수 → 24비트 2진수
```

**예시**:
- mCID: `"140000"` (16진수)
- dCID: `1310720` (10진수)
- bCID: `"000101000000000000000000"` (24비트 2진수)

---

### Step 3: 비트 패턴 매칭

24비트 2진수를 분석하여 분류를 결정합니다.

#### 비트 구조

```
[0-1비트] [2-7비트] [8-13비트] [14-23비트]
  Level0   Level1    Level2     Reserved
```

---

## 분류 규칙

### 1. AI Module 분류

**조건**: bCID가 다음 패턴으로 시작
- `"100010"` (시작 6비트)
- `"100011"` (시작 6비트)
- `"100101"` (시작 6비트)

**반환값**: `"ai"`

**의미**: RECOGNITION 관련 AI 모듈

---

### 2. Controller 분류

**조건**: bCID가 `"01"`로 시작 (시작 2비트)

**세분화 로직**:
```java
String classification = bCID.substring(2, 6);  // 2-6비트 (Level1)
if (classification.equals("0000") || classification.equals("0001")) {
    return "robot";
} else {
    return "edge";
}
```

**반환값**:
- `"robot"`: Level1이 `"0000"` 또는 `"0001"`
- `"edge"`: 그 외의 Level1 값

**의미**: Controller 모듈 중에서 Robot과 Edge로 구분

---

### 3. Software 분류

**조건**: bCID가 `"01"`로 시작하지 않음 (AI도 아님)

**세분화 로직**:
```java
String softwareType = bCID.substring(6, 8);  // 6-8비트
if (softwareType.equals("11") || softwareType.equals("10")) {
    return "cloud";
} else {
    return "software";
}
```

**반환값**:
- `"cloud"`: 6-8비트가 `"11"` 또는 `"10"`
- `"software"`: 그 외의 값

**의미**: Software 모듈 중에서 Cloud와 일반 Software로 구분

---

## 분류 결정 트리

```
모듈 ID 입력
    ↓
mCID 추출 (마지막 6자리 또는 mIDs[4])
    ↓
16진수 → 24비트 2진수 변환
    ↓
비트 패턴 분석
    ↓
┌─────────────────────────────────────┐
│ 시작 6비트가 "100010", "100011",    │
│ 또는 "100101"인가?                  │
└─────────────────────────────────────┘
            │
    ┌───────┴───────┐
    YES             NO
    │               │
  "ai"        ┌─────────────────────┐
              │ 시작 2비트가 "01"인가? │
              └─────────────────────┘
                    │
            ┌───────┴───────┐
            YES             NO
            │               │
      ┌─────┴─────┐    ┌────┴────┐
      │           │    │         │
  2-6비트     2-6비트  6-8비트  6-8비트
  "0000"     그 외    "11"     그 외
  "0001"              "10"
      │               │         │
  "robot"          "edge"   "cloud"  "software"
```

---

## 예시

### 예시 1: AI Module

**모듈 ID**: `"a1b2c3d4...800400-00"` (mCID = `"800400"`)

1. mCID 추출: `"800400"`
2. 16진수 → 10진수: `8388608`
3. 24비트 2진수: `"100000000000010000000000"`
4. 시작 6비트: `"100000"` → AI 패턴 아님
5. 시작 2비트: `"10"` → Controller 아님
6. 6-8비트: `"00"` → Cloud 아님
7. **결과**: `"software"`

**참고**: 실제 AI 모듈은 시작 6비트가 `"100010"`, `"100011"`, 또는 `"100101"`이어야 합니다.

---

### 예시 2: Robot Module

**모듈 ID**: `"a1b2c3d4...800400-00"` (mCID = `"010000"`)

1. mCID 추출: `"010000"`
2. 16진수 → 10진수: `65536`
3. 24비트 2진수: `"000000010000000000000000"`
4. 시작 2비트: `"00"` → Controller 아님
5. **결과**: `"software"`

**참고**: 실제 Robot은 시작 2비트가 `"01"`이고, 2-6비트가 `"0000"` 또는 `"0001"`이어야 합니다.

---

### 예시 3: Edge Module

**모듈 ID**: `"a1b2c3d4...800400-00"` (mCID = `"014000"`)

1. mCID 추출: `"014000"`
2. 16진수 → 10진수: `81920`
3. 24비트 2진수: `"000000010100000000000000"`
4. 시작 2비트: `"01"` → Controller
5. 2-6비트: `"0000"` → Robot 아님 (실제로는 `"0010"`)
6. **결과**: `"edge"`

---

## 추가 메서드

### 2. `classifyController(String moduleID)` - Controller 세분화

Controller 모듈을 Edge와 Robot으로 구분합니다.

**반환값**: `"edge"`, `"robot"`, `"unknown"`

**로직**: `classifyModule()`의 Controller 분류 부분과 동일

---

### 3. `isComposite(String moduleID)` - Composite/Basic 구분

모듈이 Composite인지 Basic인지 구분합니다.

**반환값**: `"Com"`, `"Bas"`, `"unknown"`

#### 로직

1. **PID 추출**:
   - 기존 형태: `mIDs[1]` (2번째 요소)
   - 새로운 형태: `mIDs[1]` (iID를 PID로 사용)

2. **PID 분석**:
   ```java
   Long dPID = Long.parseLong(PID, 16);
   if (dPID == 0) {
       return "Bas";  // Basic
   } else {
       return "Com";  // Composite
   }
   ```

**의미**:
- PID가 `0`이면 Basic 모듈
- PID가 `0`이 아니면 Composite 모듈

---

## XML 파싱 기능

### 4. `xmlToSoftwareModule(String xml)` - XML → SoftwareModule 변환

XML 문자열을 `SoftwareModule` 객체로 변환합니다.

**예외**: XML 파싱 실패 시 `IOException` 발생

---

### 5. `xmlToSoftwareModuleSafe(String xml, String fallbackName)` - 안전한 XML 파싱

XML 파싱 실패 시에도 기본 `SoftwareModule` 객체를 반환합니다.

**특징**:
- 파싱 실패 시 XML에서 직접 `moduleID` 추출 시도
- `extractModuleIDFromXML()` 메서드 사용

---

### 6. `extractModuleIDFromXML(String xml, SoftwareModule module)` - XML에서 moduleID 추출

XML 문자열에서 정규표현식으로 `<mID>`와 `<iID>`를 추출하여 `SoftwareModule`에 설정합니다.

**사용 시나리오**:
- XML 파싱이 실패했지만 moduleID는 추출해야 할 때
- 부분 파싱 실패 시 대체 수단

---

## 유틸리티 메서드

### 7. `toBinaryStringWithLeadingZero(int num, int totalBits)` - 2진수 변환 (패딩 포함)

10진수를 2진수로 변환하되, 앞자리 0이 생략되지 않도록 패딩을 추가합니다.

**예시**:
- 입력: `num = 5`, `totalBits = 24`
- 출력: `"000000000000000000000101"` (24비트)

---

## 사용 예시

### 백엔드에서 사용

```java
@Autowired
private ModuleClassifier moduleClassifier;

// 모듈 분류
String classification = moduleClassifier.classifyModule(moduleID);
// 결과: "ai", "software", "controller", "edge", "cloud", "robot"

// Controller 세분화
String controllerType = moduleClassifier.classifyController(moduleID);
// 결과: "edge" 또는 "robot"

// Composite/Basic 구분
String compositeType = moduleClassifier.isComposite(moduleID);
// 결과: "Com" 또는 "Bas"
```

### IMRegistryController에서 사용

```java
// 모듈 업로드 시 자동 분류
String detectedClassification = moduleClassifier.classifyModule(im.getModuleID());
im.setClassification(detectedClassification);
```

---

## 분류 결과 요약

| 분류 | 조건 | 비트 패턴 |
|------|------|-----------|
| **ai** | 시작 6비트가 `"100010"`, `"100011"`, 또는 `"100101"` | `100010...`, `100011...`, `100101...` |
| **robot** | 시작 2비트가 `"01"` AND 2-6비트가 `"0000"` 또는 `"0001"` | `010000...`, `010001...` |
| **edge** | 시작 2비트가 `"01"` AND 2-6비트가 그 외 | `010010...`, `010100...` 등 |
| **cloud** | 시작 2비트가 `"01"` 아님 AND 6-8비트가 `"11"` 또는 `"10"` | `00...11...`, `00...10...` |
| **software** | 위 조건들에 해당하지 않음 | 그 외 모든 경우 |

---

## 주의사항

1. **모듈 ID 형식**: 새로운 형태(`mID-iID`)와 기존 형태(5개 이상 부분) 모두 지원
2. **mCID 위치**: 
   - 새로운 형태: mID의 마지막 6자리
   - 기존 형태: `mIDs[4]` (5번째 요소)
3. **비트 패턴**: 24비트 2진수로 변환 후 패턴 매칭
4. **예외 처리**: 파싱 실패 시 `"unknown"` 반환
5. **CategoryID**: 모듈 ID의 마지막 6자리 16진수가 CategoryID (mCID)

---

## 관련 파일

- **ModuleClassifier.java**: `rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/ModuleClassifier.java`
- **IMRegistryController.java**: 모듈 업로드 시 분류 사용
- **SharedUserStateService.java**: Canvas 상태 저장 시 분류 사용

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024년
