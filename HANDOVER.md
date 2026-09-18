# RODOS2 인수인계 문서

## 1. 문서 목적

이 문서는 수정 전 원본과 현재 수정본을 직접 비교하여, 변경 내용과 변경 의도, 영향 범위, 검증 결과 및 남은 과제를 다음 담당자에게 전달하기 위한 문서다.

- 비교 기준 원본: `D:\rodos2-main_original\rodos2-main`
- 현재 수정본: `D:\rodos2-main\rodos2-main`
- 분석 기준일: 2026-09-18
- 비교 방법: 파일 해시 비교와 소스 diff. 줄바꿈 차이, `node_modules`, Gradle/React 빌드 결과, 캐시 및 `.class` 파일은 소스 변경 통계에서 제외했다.

이 작업은 ISO 22166 전체를 새로 구현한 것이 아니다. 기존 RODOS2의 Controller 중심 합성 흐름을 Robot까지 확장하고, 정보 모델 Registry와 Execute에 필요한 데이터 전달 경로를 보완한 것이다.

파일 단위의 추가·수정·삭제 위치는 [FILE_CHANGES.md](FILE_CHANGES.md)에 정리했다. 코드 리뷰나 담당자별 업무 분배를 할 때는 해당 문서를 먼저 보면 된다.

## 2. 핵심 요약

원본에서는 Robot 정보 모델을 Registry에서 가져와 Software 모듈과 연결하고 실행하는 흐름이 부분적으로 끊겨 있었다. 현재 수정본은 다음 문제를 중심으로 보완됐다.

1. Robot/Controller에 연결할 Software 및 Hardware 정보 모델을 Wizard에서 선택할 수 있게 했다.
2. 연결한 Software의 Properties, I/O Variables, Services를 선택적으로 가져올 수 있게 했다.
3. 서로 다른 XML 태그 형식과 JSON 필드명을 호환 처리했다.
4. 원격 Registry 장애 시 로컬 Registry 및 WorkSpace XML을 사용할 수 있게 했다.
5. 캔버스의 실제 `moduleID`를 서버의 `ref`로 보존하고 Execute 전 구성을 검증하게 했다.
6. Robot–Controller 계층과 Robot composite organization 정보를 저장·복원하도록 보완했다.

소스와 설정 기준 변경 규모는 다음과 같다.

| 영역 | 변경 파일 | 추가 줄 | 삭제 줄 |
|---|---:|---:|---:|
| Java 서버 | 15 | 1,271 | 170 |
| React UI | 35 | 1,679 | 617 |
| 서버 설정 | 1 | 7 | 0 |
| 합계 | 51 | 2,957 | 787 |

해시가 붙는 React 정적 번들, 설명 문서와 발표 자료는 위 통계와 별도로 갱신 또는 추가됐다.

## 3. 시스템 구성

```text
[React UI]
  Wizard / Registry / Workspace / Canvas / Execute
             |
             | REST API
             v
[Spring Boot Server]
  Registry 연동 / XML 파싱 / SharedUserState / Execute 검증
       |                         |
       v                         v
[원격 IIC Registry]       [Docker Agent :9999]
       |
       +-- 장애 시 .rodos/local-registry 로컬 대체 저장

[.rodos/WorkSpace/Module Info]
       +-- 원격 Registry에 없어도 목록 및 linked-data 조회에 병합
```

## 4. 기능별 변경 내용과 의도

### 4.1 Available Modules UI 공통화

문제:

- Wizard 페이지마다 가용 모듈 표의 컬럼 순서와 모양이 달랐다.
- 요구된 `Action → Name → Module ID` 순서가 일관되지 않았다.

변경:

- `AvailableModulesGrid`와 전용 CSS를 추가했다.
- IDnType과 Software 선택 화면이 같은 표 컴포넌트를 사용하도록 정리했다.

의도:

- Robot과 Controller가 같은 선택 경험을 갖게 하고, 중복 UI 코드를 줄이기 위함이다.

주요 파일:

- [rodos2-ui/src/components/wizard/AvailableModulesGrid.js](rodos2-ui/src/components/wizard/AvailableModulesGrid.js)
- [rodos2-ui/src/styles/wizard/AvailableModulesGrid.css](rodos2-ui/src/styles/wizard/AvailableModulesGrid.css)
- [rodos2-ui/src/components/wizard/IDnTypePage.js](rodos2-ui/src/components/wizard/IDnTypePage.js)
- [rodos2-ui/src/components/wizard/SWModuleSelector.js](rodos2-ui/src/components/wizard/SWModuleSelector.js)

### 4.2 Software 정보 모델 저장 오류 수정

문제:

- UI가 bit 값을 `_32` 등의 형식으로 보내고 서버 enum은 `BIT16`, `BIT32`, `BIT64`를 기대하여 저장에 실패할 수 있었다.

변경:

- UI 선택값을 서버 enum과 맞췄다.
- 과거 값도 읽을 수 있도록 정규화 로직을 추가했다.

의도:

- 신규 정보 모델 저장을 정상화하면서 기존 데이터와의 호환성을 유지하기 위함이다.

주요 파일:

- [rodos2-ui/src/utils/Options.js](rodos2-ui/src/utils/Options.js)
- [rodos2-ui/src/hooks/usePropertiesState.js](rodos2-ui/src/hooks/usePropertiesState.js)

### 4.3 Registry 조회·업로드 복원력 강화

문제:

- 원격 Registry가 느리거나 끊기면 목록이 `Loading...` 상태에 머물거나 업로드가 실패했다.
- 원격 Registry에 없는 WorkSpace XML은 Wizard의 Available Modules와 linked-data에서 사용할 수 없었다.
- Registry 응답의 `module_id`/`module_name`과 UI의 camelCase 기대값이 달라 드래그 식별자가 비는 경우가 있었다.

변경:

- 연결/읽기 타임아웃과 30초 목록 캐시를 추가했다.
- 분류별 목록 조회를 병렬화했다.
- 원격 업로드가 네트워크 또는 서버 오류로 실패하면 `.rodos/local-registry/modules.json`에 저장한다.
- HTTP 4xx처럼 요청 자체가 잘못된 경우는 로컬 성공으로 감추지 않고 오류로 반환한다.
- `.rodos/WorkSpace/Module Info/*.xml`을 Registry 목록에 병합하고 moduleID 조회의 fallback으로 사용한다.
- 업로드 성공 후 `registry-refresh` 이벤트로 UI 목록을 다시 읽는다.
- Registry 응답 필드명을 UI에서 정규화한다.
- Workspace 파일 삭제 시 파일명만 허용하고, 허용 디렉터리 안의 정규화된 경로인지 확인한다.

의도:

- 연구실 네트워크나 원격 Registry 상태에 관계없이 로컬 개발과 시연을 계속할 수 있게 하되, 잘못된 요청까지 성공으로 오인하지 않게 하기 위함이다.

주요 파일:

- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/controller/IMRegistryController.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/controller/IMRegistryController.java)
- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/rest/informationModel/IMRegistryServiceImpl.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/rest/informationModel/IMRegistryServiceImpl.java)
- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/rest/informationModel/LocalImRegistryStore.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/rest/informationModel/LocalImRegistryStore.java)
- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/rest/informationModel/ImUploadResult.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/rest/informationModel/ImUploadResult.java)
- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/WorkspaceImService.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/WorkspaceImService.java)
- [rodos2-server/src/main/resources/application.properties](rodos2-server/src/main/resources/application.properties)
- [rodos2-ui/src/hooks/useRegistryModules.js](rodos2-ui/src/hooks/useRegistryModules.js)
- [rodos2-ui/src/components/ide/Workspace.js](rodos2-ui/src/components/ide/Workspace.js)
- [rodos2-ui/src/services/workspaceService.js](rodos2-ui/src/services/workspaceService.js)
- [rodos2-ui/src/utils/registryFetch.js](rodos2-ui/src/utils/registryFetch.js)

운영 주의:

- 로컬 Registry 경로는 서버 실행 디렉터리를 기준으로 한 상대 경로다.
- 로컬 저장은 단일 JVM 안에서만 동기화되며 다중 서버 인스턴스용 저장소가 아니다.
- 원격 Registry 기본 주소는 `application.properties`의 `rodos.registry.base-url`에서 바꿀 수 있다.

### 4.4 Robot/Controller–Software 캔버스 연결

문제:

- Controller 위에 Software를 놓을 때의 linked Wizard 흐름이 Robot에는 동일하게 적용되지 않았다.
- Robot이 일반 HW처럼만 처리되거나, 실제 Registry 정보 모델 없이 캔버스 표시 데이터만 저장되는 경우가 있었다.
- 이름 기반 Registry 재조회에 실패하면 임의 UUID가 생성되어 Execute가 실제 XML을 찾지 못했다.

변경:

- Robot을 별도 타입과 육각형 스타일로 표시한다.
- Software를 Robot 또는 Controller 위에 놓으면 부모 정보 모델을 유지한 채 linked Wizard를 연다.
- 연결 시 부모 `idnType.swAspects`에 Software moduleID 참조를 중복 없이 추가한다.
- 캔버스에서 이미 알고 있는 `moduleID`를 서버 저장 시 `ref`로 우선 사용한다.
- Robot 아래 Controller 관계는 `parentRobotRef`로 저장·복원한다.
- 연결된 Controller는 상위 Robot의 HW target을 계승하여 실행 구성에 사용할 수 있게 했다.

의도:

- 정보 모델 전체를 무조건 복사하지 않고 `swAspects` 참조와 사용자가 선택한 항목만 합성하는 기존 구조를 Robot에도 적용하기 위함이다.

주요 파일:

- [rodos2-ui/src/hooks/useCanvasDragAndDrop.js](rodos2-ui/src/hooks/useCanvasDragAndDrop.js)
- [rodos2-ui/src/utils/canvas/moduleLinkUtils.js](rodos2-ui/src/utils/canvas/moduleLinkUtils.js)
- [rodos2-ui/src/hooks/useCanvasState.js](rodos2-ui/src/hooks/useCanvasState.js)
- [rodos2-ui/src/components/ide/Canvas.js](rodos2-ui/src/components/ide/Canvas.js)
- [rodos2-ui/src/components/ide/IDE.js](rodos2-ui/src/components/ide/IDE.js)
- [rodos2-ui/src/hooks/useWizardDialogState.js](rodos2-ui/src/hooks/useWizardDialogState.js)
- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/SharedUserStateService.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/SharedUserStateService.java)
- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/HWInfo.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/HWInfo.java)

### 4.5 연결 정보 모델의 Properties 계승

문제:

- 연결된 Software에서 Property 하나를 Add해도 OS, Compiler, Execution, Libraries, Organization 탭은 비어 있거나 갱신되지 않았다.
- UI의 각 탭이 별도 state를 사용하여 `properties` 배열만 바꿔서는 화면과 저장 데이터가 일치하지 않았다.

변경:

- linked-data의 Properties 블록을 UI용으로 정규화한다.
- Property 전체, OS, Compiler/Execution, Libraries를 사용자가 구분하여 가져올 수 있다.
- 중복 항목을 제거하며 모든 Properties 관련 state를 함께 갱신한다.
- Robot의 Organization은 Robot을 owner, 선택한 Controller를 `OWNED` member로 구성한다.

의도:

- 자동 전체 덮어쓰기 대신 사용자가 필요한 정보를 선택적으로 합성하고, 탭 간 데이터 불일치를 막기 위함이다.

주요 파일:

- [rodos2-ui/src/components/wizard/PropertiesPage.js](rodos2-ui/src/components/wizard/PropertiesPage.js)
- [rodos2-ui/src/hooks/usePropertiesState.js](rodos2-ui/src/hooks/usePropertiesState.js)
- [rodos2-ui/src/utils/wizard/linkedPropertiesMerge.js](rodos2-ui/src/utils/wizard/linkedPropertiesMerge.js)
- [rodos2-ui/src/hooks/useWizardDialogState.js](rodos2-ui/src/hooks/useWizardDialogState.js)
- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/PropertiesMapSerializer.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/PropertiesMapSerializer.java)

### 4.6 XML/JSON 호환 처리

문제:

- WorkSpace XML과 기존 RODOS XML이 서로 다른 태그 또는 표현을 사용했다.
- Jackson 기본 직렬화로는 compiler와 organization의 일부 필드가 UI 응답에서 빠졌다.

호환 처리한 예:

| 항목 | 형식 차이 | 처리 |
|---|---|---|
| Compiler | `compilerType` / `compiler` | 양쪽을 읽어 하나의 모델로 병합 |
| Execution | `opType` / `optype` | 문자열 및 enum 정규화 |
| Libraries | `Libraries/Item` 속성 / `Library` 자식 | 두 형식 모두 읽기 |
| Organization | 객체 getter/owner moduleID 표현 | 명시적 Map 직렬화 |
| I/O moduleID | 문자열/객체 표현 | 출처 moduleID를 보존하도록 정규화 |

의도:

- 기존 데이터 파일을 깨뜨리지 않으면서 새로운 ISO 스타일 XML도 읽을 수 있게 하기 위함이다.

주요 파일:

- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/sim/Properties.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/sim/Properties.java)
- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/sim/ExecutionType.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/sim/ExecutionType.java)
- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/sim/Library.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/sim/Library.java)
- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/sim/Organization.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/sim/Organization.java)
- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/cim/IOVariable.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/model/cim/IOVariable.java)
- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/PropertiesMapSerializer.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/PropertiesMapSerializer.java)

### 4.7 Properties·I/O·Services의 선택적 import

변경:

- `POST /api/registry/module/linked-data`가 `swAspects`뿐 아니라 `hwAspects`도 받는다.
- 선택한 Controller의 `swAspects`를 펼쳐 그 아래 Software 데이터도 가져온다.
- 응답에 `parentModuleID`, `parentModuleName`, `sourceType`을 넣어 UI가 출처별로 묶어 표시한다.
- Properties, I/O Variables, Services에서 항목별 Add/Remove가 가능하다.
- 가져온 I/O와 Service method는 원본 moduleID를 유지한다.

의도:

- Robot이 Controller만 직접 참조한 경우에도 Controller 아래 Software 정보를 잃지 않고, 각 필드의 출처를 추적할 수 있게 하기 위함이다.

주요 파일:

- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/controller/IMRegistryController.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/controller/IMRegistryController.java)
- [rodos2-ui/src/components/wizard/IOVariablesPage.js](rodos2-ui/src/components/wizard/IOVariablesPage.js)
- [rodos2-ui/src/components/wizard/ServicesPage.js](rodos2-ui/src/components/wizard/ServicesPage.js)
- [rodos2-ui/src/utils/wizard/linkedModuleSource.js](rodos2-ui/src/utils/wizard/linkedModuleSource.js)
- [rodos2-ui/src/services/registryService.js](rodos2-ui/src/services/registryService.js)
- [rodos2-ui/src/services/hwAspectsService.js](rodos2-ui/src/services/hwAspectsService.js)
- [rodos2-ui/src/services/swAspectsService.js](rodos2-ui/src/services/swAspectsService.js)

### 4.8 Execute 준비 데이터와 사전 검증

문제:

- Execute 경로 자체는 존재했지만 Software `ref`, Robot target, Simulation 설정이 불완전하면 실패 원인을 알기 어려웠다.
- Robot만 있고 그 위에 실행할 Software가 없는 구성도 실행 단계까지 진행됐다.

변경:

- `GET /api/validate-execute`를 추가했다.
- Execute 직전에도 같은 검증을 다시 수행하여 잘못된 경우 Agent 호출을 중단한다.
- 다음 항목을 검사한다.
  - Robot 또는 연결 Controller에 실행할 Software가 있는지
  - Software `ref`가 임의 fallback UUID가 아닌 실제 moduleID인지
  - 실제 HW 모드에서 Robot target/IP가 있는지
  - Controller가 Robot에 연결됐는지
  - Simulation 모드에 Simulation HW 설정이 있는지
- UI가 검증 오류를 alert로 보여 준다.
- HW 조회 응답에 `target`, `targetName`, `moduleID`, `parentRobotRef` 등을 포함한다.

의도:

- Docker Agent 호출부를 바꾸지 않고, 호출 전에 필요한 데이터가 올바르게 준비됐는지 명확하게 확인하기 위함이다.

변경하지 않은 부분:

- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/compute/ExecutorManager.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/compute/ExecutorManager.java)
- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/rest/agent/DeployAgentApi.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/rest/agent/DeployAgentApi.java)
- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/compute/docker/DockerCMD.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/compute/docker/DockerCMD.java)

주요 파일:

- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/SharedUserStateService.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/SharedUserStateService.java)
- [rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/controller/SharedUserStateController.java](rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/controller/SharedUserStateController.java)
- [rodos2-ui/src/hooks/useModuleProgress.js](rodos2-ui/src/hooks/useModuleProgress.js)
- [rodos2-ui/src/services/api.js](rodos2-ui/src/services/api.js)

## 5. 주요 API 변경

| Method | 경로 | 용도 |
|---|---|---|
| GET | `/api/registry/all` | 원격·로컬·Workspace 모듈 통합 목록 |
| GET | `/api/registry/module/{moduleId}/model-data` | 파싱된 정보 모델 반환 |
| POST | `/api/registry/module/linked-data` | `swAspects`/`hwAspects`에 연결된 데이터 반환 |
| POST | `/api/registry/module/upload` | 원격 업로드, 필요 시 로컬 fallback |
| DELETE | `/api/registry/module/delete` | Registry 또는 안전하게 제한된 Workspace 파일 삭제 |
| GET | `/api/validate-execute` | Execute 준비 상태와 오류 목록 반환 |
| GET | `/api/hw-modules` | HW와 mapping/부모 관계 정보 반환 |

`linked-data` 요청 예:

```json
{
  "swAspects": [{ "mID": "software-module-id", "iID": "00" }],
  "hwAspects": [{ "mID": "controller-module-id", "iID": "00" }]
}
```

## 6. 설정값

`rodos2-server/src/main/resources/application.properties`:

| 키 | 기본값 | 설명 |
|---|---|---|
| `rodos.registry.base-url` | `http://iic-api.kangwon.ac.kr:8008` | 원격 IIC Registry |
| `rodos.registry.local-fallback` | `true` | 원격 장애 시 로컬 저장 허용 |
| `rodos.registry.connect-timeout-ms` | `1500` | 연결 제한 시간 |
| `rodos.registry.read-timeout-ms` | `3000` | 응답 제한 시간 |
| `rodos.registry.list-cache-ttl-ms` | `30000` | Registry 목록 캐시 시간 |

## 7. 실행 방법

권장 환경:

- Java 17
- Node.js 18 또는 20 LTS 권장

UI 빌드:

```powershell
cd rodos2-ui
npm install
npm run build
```

`npm run build`는 UI를 빌드한 뒤 결과를 서버의 `src/main/resources/static`으로 복사한다.

서버 실행:

```powershell
cd rodos2-server
.\gradlew.bat bootRun
```

접속:

```text
http://localhost:8080/app
```

## 8. 시연 절차

1. Registry 또는 WorkSpace Module Info에 Robot/Controller/Software XML을 준비한다.
2. Registry에서 Robot을 캔버스에 놓는다.
3. 필요하면 Controller를 Robot에 연결한다.
4. Software를 Robot 또는 Controller 위에 놓는다.
5. linked Wizard에서 Properties, I/O Variables, Services의 필요한 항목을 Add한다.
6. 캔버스 상태를 저장한다.
7. 실제 HW 실행이면 `Mapping with HW`에서 Robot target/IP를 설정한다.
8. Simulation이면 `Mapping with Simulation`을 설정한다.
9. `/api/validate-execute` 또는 Execute 버튼으로 준비 상태를 확인한다.
10. 검증 통과 후 Execute하여 Docker Agent `:9999` 호출을 확인한다.

## 9. 검증 결과

2026-09-18 로컬 환경에서 수행한 결과다.

| 검증 | 결과 | 비고 |
|---|---|---|
| Java 17 확인 | 통과 | Temurin 17.0.18 |
| 서버 `gradlew test --no-daemon` | 통과 | Spring context 테스트 1개, 전체 기능 테스트는 아님 |
| UI 일반 production build | 통과 | ESLint 경고와 Node 24 deprecation 경고 존재 |
| UI CI build (`CI=true`) | 실패 | 기존 및 수정 파일의 ESLint 경고를 오류로 처리 |
| UI test | 실패 | CRA/Jest가 설치된 `react-router-dom@7.5.2`를 resolve하지 못해 테스트 시작 전 실패 |
| 외부 Registry 연동 | 미검증 | 외부 네트워크/서비스 필요 |
| Docker Agent 실제 Execute | 미검증 | target 장비와 Agent `:9999` 필요 |
| 민감정보 패턴 검사 | 소스·설정에서 발견 없음 | 브라우저 프로필은 별도로 반드시 제외 |

UI 빌드가 성공했다는 것은 번들 생성 가능 여부를 확인한 것이다. Robot–Controller–Software 전체 사용자 흐름과 실제 Agent 실행 성공을 보장하는 E2E 테스트는 아니다.

## 10. 알려진 제한과 후속 과제

우선순위 높음:

1. 루트 `.gitignore`를 적용한 후에만 Git을 초기화한다. `.edge-manual-profile`은 개인 브라우저 메타데이터를 포함하므로 절대 업로드하지 않는다.
2. UI의 ESLint 경고를 정리하여 `CI=true npm run build`를 통과시킨다.
3. `react-scripts@5`와 `react-router-dom@7.5.2`의 Jest 호환 문제를 해결하고 실제 UI 테스트를 추가한다.
4. Robot–Controller–Software 연결, linked-data import, Execute validation에 대한 서버/프론트 자동 테스트를 추가한다.

기능 제한:

- ISO 문서의 모든 필드를 자동 병합하지 않는다. 사용자가 Add한 항목만 가져오는 정책이다.
- `swAspects`에 참조만 있고 캔버스에 실제 Software 원이 없으면 해당 Software를 자동 실행하지 않는다.
- Deploy 이미지가 항상 ExecutableForm에서 결정되는 흐름은 완성되지 않았다.
- 일부 `<bitnCPUarch bit="32" CPUarch="..."/>` 속성형 XML은 추가 호환 검토가 필요하다.
- 원격 Registry의 정상 동작은 외부 서비스 상태에 의존한다.
- 로컬 fallback은 개발/시연용 파일 저장소이며 데이터베이스나 다중 인스턴스용 저장소가 아니다.
- CORS가 `*`로 열려 있으므로 외부 배포 전 허용 origin을 제한해야 한다.

## 11. GitHub에 포함/제외할 파일

포함 권장:

- `rodos2-ui/src`
- `rodos2-server/src`
- Gradle wrapper와 빌드 설정
- `package.json`, `package-lock.json`
- 서버가 바로 UI를 제공해야 한다면 `rodos2-server/src/main/resources/static`
- `document`와 인수인계 문서
- 필요한 WorkSpace 예제 XML. `rodos2-server/.rodos/WorkSpace/Module Info`에는 원본 XML 외에
  `controllerexam.xml`, `controllerexam1.xml`, `exam.xml`, `testrobot.xml`이 추가됐고,
  `software_module.xml`, `turtlebot.xml`이 수정됐다. 공개 저장소라면 내용과 권리를 한 번 더 검토한다.

제외 필수:

- `rodos2-ui/node_modules` 약 675 MB
- `rodos2-server/.gradle` 약 418 MB
- `rodos2-server/build`, `rodos2-server/bin`
- `.codex-temp`
- `.edge-manual-profile`
- 모든 위치의 `.rodos/local-registry`
- 모든 위치의 `.rodos/CurrentSharedUserState.xml`
- `tmp-linked-request.json`

## 12. 변경 파일 지도

서버 핵심:

- `controller/IMRegistryController.java`
- `controller/SharedUserStateController.java`
- `service/SharedUserStateService.java`
- `service/WorkspaceImService.java` (신규)
- `service/PropertiesMapSerializer.java` (신규)
- `service/rest/informationModel/IMRegistryServiceImpl.java`
- `service/rest/informationModel/LocalImRegistryStore.java` (신규)
- `service/rest/informationModel/ImUploadResult.java` (신규)
- `model/HWInfo.java`
- `model/cim/IOVariable.java`
- `model/sim/Properties.java`
- `model/sim/ExecutionType.java`
- `model/sim/Library.java`
- `model/sim/Organization.java`

UI 핵심:

- `components/ide/Canvas.js`, `IDE.js`, `Workspace.js`, `RegistryModules.js`
- `components/wizard/AvailableModulesGrid.js` (신규)
- `components/wizard/IDnTypePage.js`, `PropertiesPage.js`, `IOVariablesPage.js`, `ServicesPage.js`
- `hooks/useCanvasDragAndDrop.js`, `useCanvasState.js`, `useRegistryModules.js`
- `hooks/useWizardDialogState.js`, `usePropertiesState.js`, `useIOVariablesState.js`
- `utils/canvas/moduleLinkUtils.js` (신규)
- `utils/wizard/linkedModuleSource.js` (신규)
- `utils/wizard/linkedPropertiesMerge.js` (신규)
- `utils/registryFetch.js` (신규)

더 세부적인 개발 경위는 다음 문서를 함께 참고한다.

- `document/교수님_보고용_프로그램_수정내역.md`
- `document/교수님_보고용_프로그램_수정내역_2차보고.md`
- `document/ROBOT_EXECUTE_쉬운설명.md`
