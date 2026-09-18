package com.java.kr.ac.kangwon.rodos.model.sim;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public class InfraType {

	@JacksonXmlProperty(localName = "name")
	private String name;

	@JacksonXmlProperty(localName = "version")
	private RangeString version;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public RangeString getVersion() {
		return version;
	}

	public void setVersion(RangeString version) {
		this.version = version;
	}
}
