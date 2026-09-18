# Deploy / ExecutableForm 처리 흐름 정리

## 1) 개요

이 프로젝트의 배포는 외부 Docker Agent API(`:9999`)를 통해 수행됩니다.

현재 동작 모드는 다음 3가지입니다.

- **Deploy**: 이미지 배포 요청 (`/image/deploy`)
- **Execute**: 컨테이너 실행 요청 (`/machine/deploy`)
- **Stop**: 실행 중지 요청 (`/machine/stop`)

중요 포인트:

- `ExecutableForm`(`exeFileURL`, `shellCmd`)은 **Execute 경로**에서 적극 사용됩니다.
- **Deploy 경로**는 현재 `ExecutableForm`에서 이미지/태그를 해석하지 않고, `ExecutorManager.appendDeployBody()`에서 기본값을 사용합니다.

---

## 2) Deploy 시 프론트엔드 -> 백엔드 전송 데이터

Deploy 버튼 클릭 흐름:

1. `MenuBox`의 deploy 버튼 클릭
2. `ProgressDialog`가 `taskType='deploy'`로 열림
3. `useModuleProgress.startOverallOperation('deploy')` 호출
4. 내부에서 `canvasAPI.deployModules()` 실행

실제 요청:

```json
POST /api/operations
{
  "action": "deploy"
}
```

참고:

- 프론트는 모듈 목록을 직접 body로 보내지 않습니다.
- 모듈/하드웨어 매핑 정보는 백엔드에서 `SharedUserState`를 읽어 사용합니다.

관련 파일:

- `rodos2-ui/src/components/ide/MenuBox.js`
- `rodos2-ui/src/components/ide/ProgressDialog.js`
- `rodos2-ui/src/hooks/useModuleProgress.js`
- `rodos2-ui/src/services/api.js`

---

## 3) 백엔드 Deploy 처리 흐름

### 3.1 진입점: 통합 Operations API

- `SharedUserStateController.operations()`가 `{action:"deploy"}` 요청 수신
- `action == "deploy"`인 경우:
  - `SharedUserState state = sharedUserStateService.loadCurrentState()`
  - `sharedUserStateService.deployModules(state)` 호출

파일:

- `rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/controller/SharedUserStateController.java`

네, 이 부분은 **캔버스 상태(SharedUserState)를 읽어와 배포용 구조로 변환하는 시작점**입니다.

- `operations()`에서 `sharedUserStateService.loadCurrentState()`를 호출하면 저장된 캔버스 상태(`SharedUserState`)를 로드합니다.
- `SharedUserState` 내부 구조는 `editors.system` 기준으로 다음처럼 정의됩니다.
  - `Robot[]`, `Edge[]`, `Cloud[]`
  - 각 HW 내부에 연결된 `Module[]`
- 이후 `sharedUserStateService.deployModules(state)`에서 `state.toConfiguration()`을 호출해
  - `Configuration.robots`
  - `Configuration.edges`
  - `Configuration.clouds`
  형태로 변환합니다.
- 이 `Configuration`이 `ExecutorManager.doCRDADeploy(config)` 입력이 되어 실제 배포 요청(`DeployBody`) 생성으로 이어집니다.

정리하면, 여기서는 XML 정보를 매번 직접 파싱하기보다 **캔버스/워크스페이스에 저장된 SharedUserState를 실행 표준 구조(Configuration)로 정의**합니다.


### 3.2 서비스 레이어

- `SharedUserStateService.deployModules(state)` 처리:
  1. `state.toConfiguration()`으로 실행용 `Configuration` 생성
  2. `executorManager.doCRDADeploy(config)` 호출
  3. 결과 요약 반환:
     - `success`
     - `deployedModules`
     - `failedModules`
     - `totalDeployed`
     - `totalFailed`

파일:

- `rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/SharedUserStateService.java`

### 3.3 실행기 레이어 (실제 배포 요청 생성)

- `ExecutorManager.doCRDADeploy(config)`는 아래를 순회합니다.
  - `config.edges`
  - `config.robots`
  - `config.clouds`
- 각 타겟마다:
  - `DeployBody` 생성
  - 각 모듈에 대해 `appendDeployBody(clusterName, deployBody, moduleInfo)` 호출
  - `DeployAgentApi.doDeploySync(target, deployBody)`로 실제 요청 전송

파일:

- `rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/compute/ExecutorManager.java`

---

## 4) DeployBody / DeployAgentApi 상세

### 4.1 DeployBody

`DeployBody`는 `DeployItem` 리스트 래퍼입니다.

주요 필드:

- `clusterName`
- `imageName`
- `moduleName`
- `tag`

`append(clusterName, imageName, moduleName, tag)`로 항목을 추가합니다.

파일:

- `rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/rest/agent/DeployBody.java`

### 4.2 DeployAgentApi

Retrofit 엔드포인트:

- `POST /image/deploy` -> deploy
- `POST /machine/deploy` -> execute
- `POST /machine/stop` -> stop
- `GET /machine/restart` -> restart

Agent URL 규칙:

- `http://{ip}:9999`
- `ip`가 `docker:`로 시작하면 prefix 제거 후 사용

Deploy 호출:

- `DeployAgentApi.doDeploySync(targetIp, deployBody)`

파일:

- `rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/rest/agent/DeployAgentApi.java`

---

## 5) ExecutableForm / docker run 해석이 실제로 일어나는 위치

### 5.1 실제 해석 위치

`ExecutableForm` 해석은 현재 **Deploy가 아니라 Execute 경로**에 구현되어 있습니다.

`ExecutorManager` 기준:

- `getExecutableForm(moduleInfo)`:
  - IM Registry에서 XML 조회 (`imRegistryApi.getIM(moduleInfo.getRef())`)
  - `SoftwareModule.fromXml(xmlContent)`로 파싱
  - `softwareModule.getExecutableForm()` 반환

- ExecuteItem 구성 시:
  - 첫 번째 `ExeForm`의 `exeFileURL`, `shellCmd` 읽기
  - `DockerCMD.parseDockerRunCommand(shellCmd)`로 docker run 명령 해석
  - 옵션 매핑:
    - `--privileged`
    - `-d/--detach`
    - `-t/--tty`
    - `--rm`
    - `--network <mode>`

관련 파일:

- `rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/compute/ExecutorManager.java`
- `rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/compute/docker/DockerCMD.java`
- `rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/rest/agent/ExecuteBody.java`
- `rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/rest/agent/ExecuteItem.java`

### 5.2 현재 Deploy 동작(중요)

`appendDeployBody()`의 현재 동작:

- `moduleRef`로 IM 조회 (존재 여부 확인)
- 이미지를 하드코딩 기본값으로 설정:
  - `imageName = "default-image:latest"`
- 태그 `"latest"`로 DeployItem 추가

즉, 현재 **Deploy는 ExecutableForm 기반으로 image/tag를 생성하지 않습니다.**

---

## 6) DockerAgentService 역할

`DockerAgentService`는 외부 API에서 Docker Agent 목록을 조회합니다.

- `GET http://iic-api.kangwon.ac.kr:8008/dockerAgent/list`

응답(Map 배열)을 `DockerAgent(ip, hwname, type)`로 변환합니다.

현재 역할:

- 주로 Agent 목록 조회/표시에 사용
- `doCRDADeploy`에서 타겟 선택을 직접 결정하지는 않음  
  (타겟은 `Configuration`의 edge/robot/cloud target 사용)

파일:

- `rodos2-server/src/main/java/com/java/kr/ac/kangwon/rodos/service/rest/agent/DockerAgentService.java`

---

## 7) 하드웨어로 데이터 전송하는 실제 위치

### 7.1 전송 진입점

**파일**: `rodos2-server/src/main/java/.../compute/ExecutorManager.java`

하드웨어로 데이터를 전송하는 실제 호출 위치:

#### Deploy 전송
```java
// Edge 배포 (62줄)
Response<AgentResult> response = DeployAgentApi.doDeploySync(edge.getTarget(), deployBody);

// Robot 배포 (83줄)
Response<AgentResult> response = DeployAgentApi.doDeploySync(robot.getTarget(), deployBody);

// Cloud 배포 (104줄)
Response<AgentResult> response = DeployAgentApi.doDeploySync(cloud.getTarget(), deployBody);
```

#### Execute 전송
```java
// Edge 실행 (379줄)
Response<AgentResult> response = DeployAgentApi.doExecuteSync(edge.getTarget(), executeBody);

// Robot 실행 (431줄)
Response<AgentResult> response = DeployAgentApi.doExecuteSync(robot.getTarget(), executeBody);

// Cloud 실행 (475줄)
Response<AgentResult> response = DeployAgentApi.doExecuteSync(cloud.getTarget(), executeBody);
```

#### Stop 전송
```java
// Edge 중지 (503줄)
Response<AgentResult> response = DeployAgentApi.doStopSync(edge.getTarget(), stopBody);

// Robot 중지 (522줄)
Response<AgentResult> response = DeployAgentApi.doStopSync(robot.getTarget(), stopBody);

// Cloud 중지 (541줄)
Response<AgentResult> response = DeployAgentApi.doStopSync(cloud.getTarget(), stopBody);
```

### 7.2 실제 HTTP 요청 생성 및 전송

**파일**: `rodos2-server/src/main/java/.../service/rest/agent/DeployAgentApi.java`

#### URL 생성 (40-57줄)
```java
private static Retrofit getInstance(String ip) {
    if (ip.startsWith("docker:"))
        ip = ip.split("docker:")[1];
    String url = "http://" + ip + ":9999";  // 하드웨어 Agent URL
    // Retrofit 인스턴스 생성
    return retrofit;
}
```

#### 동기 호출 메서드 (127-135줄)
```java
public static Response<AgentResult> doDeploySync(String ip, DeployBody deployBody) {
    try {
        var call = getApiService(ip).deploy(deployBody);  // Retrofit Call 생성
        return call.execute();  // ⭐ 실제 HTTP 요청 전송 (동기)
    } catch (Exception e) {
        System.err.println("Deploy sync failed: " + e.getMessage());
        return null;
    }
}
```

#### Retrofit 인터페이스 정의 (22-34줄)
```java
public interface Interface {
    @POST("/image/deploy")      // Deploy 엔드포인트
    Call<AgentResult> deploy(@Body DeployBody list);
    
    @POST("/machine/deploy")    // Execute 엔드포인트
    Call<AgentResult> execute(@Body ExecuteBody list);
    
    @POST("/machine/stop")      // Stop 엔드포인트
    Call<AgentResult> stop(@Body StopBody list);
    
    @GET("/machine/restart")    // Restart 엔드포인트
    Call<AgentResult> restart();
}
```

### 7.3 전송 흐름 요약

```
[ExecutorManager.doCRDADeploy/Execute/Stop]
    ↓
[각 하드웨어 타입별 순회 (Edge/Robot/Cloud)]
    ↓
[DeployBody/ExecuteBody/StopBody 생성]
    ↓
[DeployAgentApi.doDeploySync/doExecuteSync/doStopSync 호출]
    ↓
[getApiService(ip) - Retrofit 인터페이스 생성]
    ↓
[getInstance(ip) - http://{ip}:9999 URL 생성]
    ↓
[call.execute() - ⭐ 실제 HTTP POST/GET 요청 전송]
    ↓
[하드웨어 Agent API 응답 수신]
```

### 7.4 전송 대상 하드웨어 정보

- **target IP**: `edge.getTarget()`, `robot.getTarget()`, `cloud.getTarget()`
  - `Configuration` 객체에서 가져옴
  - `SharedUserState`의 `targetName` 또는 `target` 필드에서 매핑됨
- **포트**: 고정값 `9999`
- **프로토콜**: HTTP
- **전체 URL 형식**: `http://{targetIP}:9999/{endpoint}`

---

## 8) 요약

- Deploy 요청 payload는 최소 형태: `{ "action": "deploy" }`
- 백엔드는 `SharedUserState -> Configuration`으로 배포 대상/모듈을 결정
- **하드웨어로 데이터 전송 위치**: 
  - `ExecutorManager`에서 각 하드웨어별로 `DeployAgentApi.doDeploySync/doExecuteSync/doStopSync` 호출
  - `DeployAgentApi`에서 `call.execute()`로 실제 HTTP 요청 전송
  - 대상 URL: `http://{targetIP}:9999/{endpoint}`
- `ExecutableForm + docker run` 해석은 현재 **Execute 경로**에 구현되어 있음
- Deploy도 ExecutableForm 기반으로 동작시키려면 `appendDeployBody()`를 확장해야 함
