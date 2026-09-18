package com.java.kr.ac.kangwon.rodos.model.cim;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.Enumerate;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class ServiceMethod {

	@JacksonXmlProperty(isAttribute = true, localName = xmlTagNames.METHOD_NAME)
	private String methodName;

	@JacksonXmlProperty(isAttribute = true, localName = xmlTagNames.DESCRIPTION)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private String description;

	@JacksonXmlElementWrapper(useWrapping = false)
	@JacksonXmlProperty(localName = xmlTagNames.ARG_TYPE)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private List<ArgSpec> argSpecs;

	@JacksonXmlProperty(localName = xmlTagNames.RET_TYPE)
	private String retType;

	@JsonIgnore
	private Enumerate.MOType MOType;

	@JacksonXmlProperty(localName = xmlTagNames.REQ_PROV_TYPE)
	private Enumerate.ReqProvType reqProvType;

	@JacksonXmlProperty(localName = xmlTagNames.MODULE_ID)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private ModuleID moduleID;

	public ServiceMethod() {
		argSpecs = new ArrayList<>();
	}

	public void setMethodName(String name) {
		this.methodName = name;
	}

	public String getMethodName() {
		return methodName;
	}

	public void setMOType(Enumerate.MOType moType) {
		this.MOType = moType;
	}

	@JsonIgnore
	public Enumerate.MOType getMOType() {
		return this.MOType;
	}

	// XML 직렬화를 위한 문자열 변환 getter
	@JacksonXmlProperty(localName = xmlTagNames.MO_TYPE)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	public String getMoType() {
		return MOType != null ? MOType.toString() : null;
	}

	// JSON 역직렬화를 위한 문자열을 Enum으로 변환하는 setter
	@JsonProperty("MOType")
	public void setMoType(String moType) {
		if (moType != null && !moType.trim().isEmpty()) {
			try {
				this.MOType = Enumerate.MOType.valueOf(moType);
			} catch (IllegalArgumentException e) {
				// 잘못된 값이면 null로 설정
				this.MOType = null;
			}
		} else {
			this.MOType = null;
		}
	}

	public void addArgSpec(ArgSpec argSpec) {
		if (this.argSpecs != null) {
			this.argSpecs.add(argSpec);
		} else {
			this.argSpecs = new ArrayList<>();
			this.argSpecs.add(argSpec);
		}
	}

	public List<ArgSpec> getArgSpecs() {
		return this.argSpecs;
	}

	public String getRetType() {
		return retType;
	}

	public void setRetType(String retType) {
		this.retType = retType;
	}

	public Enumerate.ReqProvType getReqProvType() {
		return reqProvType;
	}

	public void setReqProvType(Enumerate.ReqProvType reqProvType) {
		this.reqProvType = reqProvType;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public ModuleID getModuleID() {
		return moduleID;
	}

	public void setModuleID(ModuleID moduleID) {
		this.moduleID = moduleID;
	}

}
