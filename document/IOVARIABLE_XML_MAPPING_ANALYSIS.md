# IOVariable XML 매핑 분석 및 문제점

## 1. XML 매핑 구조 설명

### 1.1 전체 구조
```
IOVariables (최상위 컨테이너)
  └── Inputs (List<Input>)
      └── Input (각 항목)
          ├── [속성들: name, className, complex, type, value, unit, description, inDataType]
          ├── value (Values 객체)
          │   └── item (List<String>)
          └── Input (중첩된 Input 리스트)
```

### 1.2 IOVariable.java의 XML 매핑

#### 현재 설정:
```java
@JacksonXmlProperty(isAttribute = true, localName = "name")
private String name;

@JacksonXmlProperty(isAttribute = true, localName = "className")
private String clsName;

@JacksonXmlProperty(isAttribute = true, localName = "complex")
private String complex;

@JacksonXmlProperty(isAttribute = true, localName = "type")
private String type;

@JacksonXmlProperty(isAttribute = true, localName = "value")  // ❌ 문제!
private Values values;

@JacksonXmlProperty(isAttribute = true)  // ❌ localName 없음
private String unit;

@JacksonXmlProperty(isAttribute = true, localName = "description")
private String description;

@JacksonXmlProperty(isAttribute = true)  // ❌ localName 없음
private String inDataType;

@JacksonXmlProperty(isAttribute = true, localName = "additionalInfo")  // ❌ 문제!
private List<NameValue> additionalInfo;
```

#### 예상 XML 출력:
```xml
<Input name="test" className="TestClass" complex="NONE" type="string" 
       value="???" unit="none" description="test" inDataType="string">
  <!-- value와 additionalInfo는 attribute로 출력될 수 없음! -->
</Input>
```

## 2. 발견된 문제점

### ❌ 문제 1: `values` 필드가 `isAttribute = true`로 설정됨

**문제:**
- `Values`는 복잡한 객체(`List<String> item`을 포함)인데 `isAttribute = true`로 설정되어 있습니다.
- XML attribute는 단순 문자열만 가능하므로, 복잡한 객체는 attribute로 직렬화할 수 없습니다.

**현재 코드:**
```java
@JacksonXmlProperty(isAttribute = true, localName = "value")
private Values values;
```

**예상 결과:**
- Jackson이 `Values` 객체를 attribute로 변환하려고 시도하지만 실패하거나, 잘못된 XML이 생성됩니다.
- 올바른 XML은 다음과 같아야 합니다:
```xml
<Input name="test">
  <value>
    <item>aa</item>
  </value>
</Input>
```

**해결 방법:**
```java
@JacksonXmlProperty(localName = "value")  // isAttribute 제거
@JsonInclude(JsonInclude.Include.NON_NULL)
private Values values;
```

---

### ❌ 문제 2: `additionalInfo` 필드가 `isAttribute = true`로 설정됨

**문제:**
- `List<NameValue>`는 복잡한 리스트 객체인데 `isAttribute = true`로 설정되어 있습니다.
- 리스트는 attribute로 직렬화할 수 없습니다.

**현재 코드:**
```java
@JacksonXmlProperty(isAttribute = true, localName = "additionalInfo")
private List<NameValue> additionalInfo;
```

**해결 방법:**
```java
@JacksonXmlProperty(localName = "additionalInfo")  // isAttribute 제거
@JsonInclude(JsonInclude.Include.NON_NULL)
private List<NameValue> additionalInfo;
```

---

### ❌ 문제 3: `unit`과 `inDataType`에 `localName`이 없음

**문제:**
- `unit`과 `inDataType` 필드에 `localName`이 지정되지 않아서 필드명 그대로 사용됩니다.
- 일관성을 위해 명시적으로 지정하는 것이 좋습니다.

**현재 코드:**
```java
@JacksonXmlProperty(isAttribute = true)  // localName 없음
private String unit;

@JacksonXmlProperty(isAttribute = true)  // localName 없음
private String inDataType;
```

**해결 방법:**
```java
@JacksonXmlProperty(isAttribute = true, localName = "unit")
@JsonInclude(JsonInclude.Include.NON_NULL)
private String unit;

@JacksonXmlProperty(isAttribute = true, localName = "inDataType")
@JsonInclude(JsonInclude.Include.NON_NULL)
private String inDataType;
```

---

### ❌ 문제 4: IOVariables.java의 필드명과 getter 불일치

**문제:**
- 필드명: `Inputs` (대문자)
- Getter: `getInputs()` (소문자)
- 필드에 `@JacksonXmlProperty(localName = "Inputs")`가 있지만, Jackson은 getter 이름을 기준으로 XML 엘리먼트 이름을 결정할 수 있어서 `<inputs>`와 `<Inputs>`가 중복 생성될 수 있습니다.

**현재 코드:**
```java
@JacksonXmlProperty(localName = "Inputs")
private List<Input> Inputs;

public List<Input> getInputs() {  // 소문자로 시작
    return this.Inputs;
}
```

**해결 방법:**
- Getter에 `@JacksonXmlProperty`를 적용:
```java
@JacksonXmlElementWrapper(useWrapping = false)
@JsonInclude(JsonInclude.Include.NON_NULL)
private List<Input> Inputs;

@JacksonXmlProperty(localName = "Inputs")  // getter에 어노테이션 추가
public List<Input> getInputs() {
    return this.Inputs;
}
```

---

### ❌ 문제 5: IOVariables.java의 오타

**문제:**
- 19줄에 "Iutputs" → "Outputs"로 수정 필요

**현재 코드:**
```java
@JacksonXmlProperty(localName = "Iutputs")  // 오타!
private List<Output> Outputs;
```

**해결 방법:**
```java
@JacksonXmlProperty(localName = "Outputs")  // 수정
private List<Output> Outputs;
```

---

## 3. 올바른 XML 출력 예시

### 수정 후 예상 XML:
```xml
<IOVariables>
  <Inputs>
    <Input name="test" className="TestClass" complex="NONE" type="string" 
           unit="none" description="test" inDataType="string">
      <value>
        <item>aa</item>
        <item>bb</item>
      </value>
      <Input name="nested" type="string">
        <value>
          <item>nested_value</item>
        </value>
      </Input>
    </Input>
  </Inputs>
</IOVariables>
```

---

## 4. 수정 권장 사항 요약

1. **IOVariable.java:**
   - `values` 필드: `isAttribute = true` 제거
   - `additionalInfo` 필드: `isAttribute = true` 제거
   - `unit` 필드: `localName = "unit"` 추가
   - `inDataType` 필드: `localName = "inDataType"` 추가

2. **IOVariables.java:**
   - Getter 메서드에 `@JacksonXmlProperty` 추가
   - "Iutputs" → "Outputs" 오타 수정
