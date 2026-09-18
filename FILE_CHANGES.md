# RODOS2 파일별 변경 지도

## 1. 보는 방법

이 문서는 수정 전 기준 커밋 `512a5e5`와 현재 수정본 커밋 `477c720`을 비교해, **어느 디렉터리의 어떤 파일에서 무엇이 바뀌었는지** 정리한다.

- `추가`: 원본에 없고 수정본에 새로 생긴 파일
- `수정`: 원본 파일의 로직 또는 내용 변경
- `삭제`: 새 빌드 결과로 교체되거나 더 이상 쓰지 않는 파일
- `생성물`: 소스를 직접 수정한 결과가 아니라 빌드 과정에서 생성된 파일

기능별 배경과 실행 방법은 [HANDOVER.md](HANDOVER.md), 전체 변경 요약은 [CHANGELOG.md](CHANGELOG.md)를 함께 참고한다.

## 2. 디렉터리별 요약

```text
rodos2-ui/src                         React 화면과 상태 관리
├─ components/ide                    캔버스, Registry, Workspace
├─ components/wizard                 정보 모델 작성·연결 Wizard
├─ hooks                             캔버스/위자드/Registry 상태 로직
├─ services                          서버 API 호출과 모듈 목록 조합
├─ utils                             ID 정규화, 연결 데이터 병합
└─ styles                            새 UI와 Robot/연결 표시 스타일

rodos2-server/src/main
├─ java/.../controller               Registry와 Execute REST API
├─ java/.../model                    XML/JSON 모델 호환 필드
├─ java/.../service                  상태 저장, XML 조회, 직렬화
├─ java/.../service/rest             원격/로컬 Registry 연동
└─ resources                         Registry 설정과 UI 정적 빌드
```

소스·설정 기준 변경은 React UI 35개, Java 서버 15개, 서버 설정 1개로 총 51개 파일이다. 문서, WorkSpace 예제 XML, 프론트 빌드 결과까지 포함한 인수인계 커밋은 Git 기준 80개 파일 변경으로 기록됐다.

## 3. `rodos2-ui/src` 변경 사항

### 3.1 `components/ide` — 캔버스·Registry·Workspace

| 상태 | 파일 | 바뀐 부분 | 수정 의도 |
|---|---|---|---|
| 수정 | [`components/ide/Canvas.js`](rodos2-ui/src/components/ide/Canvas.js) | `onOpenControllerWizard`를 `onOpenLinkedWizard`로 일반화했다. Controller를 Robot 가까이에 놓으면 부모 관계를 연결하고, Robot/Controller 삭제 메뉴와 하위 모듈 삭제 안내를 추가했다. Robot 색상과 Controller의 부모 Robot 라벨도 표시한다. | Robot–Controller–Software 관계를 캔버스에서 만들고 확인·삭제할 수 있게 함 |
| 수정 | [`components/ide/IDE.js`](rodos2-ui/src/components/ide/IDE.js) | Controller 전용 linked Wizard 호출을 Robot/Controller 공통 `handleOpenLinkedWizard`로 변경하고 완료된 부모 정보 모델을 캔버스에 저장한다. | Robot에도 Controller와 같은 연결 Wizard 흐름 적용 |
| 수정 | [`components/ide/RegistryModules.js`](rodos2-ui/src/components/ide/RegistryModules.js) | `registry-refresh` 이벤트를 수신해 목록을 다시 읽는다. | Workspace 업로드 직후 Registry 목록이 갱신되지 않던 문제 해결 |
| 수정 | [`components/ide/Workspace.js`](rodos2-ui/src/components/ide/Workspace.js) | XML 업로드 후 `registry-refresh`를 발생시키고, 지원하지 않는 폴더·파일에는 안내 메시지를 표시한다. 삭제 실패 이유도 서버 응답으로 보여 준다. | 업로드/삭제 동작을 사용자에게 명확하게 알리고 목록 상태 동기화 |

### 3.2 `components/wizard` — 정보 모델 Wizard

| 상태 | 파일 | 바뀐 부분 | 수정 의도 |
|---|---|---|---|
| 추가 | [`components/wizard/AvailableModulesGrid.js`](rodos2-ui/src/components/wizard/AvailableModulesGrid.js) | Action, Name, Module ID 컬럼을 갖는 공통 모듈 선택 표를 추가했다. | IDnType과 SW 선택 화면의 중복 제거 및 컬럼 순서 통일 |
| 수정 | [`components/wizard/CheckPage.js`](rodos2-ui/src/components/wizard/CheckPage.js) | XML Preview 제목에 현재 moduleName을 표시한다. | 어떤 정보 모델을 확인 중인지 구분 |
| 수정 | [`components/wizard/IDnTypePage.js`](rodos2-ui/src/components/wizard/IDnTypePage.js) | Robot/Controller에서 Software와 Hardware 모듈을 나누어 선택하고 공통 Grid로 Add/Remove하게 했다. `swAspects`와 `hwAspects` 선택 상태를 함께 다룬다. | Robot composite가 SW·Controller 참조를 명시적으로 구성하도록 함 |
| 수정 | [`components/wizard/IOVariablesPage.js`](rodos2-ui/src/components/wizard/IOVariablesPage.js) | linked-data API에서 연결 모듈의 Input/Output을 읽어 출처별로 표시하고 Add/Remove한다. 가져온 항목의 원본 moduleID를 보존한다. | 연결 SW/Controller의 I/O를 선택적으로 계승하고 출처 추적 |
| 수정 | [`components/wizard/PropertiesPage.js`](rodos2-ui/src/components/wizard/PropertiesPage.js) | Property 전체, OS, Compiler/Execution, Libraries를 구분하여 import하는 버튼을 추가했다. 중복 선택 표시와 Robot composite organization 읽기 화면도 추가했다. | Properties의 일부만 갱신되던 문제 해결 및 선택적 합성 |
| 수정 | [`components/wizard/SWModuleSelector.js`](rodos2-ui/src/components/wizard/SWModuleSelector.js) | 자체 표 구현을 공통 `AvailableModulesGrid` 사용 방식으로 변경했다. | 모듈 선택 UI 일관성 확보 |
| 수정 | [`components/wizard/ServicesPage.js`](rodos2-ui/src/components/wizard/ServicesPage.js) | 연결 모듈의 Service profile/method를 출처별로 표시하고 선택적으로 Add/Remove한다. method에 원본 moduleID를 유지한다. | 연결된 Software의 Service 계승과 출처 보존 |
| 수정 | [`components/wizard/WizardDialog.js`](rodos2-ui/src/components/wizard/WizardDialog.js) | Robot/Controller linked-only 모드를 처리하고 Properties, I/O, Services 페이지에 `linkedModules`와 `linkedHwModules`를 전달한다. | 모든 Wizard 단계가 같은 연결 모듈 문맥을 사용하도록 함 |

### 3.3 `hooks` — 상태 및 동작 로직

| 상태 | 파일 | 바뀐 부분 | 수정 의도 |
|---|---|---|---|
| 수정 | [`hooks/useCanvasDragAndDrop.js`](rodos2-ui/src/hooks/useCanvasDragAndDrop.js) | SW를 Robot/Controller에 붙이는 로직을 공통화했다. 부모 Registry IM을 조회하고, 중복 배치를 막고, Robot/Controller별 linked Wizard를 연다. | Robot의 SW 연결 흐름을 Controller 수준으로 확장 |
| 수정 | [`hooks/useCanvasState.js`](rodos2-ui/src/hooks/useCanvasState.js) | HW/SW 생성 시 moduleID를 상태에 저장하고 Controller–Robot 연결, 부모 이름/ref, 연쇄 삭제를 관리한다. | 저장·재실행 시 이름 대신 실제 Registry ID와 계층 유지 |
| 수정 | [`hooks/useIOVariablesState.js`](rodos2-ui/src/hooks/useIOVariablesState.js) | I/O tree 변환과 저장 시 `moduleID`를 유지한다. | linked I/O의 출처 ID 유실 방지 |
| 수정 | [`hooks/useModuleProgress.js`](rodos2-ui/src/hooks/useModuleProgress.js) | Execute 전에 `/api/validate-execute`를 호출하고 오류 목록을 alert로 표시한다. | 잘못된 ref/target/Simulation 상태에서 Agent 호출 방지 |
| 수정 | [`hooks/usePropertiesState.js`](rodos2-ui/src/hooks/usePropertiesState.js) | 과거 bit 값과 `BIT32` 형식을 정규화하고, linked Properties bundle을 모든 탭 state에 한 번에 반영한다. | 서버 enum 불일치 및 탭별 상태 불일치 해결 |
| 수정 | [`hooks/useRegistryModules.js`](rodos2-ui/src/hooks/useRegistryModules.js) | Registry 요청에 28초 제한을 두고 `module_id`/`module_name`과 camelCase를 정규화한다. Robot을 별도 타입으로 drag payload에 넣는다. | 무한 Loading과 빈 moduleID로 인한 드래그 오류 해결 |
| 수정 | [`hooks/useWizardDialogState.js`](rodos2-ui/src/hooks/useWizardDialogState.js) | 기존 부모 IM과 캔버스 SW/HW aspects를 중복 없이 병합한다. Robot을 owner, Controller를 `OWNED` member로 하는 organization을 만들고 linked-only 저장을 처리한다. | Robot composite 정보 모델의 참조와 조직 구조 보존 |

### 3.4 `services` — API 호출과 모듈 목록

| 상태 | 파일 | 바뀐 부분 | 수정 의도 |
|---|---|---|---|
| 수정 | [`services/api.js`](rodos2-ui/src/services/api.js) | Execute 준비 상태를 가져오는 `validateExecute` API 호출을 추가했다. | UI Execute 전에 서버 검증 사용 |
| 수정 | [`services/hwAspectsService.js`](rodos2-ui/src/services/hwAspectsService.js) | Registry/WorkSpace에서 edge, cloud, controller, robot을 읽고 필드명을 정규화·중복 제거한다. Controller와 Robot 타입을 구분한다. | HW 선택 목록에 로컬 IM과 올바른 타입 반영 |
| 수정 | [`services/registryService.js`](rodos2-ui/src/services/registryService.js) | linked-data 요청에 `swAspects`와 `hwAspects`를 함께 전송한다. | Controller 아래 SW까지 서버가 펼쳐 조회하게 함 |
| 수정 | [`services/swAspectsService.js`](rodos2-ui/src/services/swAspectsService.js) | Registry/WorkSpace Software와 현재 캔버스의 SW를 합쳐 중복 제거한다. | 원격 Registry가 없어도 실제 배치된 SW를 선택 가능하게 함 |
| 수정 | [`services/workspaceService.js`](rodos2-ui/src/services/workspaceService.js) | `.XML`/`.xml`을 동일하게 판별하고 JSON을 구분한다. 삭제 실패 시 서버 메시지를 전달한다. | 대소문자 확장자 문제와 모호한 오류 메시지 해결 |

### 3.5 `utils`, `constants` — 공통 변환과 병합

| 상태 | 파일 | 바뀐 부분 | 수정 의도 |
|---|---|---|---|
| 수정 | [`constants/index.js`](rodos2-ui/src/constants/index.js) | Robot/연결 흐름에 필요한 상수 항목을 보완했다. | UI 전역 타입 표현 통일 |
| 수정 | [`utils/Options.js`](rodos2-ui/src/utils/Options.js) | bit 옵션 값을 `_32` 등이 아니라 서버 enum과 같은 `BIT16/BIT32/BIT64`로 변경했다. | Software IM 저장 실패 해결 |
| 추가 | [`utils/canvas/moduleLinkUtils.js`](rodos2-ui/src/utils/canvas/moduleLinkUtils.js) | Robot/Controller 판별, moduleID 분해, aspect 정규화, 부모 Registry IM 조회 기능을 분리했다. | 복잡해진 drag/drop 연결 로직을 공통 함수로 관리 |
| 추가 | [`utils/registryFetch.js`](rodos2-ui/src/utils/registryFetch.js) | Registry fetch 오류 처리와 snake_case/camelCase 모듈 필드 정규화를 공통화했다. | 여러 service에서 같은 Registry 응답을 일관되게 처리 |
| 추가 | [`utils/wizard/linkedModuleSource.js`](rodos2-ui/src/utils/wizard/linkedModuleSource.js) | 연결 데이터의 부모/자식 출처 라벨과 moduleID 비교·분해 함수를 제공한다. | I/O와 Services가 동일한 출처 판별 규칙 사용 |
| 추가 | [`utils/wizard/linkedPropertiesMerge.js`](rodos2-ui/src/utils/wizard/linkedPropertiesMerge.js) | OS, Compiler, Execution, Libraries, Organization 필드명을 정규화하고 중복 없이 병합한다. | XML/API 형식 차이를 UI state에 반영하기 전 흡수 |

### 3.6 `styles` — 추가·변경된 화면 스타일

| 상태 | 파일 | 바뀐 부분 |
|---|---|---|
| 수정 | [`styles/ide/Canvas.css`](rodos2-ui/src/styles/ide/Canvas.css) | Robot–Controller 부모 관계 라벨과 캔버스 표시 보완 |
| 추가 | [`styles/wizard/AvailableModulesGrid.css`](rodos2-ui/src/styles/wizard/AvailableModulesGrid.css) | 공통 Available Modules 표 스타일 |
| 수정 | [`styles/wizard/IDnTypePage.css`](rodos2-ui/src/styles/wizard/IDnTypePage.css) | SW/HW 선택 영역과 공통 Grid 배치 |
| 수정 | [`styles/wizard/IOVariablesPage.css`](rodos2-ui/src/styles/wizard/IOVariablesPage.css) | linked I/O 출처/선택 패널 표시 |
| 수정 | [`styles/wizard/ServicesPage.css`](rodos2-ui/src/styles/wizard/ServicesPage.css) | linked Service 선택 영역 표시 |

## 4. `rodos2-server/src/main/java` 변경 사항

### 4.1 `controller` — REST API

| 상태 | 파일 | 바뀐 부분 | 수정 의도 |
|---|---|---|---|
| 수정 | [`controller/IMRegistryController.java`](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/controller/IMRegistryController.java) | 분류별 Registry 조회 병렬화, WorkSpace IM 목록 병합, flexible moduleID 조회, Properties 명시적 직렬화, `swAspects`+`hwAspects` linked-data, 로컬 fallback 업로드 결과, 안전한 Workspace 삭제를 추가했다. | Registry 장애와 XML 위치 차이에 강한 조회/업로드 API 제공 |
| 수정 | [`controller/SharedUserStateController.java`](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/controller/SharedUserStateController.java) | `GET /api/validate-execute`를 추가하고 `/api/hw-modules` 응답에 moduleID, target, parentRobotRef 등 실행 준비 정보를 포함했다. | UI가 Execute 전에 구성을 검사하고 Robot 계층을 복원하게 함 |

### 4.2 `model` — 저장 구조와 XML 호환

| 상태 | 파일 | 바뀐 부분 | 수정 의도 |
|---|---|---|---|
| 수정 | [`model/HWInfo.java`](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/HWInfo.java) | XML/JSON에 `parentRobotRef` 필드와 getter/setter를 추가했다. | Controller가 어느 Robot에 속하는지 저장 |
| 수정 | [`model/cim/IOVariable.java`](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/cim/IOVariable.java) | 각 I/O 항목에 원본 `ModuleID` 필드를 추가했다. | 연결 모듈에서 가져온 I/O 출처 보존 |
| 수정 | [`model/sim/ExecutionType.java`](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/sim/ExecutionType.java) | `optype` 외에 camelCase `opType`을 읽고 `EventDriven`, `EVENT_DRIVEN` 등을 enum으로 정규화한다. | WorkSpace/legacy XML 동시 호환 |
| 수정 | [`model/sim/Library.java`](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/sim/Library.java) | Library 이름과 버전을 자식 태그뿐 아니라 XML attribute에서도 읽는다. | `<Item name="..." version="..."/>` 형식 지원 |
| 수정 | [`model/sim/Organization.java`](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/sim/Organization.java) | Organization member 목록을 XML/JSON 모델에 추가했다. | Robot owner와 Controller member 구조 표현 |
| 수정 | [`model/sim/Properties.java`](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/sim/Properties.java) | `compilerType` 대체 태그, `Libraries/Item`, organization getter/setter를 추가하고 legacy/new 값을 병합한다. | 서로 다른 Properties XML 형식 호환 |

### 4.3 `service` — 직렬화, Workspace, Execute 상태

| 상태 | 파일 | 바뀐 부분 | 수정 의도 |
|---|---|---|---|
| 추가 | [`service/PropertiesMapSerializer.java`](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/PropertiesMapSerializer.java) | OS, Compiler, Execution, Libraries, Organization을 UI가 기대하는 Map 구조로 명시적으로 변환한다. | Jackson 기본 변환에서 누락되던 compiler/organization 필드 방지 |
| 수정 | [`service/SharedUserStateService.java`](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/SharedUserStateService.java) | 캔버스 moduleID를 HW/SW `ref`로 저장하고 parentRobotRef/target을 복원한다. Execute readiness 검증과 실패 시 Agent 호출 중단을 추가했다. | 이름 lookup/임의 UUID 때문에 Execute가 실패하던 문제 해결 |
| 추가 | [`service/WorkspaceImService.java`](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/WorkspaceImService.java) | `.rodos/WorkSpace/Module Info/*.xml`을 읽어 IM 목록과 moduleID 조회를 제공한다. | 원격 Registry에 없는 로컬 XML도 Wizard에서 사용 |

### 4.4 `service/rest/informationModel` — 원격/로컬 Registry

| 상태 | 파일 | 바뀐 부분 | 수정 의도 |
|---|---|---|---|
| 수정 | [`IMRegistryApi.java`](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/rest/informationModel/IMRegistryApi.java) | 업로드 반환값을 boolean에서 `ImUploadResult`로 변경했다. | 원격 성공·로컬 fallback 성공·실패 원인 구분 |
| 수정 | [`IMRegistryServiceImpl.java`](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/rest/informationModel/IMRegistryServiceImpl.java) | Registry URL 설정화, 연결/읽기 timeout, 30초 목록 cache, 원격+로컬 목록 병합, 업로드 fallback, 양쪽 삭제를 구현했다. | 외부 Registry 지연/장애 시에도 개발과 시연 지속 |
| 추가 | [`ImUploadResult.java`](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/rest/informationModel/ImUploadResult.java) | remote success, local-only success, client/server failure를 표현한다. | API가 업로드 결과를 정확히 설명하도록 함 |
| 추가 | [`LocalImRegistryStore.java`](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/rest/informationModel/LocalImRegistryStore.java) | `.rodos/local-registry/modules.json`에 IM save/get/list/delete 기능을 구현했다. | 원격 Registry 장애 시 파일 기반 임시 저장소 제공 |

## 5. 서버 설정과 정적 리소스

| 상태 | 경로 | 바뀐 부분 | 비고 |
|---|---|---|---|
| 수정 | [`rodos2-server/src/main/resources/application.properties`](rodos2-server/src/main/resources/application.properties) | `rodos.registry.base-url`, local fallback, connect/read timeout, list cache TTL 설정 추가 | 운영 환경별 Registry 설정 가능 |
| 수정/생성 | `rodos2-server/src/main/resources/static/asset-manifest.json`, `index.html` | 새 React 빌드 해시 참조 | 직접 수정 대상이 아닌 생성물 |
| 삭제 | `static/css/main.6222d471.css` 및 map | 이전 UI 빌드 결과 제거 | 새 CSS로 교체 |
| 추가 | [`static/css/main.cd28acec.css`](rodos2-server/src/main/resources/static/static/css/main.cd28acec.css) | 변경된 UI의 CSS bundle | `npm run build` 생성물 |
| 교체 | `static/js/453.40adc338.chunk.js` → [`206.3dc6bb05.chunk.js`](rodos2-server/src/main/resources/static/static/js/206.3dc6bb05.chunk.js) | chunk hash 변경 | source map은 이번 빌드 결과에서 제외됨 |
| 교체 | `static/js/main.e9f42f72.js` → [`main.19bf8781.js`](rodos2-server/src/main/resources/static/static/js/main.19bf8781.js) | 변경된 UI의 main bundle | 직접 수정하지 말고 UI를 다시 build해야 함 |

## 6. WorkSpace 정보 모델 데이터

`rodos2-server/.rodos/WorkSpace/Module Info`에는 코드 테스트와 시연에 사용한 XML 변경도 포함돼 있다.

| 상태 | 파일 | 내용 |
|---|---|---|
| 수정 | [`software_module.xml`](rodos2-server/.rodos/WorkSpace/Module%20Info/software_module.xml) | swAspects와 I/O 예제 데이터 보완 |
| 수정 | [`turtlebot.xml`](rodos2-server/.rodos/WorkSpace/Module%20Info/turtlebot.xml) | Composite Robot 형식 보완 |
| 추가 | [`controllerexam.xml`](rodos2-server/.rodos/WorkSpace/Module%20Info/controllerexam.xml) | Controller 연결 테스트 IM |
| 추가 | [`controllerexam1.xml`](rodos2-server/.rodos/WorkSpace/Module%20Info/controllerexam1.xml) | Controller/Properties 테스트 IM |
| 추가 | [`exam.xml`](rodos2-server/.rodos/WorkSpace/Module%20Info/exam.xml) | 정보 모델 입력 테스트 IM |
| 추가 | [`testrobot.xml`](rodos2-server/.rodos/WorkSpace/Module%20Info/testrobot.xml) | Robot composite 테스트 IM |

이 XML들은 실행 중 생성되는 `CurrentSharedUserState.xml`이나 로컬 Registry JSON과 다르다. 후자의 runtime 파일은 `.gitignore`로 제외했다. 저장소를 공개할 경우 예제 XML의 내용과 배포 권리를 별도로 확인해야 한다.

## 7. 루트 및 문서 파일

| 상태 | 파일 | 용도 |
|---|---|---|
| 추가 | [`.gitignore`](.gitignore) | `node_modules`, Gradle/build/bin, 브라우저 프로필, runtime 상태와 임시 파일 제외 |
| 수정 | [`README.md`](README.md) | 실제 Gradle 실행법, 문서 링크, Registry 설정, GitHub 업로드 주의사항 반영 |
| 추가 | [`HANDOVER.md`](HANDOVER.md) | 기능별 변경 이유·영향·실행·검증·제한사항 |
| 추가 | [`CHANGELOG.md`](CHANGELOG.md) | 원본 대비 Added/Changed/Fixed/Known Issues 요약 |
| 추가 | [`document/GITHUB_HANDOVER.md`](document/GITHUB_HANDOVER.md) | GitHub PR/전달용 설명문 |
| 추가 | [`document/교수님_보고용_프로그램_수정내역.md`](document/교수님_보고용_프로그램_수정내역.md) | 1차 기능 변경 보고 |
| 추가 | [`document/교수님_보고용_프로그램_수정내역_2차보고.md`](document/교수님_보고용_프로그램_수정내역_2차보고.md) | Properties/XML 호환 보완 보고 |
| 추가 | [`document/ROBOT_EXECUTE_쉬운설명.md`](document/ROBOT_EXECUTE_쉬운설명.md) | Execute 흐름 초보자용 설명 |
| 추가 | [`document/RODOS2_구글드라이브_실행_접속_안내.md`](document/RODOS2_구글드라이브_실행_접속_안내.md) | 설치·실행·접속 안내 |
| 추가 | `create_manual_ppt.ps1`, `manual_ui.png`, `RODOS2_User_Manual.pptx` | 사용자 매뉴얼 생성 스크립트와 결과물 |

## 8. GitHub에서 변경 확인하는 방법

- 전체 원본 대비 diff: [기준본 `512a5e5` → 수정본 `477c720`](https://github.com/subinlee94/rodos_main_revise/compare/512a5e5...477c720)
- 수정본 커밋: [`477c720`](https://github.com/subinlee94/rodos_main_revise/commit/477c720)
- 파일 하나를 선택한 뒤 GitHub의 **History** 또는 **Blame**을 누르면 해당 파일에서 바뀐 줄을 확인할 수 있다.

정적 JS/CSS bundle은 사람이 직접 수정한 파일이 아니므로 실제 리뷰는 `rodos2-ui/src`와 `rodos2-server/src/main/java`를 우선한다.

