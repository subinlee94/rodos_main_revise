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

public class ArgSpec {

	@JacksonXmlProperty(isAttribute = true, localName = xmlTagNames.ARG_TYPE_ATTR)
	private String argType;

	@JacksonXmlProperty(isAttribute = true, localName = xmlTagNames.VALUE_NAME)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private String argName;

	@JacksonXmlProperty(isAttribute = true, localName = xmlTagNames.INOUT)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private Enumerate.InOutType argIO;

	@JacksonXmlElementWrapper(useWrapping = false)
	@JacksonXmlProperty(localName = xmlTagNames.ARG_TYPE)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private List<ArgSpec> argSpecs;

	public ArgSpec() {
		argSpecs = new ArrayList<>();
	}

	public void setArgType(String argType) {
		this.argType = argType;
	}

	public String getArgType() {
		return argType;
	}

	public void setArgName(String argName) {
		this.argName = argName;
	}

	public String getArgName() {
		return argName;
	}

	public void setArgIO(Enumerate.InOutType argIO) {
		this.argIO = argIO;
	}

	public Enumerate.InOutType getArgIO() {
		return argIO;
	}

	@JsonProperty("argSpecs")
	public void setArgSpecs(List<ArgSpec> argSpecs) {
		this.argSpecs = argSpecs;
	}

	@JsonIgnore
	public List<ArgSpec> getArgSpecs() {
		return argSpecs;
	}

	public void addArgSpec(ArgSpec argSpec) {
		if (this.argSpecs != null) {
			this.argSpecs.add(argSpec);
		} else {
			this.argSpecs = new ArrayList<>();
			this.argSpecs.add(argSpec);
		}
	}
}
