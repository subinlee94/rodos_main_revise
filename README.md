# RODOS2

Robot Organization/Orchestration/Composition & DistributiOn System.

현재 버전은 Robot/Controller–Software 정보 모델 연결, WorkSpace/Registry 연동, 선택적 Properties·I/O·Services import, Execute 사전 검증을 보완한 버전이다.

## 프로젝트 구조

```text
rodos2-main/
  rodos2-ui/       React UI
  rodos2-server/   Spring Boot server
  document/        사용·설계·보고 문서
  HANDOVER.md      원본 대비 변경 내용과 수정 의도
  CHANGELOG.md     변경 요약
```

## 요구 환경

- Java 17
- Node.js 18 또는 20 LTS 권장
- npm

## 실행 방법

### 1. UI 설치 및 빌드

Windows PowerShell:

```powershell
cd rodos2-ui
npm install
npm run build
```

`npm run build`는 React build를 생성한 후 서버의 `src/main/resources/static`으로 복사한다.

개발 서버만 실행하려면:

```powershell
npm start
```

개발 UI는 보통 `http://localhost:3000`에서 실행된다.

### 2. Spring Boot 서버 실행

Windows:

```powershell
cd rodos2-server
.\gradlew.bat bootRun
```

macOS/Linux:

```bash
cd rodos2-server
./gradlew bootRun
```

### 3. 접속

```text
http://localhost:8080/app
```

## 테스트

서버:

```powershell
cd rodos2-server
.\gradlew.bat test
```

UI:

```powershell
cd rodos2-ui
npm test -- --watchAll=false
```

현재 UI에는 ESLint 경고와 Jest/React Router resolve 문제가 남아 있다. 검증 결과와 제한사항은 [HANDOVER.md](HANDOVER.md)를 참고한다.

## 주요 문서

- [인수인계 문서](HANDOVER.md)
- [변경 기록](CHANGELOG.md)
- [GitHub 전달용 PR 설명](document/GITHUB_HANDOVER.md)
- [초보자 실행 안내](document/RODOS2_구글드라이브_실행_접속_안내.md)
- [Robot Execute 쉬운 설명](document/ROBOT_EXECUTE_쉬운설명.md)
- [1차 수정 보고](document/교수님_보고용_프로그램_수정내역.md)
- [2차 수정 보고](document/교수님_보고용_프로그램_수정내역_2차보고.md)

## Registry 설정

다음 값은 `rodos2-server/src/main/resources/application.properties`에서 변경한다.

```properties
rodos.registry.base-url=http://iic-api.kangwon.ac.kr:8008
rodos.registry.local-fallback=true
rodos.registry.connect-timeout-ms=1500
rodos.registry.read-timeout-ms=3000
rodos.registry.list-cache-ttl-ms=30000
```

원격 Registry가 연결되지 않고 local fallback이 켜져 있으면 모듈은 `.rodos/local-registry/modules.json`에 저장된다.

## GitHub 업로드 전 주의

루트 `.gitignore`를 먼저 적용한다. 특히 다음 항목은 커밋하지 않는다.

- `node_modules`
- `rodos2-server/.gradle`, `build`, `bin`
- `.edge-manual-profile`, `.codex-temp`
- 로컬 Registry 및 현재 실행 상태
- 임시 JSON과 로그
