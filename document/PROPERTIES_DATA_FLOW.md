# Properties 데이터 흐름 문서

## 개요
이 문서는 UI에서 Properties 태그의 Property를 사용자로부터 입력받아 백엔드로 전송하는 전체 데이터 흐름을 설명합니다.

---

## 1. 사용자 입력 단계 (PropertiesPage.js)

### 1.1 입력 폼
- **위치**: `src/components/wizard/PropertiesPage.js`
- **입력 필드**:
  - Complex Type (select): NONE, CLASS, ARRAY, VECTOR, POINTER
  - Name (input)
  - Type (select + custom input)
  - Unit (select + custom input)
  - Value (input/textarea)
  - Description (textarea)
  - Complex Name (CLASS 타입일 때만)

### 1.2 이벤트 핸들러
- `handlePropertyChange`: 입력 필드 변경 시 `property` 상태 업데이트
- `handleAdd`: 새 Property 추가
- `handleUpdate`: 기존 Property 수정
- `handleRemove`: Property 삭제

---

## 2. 상태 관리 단계 (usePropertiesState.js)

### 2.1 상태 구조
```javascript
// 로컬 상태
const [property, setProperty] = useState({ complexType: 'NONE' });  // 현재 편집 중인 Property
const [propertyNodes, setPropertyNodes] = useState([]);              // TreeNode 배열 (트리 구조)
const [osType, setOsType] = useState({});
const [compilerType, setCompilerType] = useState({});
const [executionTypes, setExecutionTypes] = useState([]);
const [libraries, setLibraries] = useState([]);
const [organization, setOrganization] = useState({});
```

### 2.2 데이터 변환 함수

#### `propertiesToTree(properties)`
- **목적**: 백엔드에서 받은 평면 배열을 TreeNode 트리로 변환
- **입력**: `{ properties: [Property, ...], osType, ... }`
- **출력**: `TreeNode[]`
- **위치**: `usePropertiesState.js:7-10`

#### `createPropertiesData(propertyNodes, ...)`
- **목적**: 전체 Properties 데이터를 ModuleState로 전송할 형식으로 구성
- **입력**: TreeNode 배열, osType, compilerType 등
- **출력**: `{ properties: TreeNode[], osType, compilerType, ... }`
- **위치**: `usePropertiesState.js:15-24`
- **⚠️ 문제점**: propertyNodes가 TreeNode 배열인데, 백엔드는 평면 배열을 기대함

### 2.3 핵심 이벤트 핸들러

#### `handleAdd()` (125-159줄)
1. `property.name` 검증
2. `finalProperty` 생성:
   ```javascript
   const finalProperty = {
       ...property,
       complexType: property.complexType || property.complex || 'NONE',  // 정규화
       ...(property.type === 'custom' && typeInput && { type: typeInput }),
       ...(property.unit === 'custom' && unitInput && { unit: unitInput })
   };
   ```
3. `createTreeNode(finalProperty)` → TreeNode 생성
4. `addNodeAtPath(propertyNodes, selectedNodePath, newNode)` → 트리에 추가
5. `createPropertiesData()` → ModuleState로 전송
6. 입력 필드 초기화

#### `handleUpdate()` (161-189줄)
- `handleAdd()`와 유사하지만 `updateNodeAtPath()` 사용

#### `handleSelectNode()` (105-123줄)
- 트리 노드 선택 시 해당 Property 데이터를 편집 폼에 로드
- **⚠️ 문제점**: `complexType: nodeValue.complexType || ''` → 빈 문자열이 될 수 있음

---

## 3. 상위 상태 관리 (useWizardDialogState.js)

### 3.1 handleStepChange (251-261줄)
```javascript
case 'properties':
    next.properties = {
        properties: newData.properties || [],  // ⚠️ TreeNode 배열이 그대로 저장됨
        osType: newData.osType || {},
        compilerType: newData.compilerType || {},
        executionTypes: newData.executionTypes || [],
        libraries: newData.libraries || [],
        organization: newData.organization || {}
    };
    break;
```

### 3.2 saveModuleToXML (383-453줄)
- `moduleState.properties`를 그대로 백엔드로 전송
- **⚠️ 문제점**: TreeNode 배열이 JSON으로 직렬화되어 전송됨

---

## 4. 백엔드 전송 단계

### 4.1 API 엔드포인트
- **저장**: `POST /api/module/save-xml`
- **위치**: `rodos2-server/src/main/java/.../ModuleController.java:133`

### 4.2 백엔드 기대 형식
```java
// Properties.java
public class Properties {
    @JacksonXmlElementWrapper(useWrapping = false)
    @JacksonXmlProperty(localName = "Property")
    private List<Property> properties;  // 평면 배열 기대
    
    // Property.java
    public class Property {
        private Enumerate.ComplexType complexType;  // Enum 타입
        private String name;
        private String type;
        private String unit;
        private String description;
        private Values values;
        private List<Property> properties;  // 중첩 Property (CLASS 타입)
    }
}
```

---

## 5. 데이터 흐름 다이어그램

```
[사용자 입력]
    ↓
[PropertiesPage.js]
    ↓ handlePropertyChange
[usePropertiesState - property 상태]
    ↓ handleAdd/Update
[TreeNode 생성] → [트리에 추가/수정]
    ↓ createPropertiesData
[ModuleState 업데이트] (TreeNode 배열)
    ↓ handleStepChange
[useWizardDialogState - moduleState]
    ↓ saveModuleToXML
[JSON 직렬화] (TreeNode 객체 포함)
    ↓ POST /api/module/save-xml
[백엔드] (평면 배열 기대, 하지만 TreeNode 객체 수신)
    ↓
[❌ 문제 발생]
```

---

## 6. 발견된 문제점

### ✅ 문제 1: TreeNode 배열이 평면 배열로 변환되지 않음 (수정 완료)
**위치**: `usePropertiesState.js:15-24`
```javascript
// 수정 전
const createPropertiesData = (propertyNodes, ...) => {
    return {
        properties: propertyNodes,  // ⚠️ TreeNode 배열 그대로 전달
        ...
    };
};

// 수정 후
import { treeToFlatArray } from '../utils/tree/TreeUtils';

const createPropertiesData = (propertyNodes, ...) => {
    const flatProperties = treeToFlatArray(propertyNodes);  // ✅ TreeNode → Property[] 변환
    return {
        properties: flatProperties,
        ...
    };
};
```

**문제**: 
- `propertyNodes`는 `TreeNode[]` 타입
- 백엔드는 `Property[]` (평면 배열) 기대
- `treeToFlatArray()` 함수가 있지만 사용되지 않음

**해결 완료**: ✅ `treeToFlatArray()` 함수를 사용하여 TreeNode 배열을 평면 배열로 변환

### ✅ 문제 2: handleSelectNode에서 complexType 빈 문자열 처리 (수정 완료)
**위치**: `usePropertiesState.js:111`
```javascript
// 수정 전
complexType: nodeValue.complexType || '',  // ⚠️ 빈 문자열 가능

// 수정 후
complexType: nodeValue.complexType || nodeValue.complex || 'NONE',  // ✅ 정규화
```

**문제**: 
- `complexType`이 없으면 빈 문자열('')로 설정
- 이후 `handleUpdate`에서 'NONE'으로 정규화되지만, 일관성 부족

**해결 완료**: ✅ `handleSelectNode`에서도 'NONE'으로 정규화하도록 수정

### 🟡 문제 3: 초기화 시 properties 구조 불일치
**위치**: `usePropertiesState.js:59-84`
```javascript
useEffect(() => {
    if (properties && Object.keys(properties).length > 0) {
        const treeData = propertiesToTree(properties);  // properties.properties 기대
        setPropertyNodes(treeData);
        ...
    }
}, []);  // ⚠️ 빈 의존성 배열 - properties 변경 시 업데이트 안 됨
```

**문제**:
- `propertiesToTree`는 `properties.properties` 배열을 기대
- 하지만 초기화 시 `properties` 구조가 다를 수 있음
- 의존성 배열이 비어있어서 properties 변경 시 업데이트 안 됨

### 🟡 문제 4: TreeNode 직렬화 시 불필요한 메타데이터 포함
**위치**: `useWizardDialogState.js:408`
```javascript
properties: moduleState.properties || {},  // TreeNode 객체 포함
```

**문제**:
- TreeNode 객체는 `getValue()`로 실제 Property 데이터만 추출해야 함
- JSON 직렬화 시 TreeNode의 내부 구조가 포함될 수 있음

---

## 7. 권장 수정 사항

### 7.1 즉시 수정 필요 (Critical) - ✅ 완료

1. **`createPropertiesData` 함수 수정** ✅
   - `treeToFlatArray()` 함수를 사용하여 TreeNode 배열을 평면 배열로 변환
   - 백엔드가 기대하는 `Property[]` 형식으로 전송

2. **`handleSelectNode` 수정** ✅
   - `complexType`이 없을 때 'NONE'으로 정규화
   - `handleAdd`, `handleUpdate`와 일관성 유지

### 7.2 개선 권장 (Recommended)

1. **초기화 useEffect 의존성 수정**
   ```javascript
   useEffect(() => {
       if (properties && Object.keys(properties).length > 0) {
           const treeData = propertiesToTree(properties);
           setPropertyNodes(treeData);
           // ...
       }
   }, [properties]);  // properties를 의존성에 추가
   ```

2. **데이터 검증 추가**
   - Property 추가/수정 시 필수 필드 검증
   - complexType 유효성 검사

3. **에러 처리 강화**
   - 백엔드 전송 실패 시 사용자 알림
   - 데이터 변환 실패 시 롤백

---

## 8. 테스트 시나리오

### 시나리오 1: 새 Property 추가
1. Complex Type 선택 (예: CLASS)
2. Name, Type, Unit, Value 입력
3. Add 버튼 클릭
4. ✅ TreeNode로 변환되어 트리에 추가
5. ✅ `createPropertiesData` 호출
6. ❌ TreeNode 배열이 그대로 전송됨 (수정 필요)

### 시나리오 2: Property 수정
1. 트리에서 Property 선택
2. 필드 수정
3. Update 버튼 클릭
4. ✅ 트리 업데이트
5. ❌ TreeNode 배열이 그대로 전송됨 (수정 필요)

### 시나리오 3: Property 삭제
1. 트리에서 Property 선택
2. Remove 버튼 클릭
3. ✅ 트리에서 제거
4. ✅ `createPropertiesData` 호출

---

## 9. 참고 파일 목록

### 프론트엔드
- `src/components/wizard/PropertiesPage.js` - UI 컴포넌트
- `src/hooks/usePropertiesState.js` - 상태 관리 훅
- `src/hooks/useWizardDialogState.js` - 상위 상태 관리
- `src/utils/tree/TreeUtils.js` - 트리 유틸리티
- `src/utils/tree/TreeNode.js` - TreeNode 클래스

### 백엔드
- `rodos2-server/.../model/sim/Properties.java` - Properties 모델
- `rodos2-server/.../model/cim/Property.java` - Property 모델
- `rodos2-server/.../controller/ModuleController.java` - API 컨트롤러

---

## 10. 변경 이력

- 2024-XX-XX: 문서 작성
- 2024-XX-XX: complexType 정규화 수정 (handleAdd, handleUpdate)
- 2024-XX-XX: 문제점 분석 및 문서화
- 2024-XX-XX: **수정 완료**
  - `createPropertiesData`: TreeNode 배열을 평면 배열로 변환하도록 수정
  - `handleSelectNode`: complexType 정규화 추가
