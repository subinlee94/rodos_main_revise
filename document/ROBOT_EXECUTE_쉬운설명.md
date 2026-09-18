# Robot Execute — 초보자용 설명 가이드

교수님·팀원에게 말할 때 쓰는 **쉬운 버전**입니다.  
기술 문서 `DEPLOY_EXECUTABLEFORM_FLOW.md`(상세) / `ROBOT_EXECUTE_SETUP.md`(요약)는 개발자용이고, **이 파일은 “왜 / 무엇을 / 어떻게 말할지”** 에 맞춰져 있습니다.

---

## 1. 한 줄로 뭐 하는 프로그램인가?

RODOS2 IDE는 **로봇 시스템을 블록(육각형·원)으로 그려 놓고**,  
그 구성을 바탕으로 **Docker Agent(원격 PC의 :9999 서버)** 에게  
“이 소프트웨어 컨테이너를 이렇게 실행해 달라”고 **Execute** 버튼으로 요청하는 도구입니다.

- **육각형(분홍 등)** = Robot / Edge / Cloud 같은 **하드웨어(플랫폼)**
- **원(노란/파란)** = 그 위에서 돌아갈 **Software 모듈**
- **Execute** = 실제로 컨테이너 실행 요청

---

## 2. 비유로 이해하기

| 비유 | RODOS2에서 |
|------|------------|
| **아파트(로봇)** | 캔버스의 Robot 육각형 |
| **아파트 주소(IP)** | Mapping with HW로 넣는 `target` |
| **세대(소프트웨어)** | Robot 위의 원(SW 모듈) |
| **세대 주민 명부 번호** | Registry의 **moduleID** → 저장 시 `ref` |
| **이사 설명서(실행 방법)** | XML 안의 **ExecutableForm** (docker 이미지·명령) |
| **우체국(Agent)** | `http://IP:9999` Docker Agent |

**Execute가 되려면**

1. 아파트(Robot)가 있고  
2. 그 안에 세대(SW)가 최소 1개 있고  
3. 세대 주민 번호(ref)가 Registry와 맞고  
4. 실제 기기로 돌릴 때는 아파트 주소(target)가 있고  
5. 설명서(ExecutableForm)가 XML에 있어야 합니다.

Robot **육각형만** 있고 **원이 없으면** — 실행할 SW가 없어서 Execute할 게 없습니다.

---

## 3. 문서(`DEPLOY_EXECUTABLEFORM_FLOW.md`)가 말하는 흐름 (쉽게)

```
[사용자] Execute 버튼
    ↓
[웹 UI] "execute 해 줘" (모듈 목록은 안 보냄)
    ↓
[서버] 저장된 캔버스 상태(SharedUserState) 읽기
    ↓
[서버] Robot / Edge / Cloud + 각각 안의 SW 목록으로 정리(Configuration)
    ↓
[서버] SW마다 Registry에서 XML 읽기 → ExecutableForm(이미지·명령) 꺼냄
    ↓
[서버] Robot이면 robot.getTarget() IP로 Agent 호출
    ↓
[Docker Agent :9999] 컨테이너 실행
```

**중요:** 예전 문서·코드에도 Robot Execute **경로는 있었습니다.**  
“Robot Execute가 아예 없었다”가 아니라, **준비 데이터가 잘못되어** 실패하거나 아무 일도 없는 것처럼 보였습니다.

---

## 4. 예전에 Robot에서 자주 깨지던 이유 (3가지)

### ① SW 식별 번호(moduleID)가 저장 안 됨

- Execute할 때 서버는 SW의 **`ref`** 로 Registry에서 XML을 찾습니다.
- 예전에는 **이름으로만** ID를 찾다가, 못 찾으면 **임의 UUID**가 들어감 → Registry 조회 실패 → ExecutableForm 없음 → Agent에 의미 없는 기본값.

**우리가 한 일:** 캔버스에 드래그할 때 알고 있는 **moduleID를 그대로 ref에 저장**.

### ② Robot에 “주소(target)” 없음

- 실제 로봇 PC(Agent)로내려면 **Mapping with HW**에서 Robot 이름에 IP를 넣어야 함.
- 없으면 Agent 호출이 실패.

**우리가 한 일:** Execute **전에** “target 설정하세요” 검증 + 화면 alert.

### ③ Simulation 모드인데 Simulation 설정 안 함

- 시뮬레이션으로 돌릴 때는 **Mapping with Simulation** 설정이 필요 (문서·코드상 Simulation Edge 경로).
- 설정 없이 Execute하면 기대와 다르게 동작.

**우리가 한 일:** Simulation 모드일 때 HW 설정 없으면 검증 메시지 + `ROBOT_EXECUTE_SETUP.md`에 절차 정리.

---

## 5. 우리가 **수정한 것** vs **안 건드린 것**

### 수정한 것 (Agent에 보내기 **전** 준비)

| 무엇 | 어디 | 쉬운 설명 |
|------|------|-----------|
| SW moduleID → ref | 서버 `SharedUserStateService` | 세대 주민 번호를 제대로 저장 |
| HW moduleID → ref | 위와 동일 | 아파트 번호도 저장 |
| Execute 전 검증 API | `GET /api/validate-execute` | 실행 전에 “주소·세대·설정” 체크 |
| Execute 시 검증 | `executeModules()` | 문제 있으면 Agent 안 부르고 오류 반환 |
| UI alert | `useModuleProgress.js` | Execute 누르기 전에 사용자에게 알림 |
| 쉬운 절차 문서 | `ROBOT_EXECUTE_SETUP.md` | 테스트 순서 정리 |

### 안 건드린 것 (이미 문서에 있던 Agent 본체)

| 무엇 | 설명 |
|------|------|
| `DeployAgentApi` | `http://IP:9999` 로 HTTP 보내는 부분 — **그대로** |
| `ExecutorManager` | Robot/Edge 루프, ExecutableForm 파싱 — **그대로** |
| `DockerCMD` | docker run 문자열 해석 — **그대로** |

**교수님께:**  
“Agent 호출 모듈은 문서대로 유지하고, **데이터 준비와 실행 전 검증**을 문서 §5.1·§7.4에 맞게 보완했습니다.”

---

## 6. Controller는 되는데 Robot은 안 된다? (헷갈릴 때)

- **Controller 전용 Execute 버튼은 없습니다.**
- 캔버스에서 Controller(사각형)도 저장할 때 **Robot과 같은 목록**에 들어가는 경우가 많고,
- Execute 대상은 **항상 “HW 위에 올린 SW 원”** 입니다.

그래서 “Controller는 된다” = 보통 **사각형 + SW 원 + Mapping + ExecutableForm** 이 맞았던 경우이고,  
“Robot은 안 된다” = **원 없음 / target 없음 / moduleID 깨짐** 인 경우가 많았습니다.

---

## 7. 테스트할 때 순서 (그대로 따라 하기)

1. Registry에서 **Robot** → 캔버스 (육각형)
2. Registry에서 **Software** → **Robot 육각형 위**에 드롭 (원 + 필요 시 linked 위자드)
3. **저장** (캔버스 상태가 서버에 반영되도록)
4. **실제 기기 실행**이면: Menu → **Mapping with HW** → Robot 이름에 Agent IP
5. **시뮬레이션**이면: Menu → **Mapping with Simulation** 설정
6. SW XML에 **ExecutableForm** 있는지 확인 (Wizard에서 저장된 Module Info 등)
7. **Execute**

검증만 보려면 (서버 켠 뒤):  
브라우저에서 `http://localhost:8080/api/validate-execute`

---

## 8. 교수님께 말할 때 30초 버전

> “RODOS2 Execute는 프로젝트 문서 `DEPLOY_EXECUTABLEFORM_FLOW.md`에 정의된 대로,  
> 캔버스에 저장된 Robot과 그 위 Software 모듈을 Registry XML의 ExecutableForm으로 읽어  
> Docker Agent 9999 포트로 실행 요청합니다.  
> Robot Execute 경로는 원래 코드에 있었으나, Software moduleID가 ref로 저장되지 않거나  
> HW Mapping target이 없어 실패하는 경우가 많아, ref 저장·Execute 전 검증 API·UI 안내를 추가했습니다.  
> Agent 호출부(ExecutorManager, DeployAgentApi)는 변경하지 않았습니다.”

---

## 9. 자주 나올 질문 (FAQ)

**Q. Execute와 Deploy 차이?**  
- **Deploy** = 이미지를 Agent에 올리는 요청 (지금은 문서상 이미지가 default로 고정인 부분 있음)  
- **Execute** = 올라간(또는 있는) 이미지로 **컨테이너 실행**

**Q. ISO 22166 PDF랑 뭐가 같나?**  
- PDF는 SW 모듈 IM에 **ExecutableForm 등 필수 항목**을 정의.  
- 우리 Execute는 그 XML을 Registry에서 읽어 Agent에 넘김.  
- PDF에 “드래그 시 이 필드만 복사” 같은 구현 표는 없어서, **swAspects 링크 + ref 저장** 수준으로 맞춤.

**Q. 아직 안 된 것?**  
- Deploy도 ExecutableForm에서 이미지 읽기  
- swAspects만 있고 캔버스에 원이 없을 때 자동 Execute  
- Composite 전체를 한 번에 실행하는 기능

---

## 10. 파일 어디를 보면 되나 (궁금할 때)

| 알고 싶은 것 | 파일 |
|-------------|------|
| 전체 Execute/Deploy 흐름 | `document/DEPLOY_EXECUTABLEFORM_FLOW.md` |
| Robot 테스트 순서·보고 요약 | `document/ROBOT_EXECUTE_SETUP.md` |
| ref 저장·검증 로직 | `SharedUserStateService.java` |
| Execute 전 API | `SharedUserStateController.java` → `/validate-execute` |
| Execute 버튼 UI | `useModuleProgress.js`, `MenuBox.js` |

---

## 11. 용어 미니 사전

| 용어 | 뜻 |
|------|-----|
| SharedUserState | 캔버스에 그린 Robot/SW 배치를 서버에 저장한 상태 |
| Configuration | Execute할 때 쓰는 Robot/Edge/Cloud 목록 구조 |
| ref / moduleID | Registry에서 모듈 XML 찾는 키 |
| target | Docker Agent가 있는 PC IP (Mapping with HW) |
| ExecutableForm | XML 안의 실행 정보 (docker 이미지 URL, shell 명령) |
| Agent | `http://target:9999` 에서 받는 실행 서버 |
