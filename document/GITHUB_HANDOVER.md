# GitHub 전달용 설명문

## 권장 PR 제목

```text
feat: Robot–Software 합성 흐름과 Registry/Execute 안정성 보완
```

## PR 본문

### 변경 목적

기존 RODOS2의 Controller 중심 정보 모델 연결 흐름을 Robot까지 확장하고, 원격 Registry 장애나 moduleID 유실 때문에 Robot Execute 준비가 실패하던 문제를 보완했습니다. ISO 22166 전체 구현이 아니라, 기존 구조의 `swAspects` 참조와 선택적 데이터 import 방식을 유지한 개선입니다.

### 주요 변경

- Robot/Controller Wizard에서 Software·Hardware 정보 모델 선택
- Robot 또는 Controller 위 Software drop 시 linked Wizard 실행
- 연결 Software의 Properties, I/O Variables, Services 선택 import
- 서로 다른 XML 태그 및 JSON 필드명 호환
- WorkSpace XML을 Registry 목록/조회에 포함
- 원격 Registry 타임아웃, 목록 캐시, 로컬 fallback 저장
- 캔버스 moduleID를 서버 `ref`로 보존
- Robot–Controller 계층과 composite organization 저장
- Execute 전 Software ref, HW target, Simulation 설정 검증
- 실행법, 변경 이유, 제한사항 문서화

### 변경 의도

- 외부 Registry 상태와 무관하게 로컬 개발·시연을 가능하게 함
- 정보 모델 전체 자동 덮어쓰기 대신 사용자가 필요한 항목만 합성하도록 함
- Docker Agent 호출 전에 잘못된 캔버스/매핑 상태를 사용자에게 설명함
- 기존 XML과 새 XML을 동시에 읽어 이전 데이터 호환성을 유지함

### 검증

- [x] Java 17 / `gradlew test --no-daemon` 성공
- [x] UI 일반 production build 성공
- [ ] UI CI build — ESLint 경고 정리 필요
- [ ] UI unit test — CRA/Jest와 `react-router-dom@7.5.2` resolve 문제 해결 필요
- [ ] 원격 IIC Registry 실제 연동
- [ ] Docker Agent `:9999` 실제 장비 Execute

### 주의사항

- `.edge-manual-profile`, `node_modules`, `.gradle`, `build`, `bin`, 로컬 runtime state는 업로드하지 않습니다.
- 로컬 Registry는 `.rodos/local-registry/modules.json`에 저장되는 개발/시연용 fallback입니다.
- `ExecutorManager`, `DeployAgentApi`, `DockerCMD`는 변경하지 않았습니다.
- 세부 내용과 알려진 제한은 `HANDOVER.md`를 확인해 주세요.

### 리뷰 포인트

1. Robot–Controller–Software의 `moduleID/ref/parentRobotRef` 전달
2. `linked-data`의 `swAspects`와 `hwAspects` 확장 동작
3. Properties/I/O/Services import 시 중복 제거 및 원본 moduleID 유지
4. 원격 Registry 4xx와 네트워크/5xx 실패의 구분
5. Execute validation 메시지와 실제 Agent 호출 차단 조건

