# RODOS2 실행·접속 안내 (초보자용)

이 문서는 **프로그램을 처음 받는 사람**을 위한 안내입니다.  
구글 드라이브에서 폴더를 받은 뒤, **서버를 실행하고 브라우저로 접속**하는 방법만 정리했습니다.

---

## 0. 먼저 확인할 것 (공유하는 사람이 적어 두세요)

| 항목 | 예시 / 채울 칸 |
|------|----------------|
| 구글 드라이브 링크 | `______________________________` |
| ZIP 파일 이름 | 예: `rodos2-main.zip` |
| 접속 주소 (본인 PC에서 실행할 때) | `http://localhost:8080/app` |
| 다른 PC/연구실 서버에 이미 켜져 있을 때 | `http://서버IP:8080/app` 예: `http://192.168.x.x:8080/app` |

> **둘 중 하나만 하면 됩니다.**  
> - **A.** 이미 누군가는 서버를 켜 둔다 → 아래 **「1. 브라우저로만 접속」**  
> - **B.** 각자 PC에서 직접 켠다 → **「2. 준비물」**부터 **「4. 서버 실행」**까지

---

## 1. 브라우저로만 접속 (서버가 이미 켜져 있는 경우)

1. Chrome / Edge 등 브라우저를 연다.
2. 주소창에 안내받은 주소를 입력한다.  
   - 같은 PC에서 서버를 켠 경우: **`http://localhost:8080/app`**  
   - 다른 컴퓨터에서 켠 경우: **`http://(그 컴퓨터 IP):8080/app`**
3. RODOS2 IDE 화면이 보이면 성공이다.

안 될 때:

- 주소 오타, `http` / 포트 `8080` / 경로 `/app` 확인
- 서버를 켠 사람에게 **서버가 켜져 있는지** 확인
- 연구실 PC끼리라면 **같은 Wi-Fi / 같은 네트워크**인지 확인 (학교·방화벽 정책에 따라 막힐 수 있음)

---

## 2. 본인 PC에서 직접 실행할 때 — 준비물

| 준비물 | 용도 | 설치 확인 |
|--------|------|-----------|
| **Java 17** | 서버(Spring Boot) 실행 | 명령창에 `java -version` → 17 근처 버전 |
| **Node.js** (LTS, 예: 18 또는 20) | 화면(UI) 빌드 | 명령창에 `node -v`, `npm -v` |
| **구글 드라이브에서 받은 폴더** | 프로그램 전체 | 아래에 `rodos2-ui`, `rodos2-server` 폴더가 있어야 함 |

Windows면:

1. **시작** → `cmd` 또는 **PowerShell** 검색 후 실행  
2. 위 명령으로 Java / Node가 설치됐는지 확인  
3. 없으면 설치 후 **명령창을 닫았다가 다시** 연다

권장:

- Java: [Adoptium Temurin 17](https://adoptium.net/) 등 **JDK 17**
- Node: [nodejs.org](https://nodejs.org/) **LTS**

---

## 3. 구글 드라이브에서 받은 뒤 폴더 열기

1. 구글 드라이브 링크에서 ZIP을 **다운로드**한다.
2. 압축을 푼다. (예: `D:\rodos2-main\` 또는 `다운로드\rodos2-main\`)
3. 압축 푼 안쪽에 대략 이런 구조가 보이면 정상이다.

```text
rodos2-main/          ← 여기가 프로젝트 루트
  rodos2-ui/          ← 화면 (React)
  rodos2-server/      ← 서버 (Java)
  document/           ← 설명 문서
```

> `node_modules`가 없어도 괜찮습니다. 아래에서 `npm install`로 설치합니다.  
> ZIP이 매우 크면 `node_modules`를 빼서 올렸을 수 있습니다.

---

## 4. 서버 실행 (추천 순서)

**목표:** 브라우저에서 `http://localhost:8080/app` 가 열리게 한다.

Windows PowerShell / 명령 프롬프트 기준입니다.  
`(프로젝트루트)`는 실제로 압축 푼 경로로 바꿔 쓰세요.  
예: `D:\rodos2-main\rodos2-main`

### 4-1. (처음 한 번) UI 의존성 설치 + 화면 빌드

```powershell
cd (프로젝트루트)\rodos2-ui
npm install
npm run build
```

- `npm install`은 시간이 꽤 걸릴 수 있다.
- `npm run build`가 끝나면 화면 파일이 서버 쪽 `static` 폴더로 복사된다.

### 4-2. 서버 켜기

**새** 명령창을 열어 (또는 같은 창에서):

```powershell
cd (프로젝트루트)\rodos2-server
.\gradlew.bat bootRun
```

성공하면 로그에 비슷한 문구가 나온다.

```text
Started Rodos2ServerApplication
Tomcat started on port 8080
```

이 창은 **닫지 말고** 그대로 둔다. 닫으면 서버가 꺼진다.

### 4-3. 브라우저 접속

주소창에 입력:

```text
http://localhost:8080/app
```

화면이 안 보이거나 예전 화면이면:

- **Ctrl + F5** (강력 새로고침)
- 서버를 켠 창에 에러가 없는지 확인
- `npm run build` 후 **서버를 한 번 끄고** `bootRun`을 **다시** 실행

---

## 5. (선택) 화면만 따로 개발 모드로 켜기

평소 사용·시연은 **4번(빌드 + bootRun + `/app`)** 이면 충분하다.

개발할 때만:

| 창 | 명령 | 주소 |
|----|------|------|
| 서버 | `rodos2-server`에서 `.\gradlew.bat bootRun` | API `http://localhost:8080` |
| UI | `rodos2-ui`에서 `npm start` | 보통 `http://localhost:3000` |

일반 사용자는 **3000번보다 8080/app** 을 쓰는 것을 권장한다.

---

## 6. 다른 사람이 내 PC 서버에 접속하게 하려면

1. 내 PC에서 위 **4번**대로 서버를 켠다.
2. 내 PC IP를 확인한다.  
   - 설정 → 네트워크 → IP, 또는 `ipconfig`  
   - 예: `192.168.0.15`
3. 상대방에게 주소를 알려준다.

```text
http://192.168.0.15:8080/app
```

주의:

- **같은 네트워크**(같은 Wi-Fi / 유선)여야 한다.
- Windows 방화벽이 **8080**을 막을 수 있다 → 「앱 허용」 또는 일시적으로 허용 필요
- 집·학교 NAT 밖 인터넷에서 접속하려면 별도 설정이 필요하고, 이 문서 범위 밖이다.

---

## 7. 자주 나오는 문제

| 증상 | 원인 / 대처 |
|------|-------------|
| `Port 8080 was already in use` | 이미 다른 프로그램이 8080 사용. 예전 서버창을 닫거나 해당 프로세스 종료 후 `bootRun` 다시 |
| 페이지 404 / 흰 화면 | `npm run build` 했는지, 주소가 **`/app`** 인지, 서버 재시작 |
| `java` / `gradlew` 명령 인식 안 됨 | JDK 17 설치, PATH, 명령창 재실행. `rodos2-server` 폴더로 `cd` 했는지 확인 |
| `npm` 인식 안 됨 | Node.js 설치 후 명령창 재실행 |
| Registry Loading이 오래 감 | 원격 Registry가 느릴 수 있음. 잠시 대기하거나, 네트워크/VPN 확인 |
| UI 고쳤는데 화면에 안 반영 | `npm run build` → **bootRun 재시작** → 브라우저 **Ctrl+F5** |

---

## 8. 공유할 때 추천 패키지 (올리는 사람용)

구글 드라이브에는 아래처럼 올리면 상대가 덜 헷갈린다.

```text
공유폴더/
  README_접속안내.md          ← 이 문서 (또는 PDF)
  rodos2-main.zip             ← 소스 (가능하면 node_modules 제외)
```

ZIP에 넣을 것:

- `rodos2-ui` (소스) + `rodos2-server` + `document`
- `rodos2-ui/node_modules` 는 **용량 크면 제외** → 받는 사람이 `npm install`

상대에게 같이 적을 문장 예시:

> 1. ZIP 받아서 압축 풀기  
> 2. Java 17, Node.js 설치  
> 3. `rodos2-ui`에서 `npm install` → `npm run build`  
> 4. `rodos2-server`에서 `.\gradlew.bat bootRun`  
> 5. 브라우저 `http://localhost:8080/app`

이미 연구실 서버에 띄워 둘 거면:

> 서버 켜져 있을 때 → `http://(연구실서버IP):8080/app` 만 열면 됩니다.

---

## 9. 한 장 요약

```text
[구글 드라이브 ZIP 받기]
        ↓
[압축 풀기 → rodos2-ui / rodos2-server 확인]
        ↓
[Java 17 + Node.js 설치]
        ↓
[rodos2-ui]  npm install  →  npm run build
        ↓
[rodos2-server]  .\gradlew.bat bootRun   (창 유지)
        ↓
브라우저  http://localhost:8080/app
```

---

*작성 기준: RODOS2 (rodos2-ui + rodos2-server, 기본 포트 8080, UI 경로 `/app`)*
