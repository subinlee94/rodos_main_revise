# Composite Module 개발 및 개선 사항 문서

## 개요
이 문서는 컨트롤러 모듈을 Composite Module로 변환하는 기능과 관련된 개발 및 개선 사항을 정리합니다.

---

## 1. 주요 개발 내용

### 1.1 컨트롤러 드래그 앤 드롭 시 정보 모델 자동 로딩

#### 문제점
- 컨트롤러를 캔버스로 드래그 앤 드롭할 때 `controllerInfoModel`이 비어있어서, 사용자가 수동으로 모든 정보를 입력해야 했습니다.

#### 해결 방법
1. **프론트엔드**: 드래그 앤 드롭 시 `moduleID`를 포함하여 전달
   - **파일**: `rodos2-ui/src/hooks/useRegistryModules.js`
   - **변경 내용**: `handleDragStart`에서 컨트롤러 타입일 때 `moduleID`와 초기 `controllerInfoModel` 포함

2. **프론트엔드**: 드롭 시 서버에서 정보 모델 데이터 가져오기
   - **파일**: `rodos2-ui/src/hooks/useCanvasDragAndDrop.js`
   - **변경 내용**: 
     - `/api/registry/module/{moduleId}/model-data` API 호출
     - 받은 데이터를 정규화하여 `addHWModule`에 전달

3. **백엔드**: 모듈 정보 모델 데이터 조회 API 추가
   - **파일**: `rodos2-server/src/main/java/.../controller/IMRegistryController.java`
   - **엔드포인트**: `GET /api/registry/module/{moduleId}/model-data`
   - **기능**: 
     - Registry에서 모듈 XML 조회
     - XML을 파싱하여 `SoftwareModule` 또는 `CompModule` 객체로 변환
     - JSON 형식으로 반환

#### 데이터 흐름
```
[Registry에서 컨트롤러 드래그]
    ↓
[useRegistryModules - handleDragStart]
    ↓ moduleID, controllerInfoModel 포함
[Canvas 드롭]
    ↓
[useCanvasDragAndDrop - handleDrop]
    ↓ GET /api/registry/module/{moduleId}/model-data
[백엔드 - IMRegistryController]
    ↓ XML 파싱 → SoftwareModule/CompModule
[프론트엔드 - 정규화]
    ↓
[useCanvasState - addHWModule]
    ↓ controllerInfoModel 저장
[캔버스에 컨트롤러 표시 (정보 모델 포함)]
```

---

### 1.2 소프트웨어 모듈 드래그 앤 드롭 시 Enum 오류 수정

#### 문제점
- 소프트웨어 모듈을 드래그 앤 드롭할 때 XML 파싱 중 enum 값이 비어있거나 잘못된 경우 `No enum constant` 오류 발생
- 예: `overallValidSafetyLevelType=""` → `PLSILType` enum 변환 실패

#### 해결 방법
1. **백엔드**: `XmlMapper` 설정 개선
   - **파일**: `rodos2-server/src/main/java/.../service/ModuleClassifier.java`
   - **변경 내용**: `READ_UNKNOWN_ENUM_VALUES_AS_NULL` 설정 추가

2. **백엔드**: 모델 레벨에서 enum 처리 강화
   - **파일**: `rodos2-server/src/main/java/.../model/cim/SafeSecure.java`
   - **변경 내용**: 
     - enum setter 메서드에서 `null`, 빈 문자열, `IllegalArgumentException` 처리
     - 오류 발생 시 `null`로 설정하여 크래시 방지

#### 코드 예시
```java
public void setOverallValidSafetyLevelType(String overallValidSafetyLevelType) {
    if (overallValidSafetyLevelType == null || overallValidSafetyLevelType.trim().isEmpty()) {
        this.overallValidSafetyLevelType = null;
        return;
    }
    try {
        this.overallValidSafetyLevelType = Enum.valueOf(Enumerate.PLSILType.class, overallValidSafetyLevelType);
    } catch (IllegalArgumentException e) {
        System.err.println("Invalid PLSILType value: " + overallValidSafetyLevelType + ". Setting to null.");
        this.overallValidSafetyLevelType = null;
    }
}
```

---

### 1.3 Save as Composite Module 위저드 개선

#### 요구사항
- 컨트롤러 우클릭 → "Save as Composite Module" 클릭 시 입력 페이지들이 나오는데, Check 페이지만 표시되도록 변경

#### 해결 방법
1. **프론트엔드**: 위저드 모드 전달
   - **파일**: `rodos2-ui/src/components/ide/Canvas.js`
   - **변경 내용**: 우클릭 메뉴에서 `onOpenCompositeWizard(idx, hwModule, 'composite-check-only')` 호출

2. **프론트엔드**: IDE에서 모드 유지
   - **파일**: `rodos2-ui/src/components/ide/IDE.js`
   - **변경 내용**: `handleOpenCompositeWizard`에서 모드를 위저드 데이터에 포함

3. **프론트엔드**: 위저드에서 모드에 따라 스텝 제어
   - **파일**: `rodos2-ui/src/components/wizard/WizardDialog.js`
   - **변경 내용**: 
     - `mode === 'composite-check-only'`일 때 `['Check']` 스텝만 표시
     - 하단 버튼도 취소/완료만 표시

#### 동작 흐름
```
[컨트롤러 우클릭]
    ↓
[Save as Composite Module 클릭]
    ↓ mode: 'composite-check-only'
[WizardDialog 열림]
    ↓
[Check 페이지만 표시]
    ↓
[완료 버튼 클릭]
    ↓
[Composite Module 저장]
```

---

### 1.4 모듈 이동 시 API 호출 최적화

#### 문제점
- 모듈을 드래그하여 이동할 때 `mousemove` 이벤트마다 `saveCanvasState()`가 호출되어 과도한 API 요청 발생

#### 해결 방법
- **파일**: `rodos2-ui/src/hooks/useCanvasState.js`
- **변경 내용**: 
  - `updateHWModulePosition`, `updateSWModulePosition`에서 즉시 저장 제거
  - 기존 디바운스 자동 저장(2초)만 사용하도록 변경

#### 최적화 효과
- **이전**: 드래그 중 매번 API 호출 (수십~수백 회)
- **이후**: 드래그 완료 후 2초 후 한 번만 호출

---

### 1.5 Composite Module 아이콘 및 라벨 개선

#### 요구사항
1. Save as Composite 후 검정 육각형 모양이 아닌, 기존 사각형 모양 유지 + 회색으로 변경
2. `(Composite)` 라벨 제거

#### 해결 방법
- **파일**: `rodos2-ui/src/components/ide/Canvas.js`
- **변경 내용**: 
  1. `hw.isComposite && originalModuleType === 'controller'`인 경우 `Rectangle` 컴포넌트 사용 + 회색(`#9E9E9E`) 색상
  2. 라벨 표시 로직에서 `(Composite)` 제거

#### 렌더링 로직
```javascript
// Composite이지만 원래 컨트롤러였던 경우
if (hw.isComposite && hw.originalModuleType === 'controller') {
    // 사각형 + 회색
    <Rectangle color="#9E9E9E" ... />
} else if (hw.isComposite) {
    // 일반 Composite는 육각형
    <Hexagon ... />
}
```

---

## 2. 관련 파일 목록

### 프론트엔드
- `rodos2-ui/src/hooks/useRegistryModules.js` - 드래그 데이터 준비
- `rodos2-ui/src/hooks/useCanvasDragAndDrop.js` - 드롭 처리 및 정보 모델 로딩
- `rodos2-ui/src/hooks/useCanvasState.js` - 캔버스 상태 관리 및 API 호출 최적화
- `rodos2-ui/src/components/ide/Canvas.js` - 캔버스 렌더링 및 우클릭 메뉴
- `rodos2-ui/src/components/ide/IDE.js` - 위저드 열기 처리
- `rodos2-ui/src/components/wizard/WizardDialog.js` - 위저드 스텝 제어

### 백엔드
- `rodos2-server/src/main/java/.../controller/IMRegistryController.java` - 모듈 정보 모델 조회 API
- `rodos2-server/src/main/java/.../service/ModuleClassifier.java` - XML 파싱 및 enum 처리
- `rodos2-server/src/main/java/.../model/cim/SafeSecure.java` - enum 필드 안전 처리

---

## 3. 데이터 구조

### controllerInfoModel 구조
```javascript
{
    moduleName: string,
    manufacturer: string,
    description: string,
    examples: string,
    isSafety: boolean,
    isSecurity: boolean,
    idnType: {
        informationModelVersion: string,
        idtype: string,  // 'Comp' or 'SIM'
        moduleID: { mID: string, iID: string },
        swAspects: Array<{ mID: string, iID: string }>,
        hwAspects: Array<{ mID: string, iID: string }>
    },
    properties: object,
    ioVariables: {
        inputs: Array,
        outputs: Array,
        inouts: Array
    },
    services: {
        noOfBasicService: number,
        noOfOptionalService: number,
        serviceProfiles: Array
    },
    infrastructure: object,
    safeSecure: object,
    modelling: object,
    executableForm: object
}
```

### hwModule 구조 (Composite 변환 후)
```javascript
{
    name: string,
    x: number,
    y: number,
    moduleType: 'composite',  // 변환 후
    originalModuleType: 'controller',  // 원래 타입 저장
    isComposite: true,
    controllerInfoModel: { ... },
    compositeData: { ... }
}
```

---

## 4. API 엔드포인트

### GET /api/registry/module/{moduleId}/model-data
- **목적**: 모듈의 정보 모델 데이터 조회
- **요청**: `moduleId` (경로 변수)
- **응답**: 모듈 정보 모델 JSON 객체
- **처리 과정**:
  1. Registry에서 모듈 XML 조회
  2. XML 파싱하여 `SoftwareModule` 또는 `CompModule` 객체 생성
  3. JSON으로 변환하여 반환

---

## 5. 개선 사항 요약

| 항목 | 이전 상태 | 개선 후 |
|------|----------|---------|
| 컨트롤러 드롭 시 정보 모델 | 비어있음 | 서버에서 자동 로딩 |
| 소프트웨어 모듈 드롭 시 오류 | Enum 오류 발생 | 안전하게 처리 |
| Composite 위저드 | 모든 페이지 표시 | Check 페이지만 표시 |
| 모듈 이동 시 API 호출 | 매번 호출 | 디바운스로 최적화 |
| Composite 아이콘 | 검정 육각형 | 사각형 + 회색 |
| Composite 라벨 | `(Composite)` 표시 | 제거 |

---

## 6. 향후 개선 사항

### 6.1 HW 매핑 시 ref 정보 추가
- **현재 상태**: `saveHwMapping`에서 `targetName`, `type`, `target`만 저장
- **문제점**: `ref` 정보가 없어서 다중 HW 배포 시 문제 발생 가능
- **개선 방안**: `saveHwMapping`에서 `ref`가 비어있을 때 `getModuleId(moduleName)`로 자동 설정

### 6.2 Composite Module 배포 검증
- **현재 상태**: Composite Module도 배포 가능하지만 검증 로직 부족
- **개선 방안**: 
  - Composite Module의 하위 모듈들이 모두 매핑되었는지 확인
  - 배포 전 유효성 검사 추가

---

## 7. 변경 이력

- 2024-XX-XX: 컨트롤러 드래그 앤 드롭 시 정보 모델 자동 로딩 구현
- 2024-XX-XX: 소프트웨어 모듈 드래그 앤 드롭 시 enum 오류 수정
- 2024-XX-XX: Save as Composite Module 위저드 개선 (Check 페이지만 표시)
- 2024-XX-XX: 모듈 이동 시 API 호출 최적화
- 2024-XX-XX: Composite Module 아이콘 및 라벨 개선

---

## 8. 참고 문서

- `IDNTYPE_FRONTEND_BACKEND_FLOW.md` - IDnType 데이터 흐름
- `PROPERTIES_DATA_FLOW.md` - Properties 데이터 흐름
- `MODULE_CLASSIFIER.md` - 모듈 분류 로직
- `MODULE_ID_GENERATION_RULES.md` - 모듈 ID 생성 규칙
