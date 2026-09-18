package com.java.kr.ac.kangwon.rodos.model.cim;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.Enumerate;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class Property {

	@JacksonXmlProperty(isAttribute = true)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private Enumerate.ComplexType complexType;

	@JacksonXmlProperty(isAttribute = true)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private String name;

	@JacksonXmlProperty(isAttribute = true)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private String complexName;

	@JacksonXmlProperty(isAttribute = true)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private String type;

	@JacksonXmlProperty(isAttribute = true)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private String unit;

	@JacksonXmlProperty(isAttribute = true)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private String description;

	@JacksonXmlProperty(localName = xmlTagNames.VALUE)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private String value;

	@JacksonXmlProperty(localName = "values")
	@JsonInclude(JsonInclude.Include.NON_NULL)
	@Deprecated
	private Values values;

	// Property 리스트를 XML에서 처리
	@JacksonXmlElementWrapper(useWrapping = false) // 래퍼 엘리먼트 없이
	@JacksonXmlProperty(localName = xmlTagNames.PROPERTY) // 각 항목을 "Property"로
	@JsonInclude(JsonInclude.Include.NON_EMPTY) // 빈 리스트는 제외
	private List<Property> properties;

	public Property() {
		this.complexType = Enumerate.ComplexType.NONE;
		this.values = null; // 빈 Values는 null로 설정하여 직렬화되지 않도록 함
		this.value = "";
	}

	public List<Property> getProperties() {
		return properties;
	}

	public void setProperties(List<Property> properties) {
		this.properties = properties;
	}

	public void addProperty(Property property) {
		if (this.properties != null)
			this.properties.add(property);
		else {
			this.properties = new ArrayList<>();
			this.properties.add(property);
		}
	}

	public void setValues(Values values) {
		// 빈 Values 객체는 null로 설정하여 직렬화되지 않도록 함
		if (values != null && values.getItem() != null && !values.getItem().isEmpty()) {
			this.values = values;
		} else {
			this.values = null;
		}
	}

	public Values getValues() {
		return values;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getType() {
		return type;
	}

	public void setUnit(String unit) {
		this.unit = unit;
	}

	public String getUnit() {
		return unit;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getDescription() {
		return description;
	}

	public String getComplexName() {
		return complexName;
	}

	public void setComplexName(String complexName) {
		this.complexName = complexName;
	}

	public String getComplexType() {
		return complexType.toString();
	}

	@Override
	public String toString() {
		String property;
		if (complexName == null)
			property = name + ", " + type + ", " + description;
		else
			property = "(" + complexName + ") " + name + ", " + type + ", " + description;
		return property;
	}

	public void setComplexType(String complexType) {
		try {
			this.complexType = Enum.valueOf(Enumerate.ComplexType.class, complexType.toUpperCase());
		} catch (IllegalArgumentException e) {
			this.complexType = Enumerate.ComplexType.NONE;
		}
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}
}