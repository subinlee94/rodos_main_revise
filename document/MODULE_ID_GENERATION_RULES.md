# 모듈 ID 생성 규칙 문서

## 개요

정보모델 소프트웨어 입력기에서 GenInfo를 입력하면 IDnType 페이지에서 모듈 ID가 자동으로 생성됩니다. 이 문서는 모듈 ID 생성 규칙을 상세히 설명합니다.

## 모듈 ID 구조

모듈 ID는 `mID-iID` 형식으로 구성됩니다:

- **mID**: Module ID (메인 식별자, 62자리 16진수)
- **iID**: Instance ID (0~255, 16진수 2자리)

### 예시
```
a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890-1A001122-00010002-00003039-800400-00
│─────────── VID (32자) ───────────││─PID─││──RevNo──││SerialNo││CatID││iID│
```

## mID 생성 규칙

`mID`는 다음 5개 부분을 순서대로 연결하여 생성됩니다:

```
mID = VID + PID + RevNo + SerialNo + CategoryID
```

### 1. VID (Vendor ID) - 32자리 16진수

**입력값**: Manufacturer (제조사명)

**생성 방법**:
- UUID v5 알고리즘 사용
- 고정 네임스페이스: `6ba7b810-9dad-11d1-80b4-00c04fd430c8`
- 하이픈 제거 후 32자리 16진수 반환

**코드 위치**: `rodos2-ui/src/utils/module/ModuleID.js`

```javascript
export function getVID(manufacturer) {
    const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    return uuidv5(manufacturer || '', NAMESPACE).replace(/-/g, '');
}
```

**예시**:
- 입력: `"Samsung"`
- 출력: `"a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"` (32자)

---

### 2. PID (Product ID) - 8자리 16진수

**입력값**:
- `compositeType`: 'composite' 또는 'basic'
- `swAspect`: 'comp' 또는 'basic'
- `safety`: boolean (Safety 활성화 여부)
- `security`: boolean (Security 활성화 여부)
- `vendorPid1`, `vendorPid2`, `vendorPid3`: 각각 2자리 16진수

**생성 방법**:
1. **상위 2자리**: 플래그 비트 (8비트 → 16진수 2자리)
   - 비트 0: Composite Type (1=Composite, 0=Basic)
   - 비트 1: SW Aspect (1=Comp, 0=Basic)
   - 비트 2: HW Aspect (항상 0)
   - 비트 3: Safety (1=활성, 0=비활성)
   - 비트 4: Security (1=활성, 0=비활성)
   - 비트 5-7: Reserved (000)

2. **하위 6자리**: Vendor Specific PID
   - `vendorPid1` (2자리) + `vendorPid2` (2자리) + `vendorPid3` (2자리)
   - 각각 2자리 16진수로 패딩

**코드 위치**: `rodos2-ui/src/utils/module/ModuleID.js`

```javascript
export function getPID({ compositeType, swAspect, safety, security, vendorPid1, vendorPid2, vendorPid3 }) {
    let bits = '';
    bits += compositeType === 'composite' ? '1' : '0';
    bits += swAspect === 'comp' ? '1' : '0';
    bits += '0'; // HW Aspect (항상 0)
    bits += safety ? '1' : '0';
    bits += security ? '1' : '0';
    bits += '000'; // Reserved
    const bitsHex = parseInt(bits, 2).toString(16).padStart(2, '0');
    const vendorPidHex = [vendorPid1, vendorPid2, vendorPid3].map(v => (v || '00').padStart(2, '0')).join('');
    return (bitsHex + vendorPidHex).padEnd(8, '0');
}
```

**예시**:
- 입력: 
  - `compositeType: 'composite'`
  - `safety: true`
  - `security: false`
  - `vendorPid1: '00'`, `vendorPid2: '11'`, `vendorPid3: '22'`
- 비트: `11010` + `000` = `11010000` (2진수)
- 16진수 변환: `D0` (상위 2자리)
- 출력: `"D0001122"` (8자리)

---

### 3. RevNo (Revision Number) - 8자리 16진수

**입력값**:
- `revisionNumber1`: Revision Number Major (4자리 16진수)
- `revisionNumber2`: Revision Number Minor (4자리 16진수)

**생성 방법**:
- Major와 Minor를 각각 4자리 16진수로 패딩
- 두 값을 연결

**코드 위치**: `rodos2-ui/src/utils/module/ModuleID.js`

```javascript
export function getRevNo(rev1, rev2) {
    const major = (rev1 || '').toUpperCase().replace(/[^0-9A-F]/g, '').padStart(4, '0').slice(-4);
    const minor = (rev2 || '').toUpperCase().replace(/[^0-9A-F]/g, '').padStart(4, '0').slice(-4);
    return (major + minor);
}
```

**예시**:
- 입력: `revisionNumber1: "0001"`, `revisionNumber2: "0002"`
- 출력: `"00010002"` (8자리)

---

### 4. SerialNo (Serial Number) - 8자리 16진수

**입력값**: `serialNumber` (10진수, 최대 4294967295)

**생성 방법**:
- 10진수를 16진수로 변환
- 8자리로 패딩 (앞에 0 추가)

**코드 위치**: `rodos2-ui/src/utils/module/ModuleID.js`

```javascript
export function getSerialNo(serial) {
    return Number(serial || 0).toString(16).padStart(8, '0');
}
```

**예시**:
- 입력: `12345` (10진수)
- 출력: `"00003039"` (16진수, 8자리)

---

### 5. CategoryID - 6자리 16진수

**입력값**:
- `category1`: Category 1st Level (예: "0000", "0001", "0010" 등)
- `category2`: Category 2nd Level (예: "000000", "000001" 등)

**생성 방법**:
1. 24비트 2진수 구성:
   - Level0: `10` (2비트, 고정값)
   - Level1: 1st Level을 6비트 2진수로 변환
   - Level2: 2nd Level을 6비트 2진수로 변환
   - Reserved: `000000000000` (12비트, 0으로 채움)

2. 2진수를 16진수로 변환

**코드 위치**: `rodos2-ui/src/utils/module/ModuleID.js`

```javascript
export function getCategoryID(l1, l2) {
    const level0 = '10';
    const level1 = parseInt(l1 || '0', 16).toString(2).padStart(6, '0');
    const level2 = parseInt(l2 || '0', 16).toString(2).padStart(6, '0');
    const zeros = '0'.repeat(12);
    const binary = level0 + level1 + level2 + zeros;
    const hex = parseInt(binary, 2).toString(16).padStart(6, '0').toUpperCase();
    return hex;
}
```

**예시**:
- 입력: `category1: "0001"`, `category2: "000000"`
- 2진수: `10` + `000001` + `000000` + `000000000000` = `100000010000000000000000`
- 16진수 변환: `"800400"` (6자리)

---

## iID 생성 규칙

**입력값**: `instanceId` (0~255 정수)

**생성 방법**:
- 0~255 범위로 제한
- 16진수 2자리로 변환

**코드 위치**: `rodos2-ui/src/utils/module/ModuleID.js`

```javascript
export function generateIID(iid) {
    const instanceID = Number(iid || 0);
    return Math.max(0, Math.min(255, instanceID));
}
```

**표시 형식**:
- 0~255 정수를 16진수 2자리로 변환
- 예: `0` → `"00"`, `255` → `"FF"`, `10` → `"0A"`

---

## 최종 모듈 ID 조합

**코드 위치**: `rodos2-ui/src/utils/module/ModuleID.js`

```javascript
export function generateModuleID(genInfo, categoryInfo, iid) {
    const mID = generateMID(genInfo, categoryInfo);
    const iID = generateIID(iid);
    return {
        mID: mID,
        iID: iID
    };
}
```

**최종 형식**: `{mID}-{iID}`

**전체 길이**:
- mID: 62자리 16진수 (VID 32 + PID 8 + RevNo 8 + SerialNo 8 + CategoryID 6)
- iID: 2자리 16진수
- 총: 65자리 (하이픈 포함)

---

## 모듈 ID 생성 조건

모듈 ID는 다음 **모든 필수 입력값**이 채워져야 생성됩니다.

**코드 위치**: `rodos2-ui/src/hooks/useGenInfoState.js`

### 필수 입력값 목록

1. **Module Name** - 모듈명
2. **Manufacturer** - 제조사명
3. **Vendor Specific PID** - 3개 모두 입력 (각 2자리 16진수)
   - `vendorPid1`
   - `vendorPid2`
   - `vendorPid3`
4. **Revision Number** - 2개 모두 입력 (각 4자리 16진수)
   - `revisionNumber1` (Major)
   - `revisionNumber2` (Minor)
5. **Serial Number** - 일련번호 (10진수)
6. **Instance ID** - 인스턴스 ID (0~255)
7. **ID Type** - Basic 또는 Composite 선택
8. **Category 1st Level** - 1단계 카테고리 선택
9. **Category 2nd Level** - 2단계 카테고리 선택

### 생성 로직

```javascript
const isRequiredFilled = () => {
    return (
        genInfoState.moduleName &&
        genInfoState.manufacturer &&
        genInfoState.vendorPid1 && genInfoState.vendorPid2 && genInfoState.vendorPid3 &&
        genInfoState.revisionNumber1 && genInfoState.revisionNumber2 &&
        genInfoState.serialNumber &&
        (genInfoState.instanceId != null && genInfoState.instanceId !== '') &&
        genInfoState.idType &&
        selectedCategory1 && selectedCategory2
    );
};

const moduleID = isRequiredFilled()
    ? generateModuleID(genInfoState, categoryInfo, genInfoState.instanceId)
    : null;
```

---

## UI에서의 표시

GenInfo 페이지 하단에 **Module ID Preview**가 실시간으로 표시됩니다:

- **모든 필수값 입력 완료**: 모듈 ID가 파란색으로 표시
- **필수값 미입력**: "Error: 필수 입력값을 모두 입력하세요." 빨간색으로 표시

**코드 위치**: `rodos2-ui/src/components/wizard/GenInfoPage.js`

```javascript
<div style={{ marginTop: 16, fontFamily: 'monospace', color: moduleID ? '#1976d2' : '#EB5757', ... }}>
    <strong>Module ID Preview:</strong>
    <div>
        {moduleIDString ? moduleIDString : 'Error: 필수 입력값을 모두 입력하세요.'}
    </div>
</div>
```

---

## 카테고리 옵션

Category 1st Level과 2nd Level은 미리 정의된 옵션에서 선택합니다.

**코드 위치**: `rodos2-ui/src/utils/module/Category.js`

### 주요 카테고리

1. **Planning (0000)**
   - Motion planning (000000)
   - Grasp planning (000001)
   - Task planning (000010)

2. **Communication (0001)**
   - To/From Server (000000)
   - To/From Other robot (000001)
   - To/From Inner modules of a robot (000010)
   - Clouds (000011)

3. **Interaction (0010)**
   - Speech recognition (000000)
   - Speech generation (000001)
   - Gesture recognition (000010)
   - Structured dialog-based interaction (000011)

4. **General Computing (0011)**
   - Localization (000000)
   - Mapping (000001)
   - Feature detection (000010)
   - Generic data transformation (000011)
   - Learning (000100)
   - Control (000101)

5. **Orchestration/Management (0100)**
   - Orchestration service (000000)
   - Monitoring service (000001)

6. **Sensing (0101)**
   - Perception service (000000)
   - Recognition service (000001)
   - Measurement service (000010)

7. **Actuating (0110)**
   - Electrical type (000100)
   - Hydraulic type (000001)
   - Pneumatic type (000010)
   - Hybrid types (000101, 000110, 000011, 000111)

8. **Reserved (0111 - 1111)**
   - reserved

---

## 전체 생성 프로세스

1. **GenInfo 페이지에서 입력**
   - 사용자가 필수 정보 입력
   - 실시간으로 입력값 검증

2. **모듈 ID 생성**
   - `useGenInfoState` 훅에서 `generateModuleID()` 호출
   - 모든 필수값이 입력되면 자동 생성

3. **IDnType 페이지로 전달**
   - 생성된 모듈 ID가 `onModuleIdChange` 콜백을 통해 전달
   - IDnType 페이지에서 모듈 ID 표시 및 사용

4. **최종 저장**
   - 모듈 정보와 함께 모듈 ID가 XML로 저장

---

## 참고 파일

- **모듈 ID 생성 로직**: `rodos2-ui/src/utils/module/ModuleID.js`
- **GenInfo 상태 관리**: `rodos2-ui/src/hooks/useGenInfoState.js`
- **GenInfo 페이지**: `rodos2-ui/src/components/wizard/GenInfoPage.js`
- **카테고리 옵션**: `rodos2-ui/src/utils/module/Category.js`
- **IDnType 페이지**: `rodos2-ui/src/components/wizard/IDnTypePage.js`

---

## 예시: 전체 모듈 ID 생성 과정

### 입력값
- Module Name: `"TestModule"`
- Manufacturer: `"Samsung"`
- Composite Type: `Basic`
- Safety: `true`
- Security: `false`
- Vendor PID: `00`, `11`, `22`
- Revision Major: `0001`
- Revision Minor: `0002`
- Serial Number: `12345`
- Instance ID: `10`
- Category 1st: `0001` (Communication)
- Category 2nd: `000000` (To/From Server)

### 생성 과정

1. **VID**: `"Samsung"` → UUID v5 → `"a1b2c3d4..."` (32자)
2. **PID**: 
   - 비트: `01010` + `000` = `01010000` (2진수)
   - 16진수: `50`
   - Vendor PID: `001122`
   - 결과: `"50001122"` (8자)
3. **RevNo**: `"0001"` + `"0002"` = `"00010002"` (8자)
4. **SerialNo**: `12345` → `"00003039"` (8자)
5. **CategoryID**: 
   - 2진수: `10` + `000001` + `000000` + `000000000000`
   - 16진수: `"800400"` (6자)
6. **mID**: `VID + PID + RevNo + SerialNo + CategoryID` = `"a1b2c3d4...500011220001000200003039800400"` (62자)
7. **iID**: `10` → `"0A"` (2자)

### 최종 모듈 ID
```
a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890-50001122-00010002-00003039-800400-0A
```

---

## 주의사항

1. **VID 생성**: Manufacturer 값이 동일하면 항상 동일한 VID가 생성됩니다 (UUID v5의 특성)
2. **PID 플래그**: Composite Type, Safety, Security 설정에 따라 PID의 상위 2자리가 변경됩니다
3. **Serial Number**: 10진수로 입력하지만 내부적으로 16진수로 변환됩니다
4. **Instance ID**: 0~255 범위를 벗어나면 자동으로 제한됩니다
5. **카테고리**: 1st Level과 2nd Level은 미리 정의된 옵션에서만 선택 가능합니다

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024년
