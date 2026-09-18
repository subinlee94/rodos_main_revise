package com.java.kr.ac.kangwon.rodos.model.cim;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.java.kr.ac.kangwon.rodos.model.Enumerate;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;


public abstract class IOVariable {
	@JsonIgnore
	private Enumerate.ComplexType complexType;

	@JacksonXmlProperty(isAttribute = true,localName = "name")
	private String name;
	
	@JacksonXmlProperty(isAttribute = true,localName = "className")
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private String clsName;
	
	@JacksonXmlProperty(isAttribute = true,localName = "complex")
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private String complex;

	@JacksonXmlProperty(isAttribute = true,localName = "type")
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private String type;

	@JacksonXmlProperty(isAttribute = true, localName = "unit")
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private String unit;

	@JacksonXmlProperty(isAttribute = true,localName = "description")
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private String description;

	@JacksonXmlProperty(isAttribute = true, localName = "inDataType")
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private String inDataType;

	@JacksonXmlProperty(localName = xmlTagNames.ADDITIONAL_INFO)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private List<NameValue> additionalInfo;

	@JsonInclude(JsonInclude.Include.NON_NULL)
	public abstract List<IOVariable> getClassType();

	public void setName(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public String getComplex() {
		return complex;
	}

	public void setComplex(String mComplex) {
		this.complex = mComplex;
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

	public String getClassName() {
		return clsName;
	}

	public void setClassName(String clsName) {
		this.clsName = clsName;
	}

	public String getInDataType() {
		return this.inDataType;
	}

	public void setInDataType(String inDataType) {
		this.inDataType = inDataType;
	}

	public void setComplexType(String complexType) {
		try {
			this.complexType = Enum.valueOf(Enumerate.ComplexType.class, complexType.toUpperCase());
		} catch (IllegalArgumentException e) {
			this.complexType = Enumerate.ComplexType.NONE;
		}
	}

	public String getComplexType() {
		return this.complexType.toString();
	}

	public void addAdditionalInfo(NameValue namevalue) {
		if (this.additionalInfo != null)
			this.additionalInfo.add(namevalue);
		else {
			this.additionalInfo = new ArrayList<>();
			this.additionalInfo.add(namevalue);
		}
	}

	public List<NameValue> getAdditionalInfo() {
		return this.additionalInfo;
	}
}