# Services 페이지 데이터 플로우 오류 및 타입 불일치 분석

## 전체 플로우
1. 사용자 입력 (ServicesPage.js)
2. 상태 관리 (useServicesState.js)
3. 데이터 변환 (treeToServices)
4. 백엔드 전달 (JSON)
5. 백엔드 수신 및 역직렬화
6. XML 생성

## 발견된 문제점

### 1. **심각한 버그: handleSelectNode가 잘못된 데이터 소스 사용**
**위치**: `useServicesState.js` line 177, 200, 222
**문제**: `servicesState.serviceProfiles`를 사용하지만, 실제 데이터는 `tree`에 있음
**영향**: 노드 선택 시 데이터를 제대로 불러오지 못함

```javascript
// 현재 (잘못됨)
const currentProfiles = Array.isArray(servicesState.serviceProfiles) ? servicesState.serviceProfiles : [];
const profile = currentProfiles[path[0]];

// 수정 필요: tree에서 직접 가져와야 함
const profile = getNodeAtPath(tree, [path[0]]);
```

### 2. **심각한 버그: handleAddArgSpec/RemoveArgSpec/RemoveServiceMethod가 잘못된 상태 업데이트**
**위치**: `useServicesState.js` line 364-390, 393-445, 448-489
**문제**: `servicesState`를 직접 수정하지만, 실제로는 `tree`를 업데이트해야 함
**영향**: ArgSpec 추가/삭제, Method 삭제가 제대로 작동하지 않음

```javascript
// 현재 (잘못됨)
setServicesState(s => {
    // servicesState 수정
});

// 수정 필요: tree를 업데이트하고 treeToServices로 변환
const updatedTree = addNodeAtPath(tree, selectedNodePath, newNode);
setTree(updatedTree);
const servicesData = treeToServices(updatedTree);
onChange(servicesData);
```

### 3. **타입 불일치: Enum 필드 변환**
**위치**: 프론트엔드 → 백엔드 전달 시
**문제**: 
- `PVType`: 프론트엔드 문자열 ('Physical', 'Virtual') → 백엔드 `Enumerate.PhysicalVirtual` enum
- `MOType`: 프론트엔드 문자열 ('MANDATORY', 'OPTIONAL') → 백엔드 `Enumerate.MOType` enum  
- `argIO`: 프론트엔드 문자열 ('IN', 'OUT', 'INOUT') → 백엔드 `Enumerate.InOutType` enum
- `reqProvType`: 프론트엔드 문자열 ('REQUIRED', 'PROVIDED') → 백엔드 `Enumerate.ReqProvType` enum

**영향**: 빈 문자열이나 잘못된 값이 오면 역직렬화 실패 가능

### 4. **타입 불일치: moduleID 객체**
**위치**: 프론트엔드 → 백엔드 전달 시
**문제**: 프론트엔드에서 `{ mID: '', iID: '' }` 형태로 전송하지만, 백엔드에서 `ModuleID` 객체로 변환 필요
**영향**: Jackson이 자동 변환하지만, 빈 객체 처리 필요

### 5. **데이터 손실: noOfBasicService/noOfOptionalService**
**위치**: `treeToServices` line 51-52
**문제**: 항상 빈 문자열로 설정됨
**영향**: 사용자가 입력한 값이 전달되지 않음

```javascript
// 현재 (잘못됨)
function treeToServices(tree) {
    return {
        noOfBasicService: '', // 항상 빈 문자열!
        noOfOptionalService: '', // 항상 빈 문자열!
        // ...
    };
}

// 수정 필요: servicesState에서 가져와야 함
```

### 6. **ArgSpec argIO 필드명 불일치**
**위치**: 프론트엔드 → 백엔드
**문제**: 프론트엔드에서 `argIO`로 전송하지만, 백엔드에서도 `argIO`로 받음 (일치함)
**확인**: 백엔드 `ArgSpec.java`에서 `setArgIO` 메서드가 있으므로 문제 없음

### 7. **빈 문자열 Enum 변환 처리**
**위치**: 백엔드 역직렬화 시
**문제**: 빈 문자열이 enum 필드로 전달되면 변환 실패 가능
**해결**: 백엔드에서 빈 문자열을 null로 처리하거나, 프론트엔드에서 빈 값은 전송하지 않음

## 수정 우선순위

1. **최우선**: handleSelectNode, handleAddArgSpec, handleRemoveArgSpec, handleRemoveServiceMethod 수정
2. **높음**: noOfBasicService/noOfOptionalService 데이터 전달 수정
3. **중간**: Enum 필드 빈 문자열 처리
4. **낮음**: moduleID 빈 객체 처리
