# Changelog

이 문서는 `D:\rodos2-main_original\rodos2-main`을 기준으로 현재 수정본의 주요 변경을 정리한다.

## [Handover] - 2026-09-18

### Added

- Robot/Controller에서 재사용하는 Available Modules grid
- Robot 위 Software drop 및 linked Wizard 흐름
- Robot–Controller 부모 관계(`parentRobotRef`) 저장과 복원
- linked `swAspects`/`hwAspects`의 Properties, I/O Variables, Services 선택 import
- WorkSpace Module Info XML을 Registry 목록과 조회에 병합하는 `WorkspaceImService`
- Properties의 명시적 JSON 변환을 담당하는 `PropertiesMapSerializer`
- 원격 Registry 장애 시 사용하는 파일 기반 `LocalImRegistryStore`
- Registry 업로드 결과를 원격 성공/로컬 성공/실패로 구분하는 `ImUploadResult`
- Execute 준비 상태를 확인하는 `GET /api/validate-execute`
- Robot 실행 및 사용자 실행 안내 문서와 발표 자료

### Changed

- Registry 분류별 조회를 병렬화하고 30초 목록 캐시 적용
- Registry HTTP 연결/읽기 타임아웃 적용
- 원격 Registry 주소와 fallback 옵션을 `application.properties`로 이동
- Registry snake_case/camelCase 응답 정규화
- 캔버스 moduleID를 SharedUserState의 `ref`로 우선 보존
- 연결된 Controller가 상위 Robot의 target 정보를 사용할 수 있도록 구성 보완
- Robot organization을 Robot owner와 Controller `OWNED` member 구조로 생성
- `compilerType`/`compiler`, `opType`/`optype`, `Libraries/Item`/`Library` XML 형식 호환
- UI 빌드 결과를 서버 정적 리소스에 갱신

### Fixed

- bit 값 `_32`와 서버 enum `BIT32` 불일치로 인한 Software 정보 모델 저장 실패
- XML 대소문자 확장자 처리와 업로드 후 Registry 목록 미갱신
- 연결 Software의 OS/Compiler/Execution/Libraries/Organization이 UI 탭에 반영되지 않던 문제
- I/O Variables와 Service method import 시 출처 moduleID가 유실되던 문제
- 이름 기반 moduleID lookup 실패 후 임의 UUID가 Execute ref로 저장되던 문제
- Robot/Controller 구성 오류가 Docker Agent 호출 단계까지 늦게 발견되던 문제
- Workspace 삭제 요청에서 안전하지 않은 경로를 사용할 가능성

### Known Issues

- UI 일반 빌드는 성공하지만 ESLint 경고가 있으며 `CI=true` 빌드는 실패한다.
- UI Jest 테스트는 CRA/Jest와 `react-router-dom@7.5.2` resolve 문제로 실행되지 않는다.
- 외부 Registry와 실제 Docker Agent 연동은 별도 환경에서 검증해야 한다.
- ISO 전체 필드 자동 병합과 ExecutableForm 기반 Deploy 전체 흐름은 구현 범위 밖이다.

