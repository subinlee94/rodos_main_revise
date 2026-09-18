package com.java.kr.ac.kangwon.rodos.model.sim;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class Library {

	@JacksonXmlProperty(localName = xmlTagNames.NAME)
	private String name;

	@JacksonXmlProperty(localName = xmlTagNames.VERSION)
	private String version;

	public Library() {
	}

	public Library(String name, String version) {
		this.name = name;
		this.version = version;
	}

	public String getName() {
		return name;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String mVersion) {
		this.version = mVersion;
	}

	public void setName(String mName) {
		this.name = mName;
	}

}
