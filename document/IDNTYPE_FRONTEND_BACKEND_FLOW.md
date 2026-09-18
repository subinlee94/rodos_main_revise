# IDnType 동작 흐름 문서 (Frontend + Spring Boot)

이 문서는 `IDnType` 페이지가 실제로 어떻게 동작하는지, 프론트엔드와 스프링부트가 어떤 방식으로 연결되는지 설명합니다.

---

## 1) 큰 구조 한눈에 보기

- 프론트엔드: React (컴포넌트 + 훅 기반 상태관리)
- 백엔드: Spring Boot (REST API 제공)
- 데이터 통신: 브라우저 `fetch`로 `/api/...` 호출
- 핵심 상태 저장소: `useWizardDialogState`의 `moduleState`

즉, **각 페이지는 자기 입력 UI만 담당**하고, 실제 저장은 부모 상태(`moduleState`)에 모아서 처리합니다.

---

## 2) 관련 파일 역할

### 프론트엔드

- `rodos2-ui/src/components/wizard/WizardDialog.js`
  - 위자드 전체 컨테이너
  - 현재 step에 따라 `IDnTypePage` 렌더링
- `rodos2-ui/src/components/wizard/IDnTypePage.js`
  - IDnType 화면 UI
  - Software Modules 영역의 `+ Add` 버튼 UI 포함
- `rodos2-ui/src/hooks/useIDnTypeState.js`
  - IDnType 로컬 상태/이벤트 처리
  - Add/Remove 클릭 시 선택 목록 업데이트
  - 선택된 모듈을 `swAspects/hwAspects`로 변환해 부모로 전달
- `rodos2-ui/src/services/swAspectsService.js`
  - SW 모듈 목록 API 호출 (`/api/registry/all`)
  - 선택 모듈을 `{mID, iID}` 형태로 변환
- `rodos2-ui/src/services/hwAspectsService.js`
  - HW 모듈 목록 API 호출 (`/api/registry/all`)
  - 선택 모듈을 `{mID, iID}` 형태로 변환
- `rodos2-ui/src/hooks/useWizardDialogState.js`
  - step별 데이터를 `moduleState`에 병합 저장
  - 완료 시 `/api/module/update` 등 호출

### 백엔드

- `rodos2-server/src/main/java/.../controller/IMRegistryController.java`
  - `/api/registry/all`, `/api/registry/module/{moduleId}` 제공
- `rodos2-server/src/main/java/.../service/rest/informationModel/IMRegistryServiceImpl.java`
  - 외부 Registry API와 실제 통신

---

## 3) IDnType 실제 동작 흐름

## 3-1. 페이지가 열릴 때

1. `WizardDialog`가 step 1에서 `IDnTypePage`를 렌더링
2. `IDnTypePage` 내부에서 `useIDnTypeState(...)` 실행
3. `useIDnTypeState`가 `genInfo.idType === 'Comp'`일 때:
   - `swAspectsService.getSWModules()`
   - `hwAspectsService.getHWModules()`
   를 호출해 목록을 로딩
4. 이때 두 서비스는 내부적으로 `/api/registry/all`을 호출

---

## 3-2. Add 버튼을 누를 때 (Software Modules)

1. 사용자가 행의 `+ Add` 클릭
2. `handleSWModuleToggle(module)` 실행
3. `selectedSWModules` 상태에 해당 모듈 추가/제거
4. `selectedSWModules` 변경을 감지한 `useEffect`에서 `updateSWAspects()` 실행
5. `swAspectsService.transformToModuleIDs(selectedSWModules)`로 변환:
   - 결과: `[{ mID, iID }, ...]`
6. `onChange(...)` 호출로 부모(`useWizardDialogState`)에 전달
7. 부모에서 `handleStepChange('idnType', newData)`로 `moduleState.idnType.swAspects` 갱신

즉 핵심은:

- 화면 선택 상태: `selectedSWModules` (moduleName/moduleID 포함)
- 부모 저장 상태: `idnType.swAspects` (`mID`, `iID` 중심)

---

## 3-3. 입력값(InfoModelVersion) 바꿀 때

1. `handleInputChange` 실행
2. 현재 `selectedSWModules`, `selectedHWModules`를 다시 `swAspects/hwAspects`로 변환
3. `onChange(newData)` 호출
4. 부모 `moduleState.idnType` 갱신

즉, 텍스트 입력을 바꿔도 기존 Add 선택 정보가 유지되도록 설계되어 있습니다.

---

## 3-4. Next / Complete 시점

- Next:
  - `handleNext`에서 현재 step 완료 처리 및 다음 step 이동
- Complete:
  - `moduleState` 전체를 `/api/module/update`로 저장
  - XML 저장 로직 수행

IDnType에서 만든 `idnType.swAspects/hwAspects`는 이 전체 저장 데이터 안에 포함됩니다.

---

## 4) 프론트엔드 ↔ 스프링부트 연결 방식

## 4-1. `/api/registry/all`

- 프론트:
  - `swAspectsService.getSWModules()`
  - `hwAspectsService.getHWModules()`
- 백엔드:
  - `IMRegistryController.getAllModules()`
  - 내부 서비스가 외부 Registry에서 모듈 목록 조회
- 결과:
  - `ai`, `robot`, `controller`, `edge`, `cloud`, `software` 분류로 반환

## 4-2. `/api/registry/module/{moduleId}`

- 프론트:
  - `registryService.getModule(moduleId)`
- 백엔드:
  - `IMRegistryController.getIM(moduleId)`
- 결과:
  - 특정 모듈 상세(IM) 반환 (xml 포함)

---

## 5) 자주 헷갈리는 용어 정리

- **컴포넌트(Component)**  
  화면 조각. 예: `IDnTypePage`

- **훅(Hook)**  
  React 상태/로직 재사용 함수. 예: `useIDnTypeState`

- **상태(State)**  
  화면/데이터의 현재 값. 예: `selectedSWModules`, `moduleState`

- **Props**  
  부모→자식으로 전달되는 값/함수. 예: `onChange`, `idnType`

- **onChange 콜백**  
  자식에서 변경 내용을 부모에게 보고하는 함수

- **REST API**  
  HTTP로 데이터를 주고받는 인터페이스 (`GET`, `POST`, `DELETE`)

- **DTO/JSON Payload**  
  API 요청/응답 데이터 형식

- **swAspects / hwAspects**  
  선택된 연관 모듈 참조 정보. 이 프로젝트에서는 주로 `{mID, iID}` 목록

- **moduleID / mID / iID**  
  모듈 식별자 전체 또는 분리된 구성 요소

---

## 6) 지금 구조의 핵심 포인트

1. 화면에서 Add로 선택한 모듈은 즉시 부모 `moduleState.idnType`에 반영됨
2. 최종 저장은 step별 페이지가 아니라 `WizardDialog/useWizardDialogState`에서 일괄 처리
3. Spring Boot는 Registry/Module API를 제공하고, 프론트는 `services/*.js`를 통해 호출
4. 화면 로직(컴포넌트)과 통신 로직(service) 분리가 되어 있어 유지보수에 유리

---

## 7) 다음 학습 추천 순서

1. `WizardDialog.js` (step 분기 이해)
2. `useWizardDialogState.js` (`moduleState` 저장 방식)
3. `IDnTypePage.js` (UI 이벤트)
4. `useIDnTypeState.js` (Add/Remove 데이터 흐름)
5. `swAspectsService.js`, `IMRegistryController.java` (API 왕복 확인)

이 순서대로 보면 프론트와 스프링부트 연결이 가장 빠르게 잡힙니다.

