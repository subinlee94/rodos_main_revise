## RODOS2

### Robot Organization & DistributiOn System  
### Robot Orchestration & DistributiOn System  
### Robot cOmposition & DistributiOn System  

---

## 사용 방법

### 1. rodos2-ui (프론트엔드)

**설치 및 실행**

```bash
cd rodos2-ui
npm install
npm start         # 개발 서버 실행 (http://localhost:3000)
# 또는
npm run build     # 프로덕션 빌드
```

---

### 2. rodos2-server (백엔드)

**설치 및 실행**

```bash
cd rodos2-server
./mvnw spring-boot:run
# 또는
mvn spring-boot:run
```
- 또는 Visual Studio Code 등에서 Run 기능을 사용해도 됩니다.
- 서버는 기본적으로 [http://localhost:8080](http://localhost:8080)에서 실행됩니다.

---

### 3. 전체 실행 순서

1. **프론트엔드 빌드**
    - `rodos2-ui` 디렉토리에서 React 앱을 빌드합니다.
2. **백엔드 서버 실행**
    - `rodos2-server` 디렉토리에서 Spring Boot 서버를 실행합니다.
3. **접속**
    - 브라우저에서 [http://localhost:8080/app](http://localhost:8080/app)으로 접속하여 실행된 것을 확인할 수 있습니다.

---

### 4. 기타

- **개발 환경**:  
  - Node.js 16+
  - Java 17+ (OpenJDK 권장)
  - Spring Boot
  - React.js

---
