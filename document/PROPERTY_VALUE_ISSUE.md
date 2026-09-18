# Property Value 전달 문제 분석

## 문제 개요
Property의 `value` 필드가 UI에서 입력되어도 백엔드로 전달되지 않는 문제가 발생합니다.

---

## 1. 데이터 흐름 분석

### 1.1 UI 입력 단계 (PropertiesPage.js)

**입력 필드**:
- Line 118: `<input name="value" value={property.value} onChange={handlePropertyChange} />` (NONE 타입)
- Line 125: `<textarea name="value" value={property.value} onChange={handlePropertyChange} />` (ARRAY 타입)
- Line 133: `<input name="value" value={property.value} onChange={handlePropertyChange} />` (CLASS 타입)

**상태 업데이트**:
- `handlePropertyChange` → `setProperty(prev => ({ ...prev, [name]: value }))`
- ✅ `property.value`에 문자열로 저장됨

### 1.2 상태 관리 단계 (usePropertiesState.js)

#### `handleSelectNode` (107-125줄)
```javascript
setProperty({
    complexType: nodeValue.complexType || nodeValue.complex || 'NONE',
    complex: nodeValue.complex || '',
    complexName: nodeValue.complexName || '',
    name: nodeValue.name || '',
    type: nodeValue.type || '',
    unit: nodeValue.unit || '',
    values: nodeValue.values || '',  // ⚠️ 'values'로 로드
    description: nodeValue.description || '',
});
```

**문제점**:
- ❌ `values`로 로드하지만 UI에서는 `value`로 표시
- ❌ `value` 필드가 로드되지 않음

#### `handleAdd` (127-161줄)
```javascript
const finalProperty = {
    ...property,  // property.value는 포함됨
    complexType: property.complexType || property.complex || 'NONE',
    ...(property.type === 'custom' && typeInput && { type: typeInput }),
    ...(property.unit === 'custom' && unitInput && { unit: unitInput })
    // ⚠️ value는 포함되지만 Values 객체로 변환되지 않음
};
```

**문제점**:
- ✅ `property.value`는 `...property`로 포함됨
- ❌ 하지만 백엔드는 `Values` 객체를 기대함

#### `handleUpdate` (163-189줄)
- `handleAdd`와 동일한 문제

### 1.3 백엔드 기대 형식

**Property.java** (Line 37-39):
```java
@JacksonXmlProperty(isAttribute = true)
@JsonInclude(JsonInclude.Include.NON_EMPTY)
private Values values;  // Values 객체 기대
```

**Values.java**:
```java
public class Values {
    private List<String> item;  // { item: [String, ...] } 형식
}
```

**기대 JSON 형식**:
```json
{
  "values": {
    "item": ["value1", "value2", ...]
  }
}
```

**현재 전송 형식**:
```json
{
  "value": "some string"  // ❌ 잘못된 형식
}
```

---

## 2. 발견된 문제점

### 🔴 문제 1: handleSelectNode에서 value 필드 누락
**위치**: `usePropertiesState.js:112-121`
```javascript
setProperty({
    // ...
    values: nodeValue.values || '',  // ⚠️ 'values'로만 로드
    // ❌ value 필드가 없음
});
```

**문제**:
- UI에서 `property.value`로 표시하지만 로드되지 않음
- `values` 객체에서 `value` 문자열을 추출해야 함

### 🔴 문제 2: value를 Values 객체로 변환하지 않음
**위치**: `usePropertiesState.js:132-137`, `167-172`
```javascript
const finalProperty = {
    ...property,  // property.value 포함
    // ❌ Values 객체로 변환하지 않음
};
```

**문제**:
- `property.value`는 문자열
- 백엔드는 `Values` 객체 (`{ item: [String] }`) 기대
- 변환 로직이 없음

### 🟡 문제 3: values와 value 필드 혼용
- 백엔드: `values` (Values 객체)
- UI 입력: `value` (문자열)
- 로드: `values` (객체 또는 문자열)
- 일관성 부족

---

## 3. 해결 방법

### 3.1 handleSelectNode 수정
```javascript
const handleSelectNode = useCallback((path) => {
    setSelectedNodePath(path);
    const node = getNodeAtPath(propertyNodes, path);
    if (node) {
        const nodeValue = node instanceof TreeNode ? node.getValue() : node;
        
        // values 객체에서 value 문자열 추출
        let valueStr = '';
        if (nodeValue.values) {
            if (typeof nodeValue.values === 'object' && nodeValue.values.item) {
                // Values 객체인 경우
                valueStr = Array.isArray(nodeValue.values.item) 
                    ? nodeValue.values.item.join(', ') 
                    : nodeValue.values.item || '';
            } else if (typeof nodeValue.values === 'string') {
                // 문자열인 경우
                valueStr = nodeValue.values;
            }
        } else if (nodeValue.value) {
            // value 필드가 있는 경우
            valueStr = nodeValue.value;
        }
        
        setProperty({
            complexType: nodeValue.complexType || nodeValue.complex || 'NONE',
            complex: nodeValue.complex || '',
            complexName: nodeValue.complexName || '',
            name: nodeValue.name || '',
            type: nodeValue.type || '',
            unit: nodeValue.unit || '',
            value: valueStr,  // ✅ value 필드 추가
            values: nodeValue.values || null,
            description: nodeValue.description || '',
        });
    } else {
        setProperty({ complexType: 'NONE' });
    }
}, [propertyNodes]);
```

### 3.2 handleAdd/Update에서 Values 객체 변환
```javascript
// value 문자열을 Values 객체로 변환하는 헬퍼 함수
const convertValueToValues = (value) => {
    if (!value) return null;
    
    // ARRAY 타입인 경우 JSON 파싱 시도
    if (typeof value === 'string' && value.trim().startsWith('[')) {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                // 2D 배열인 경우 평탄화
                const flattened = parsed.flat(Infinity);
                return { item: flattened.map(String) };
            }
        } catch (e) {
            // 파싱 실패 시 문자열 그대로
        }
    }
    
    // 일반 문자열인 경우
    return { item: [String(value)] };
};

const handleAdd = useCallback(() => {
    if (!property.name) return;

    const finalProperty = {
        ...property,
        complexType: property.complexType || property.complex || 'NONE',
        ...(property.type === 'custom' && typeInput && { type: typeInput }),
        ...(property.unit === 'custom' && unitInput && { unit: unitInput }),
        // ✅ value를 Values 객체로 변환
        ...(property.value && { values: convertValueToValues(property.value) }),
        // value 필드는 제거 (백엔드가 기대하지 않음)
        value: undefined
    };
    // ...
}, [property, typeInput, unitInput, ...]);
```

---

## 4. 수정 우선순위

### 즉시 수정 필요 (Critical)
1. ✅ `handleSelectNode`: `value` 필드 로드 추가
2. ✅ `handleAdd/Update`: `value` → `Values` 객체 변환

### 개선 권장 (Recommended)
3. 필드명 일관성: `value` vs `values` 통일
4. ARRAY 타입 값 파싱 개선
5. 에러 처리 강화

---

## 5. 테스트 시나리오

### 시나리오 1: 일반 Property 추가
1. Name: "testProperty"
2. Type: "int"
3. Value: "123"
4. Add 클릭
5. ✅ `values: { item: ["123"] }` 형식으로 전송되어야 함

### 시나리오 2: ARRAY Property 추가
1. Complex Type: ARRAY
2. Name: "testArray"
3. Value: "[[1,2],[3,4]]"
4. Add 클릭
5. ✅ `values: { item: ["1", "2", "3", "4"] }` 또는 적절한 형식으로 전송

### 시나리오 3: Property 수정
1. 기존 Property 선택
2. Value 수정
3. Update 클릭
4. ✅ 수정된 값이 Values 객체로 전송되어야 함

---

## 6. 참고 파일

- `src/components/wizard/PropertiesPage.js` - UI 입력
- `src/hooks/usePropertiesState.js` - 상태 관리
- `rodos2-server/.../model/cim/Property.java` - 백엔드 모델
- `rodos2-server/.../model/cim/Values.java` - Values 모델
