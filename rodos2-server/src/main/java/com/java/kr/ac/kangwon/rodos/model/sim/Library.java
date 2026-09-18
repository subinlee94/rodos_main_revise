package com.java.kr.ac.kangwon.rodos.model.sim;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class Library {

	@JacksonXmlProperty(localName = xmlTagNames.NAME)
	private String name;

	@JacksonXmlProperty(isAttribute = true, localName = xmlTagNames.NAME)
	private String nameAttr;

	@JacksonXmlProperty(localName = xmlTagNames.VERSION)
	private String version;

	@JacksonXmlProperty(isAttribute = true, localName = xmlTagNames.VERSION)
	private String versionAttr;

	public Library() {
	}

	public Library(String name, String version) {
		this.name = name;
		this.version = version;
	}

	public String getName() {
		if (name != null && !name.isBlank()) {
			return name;
		}
		return nameAttr;
	}

	public String getVersion() {
		if (version != null && !version.isBlank()) {
			return version;
		}
		return versionAttr;
	}

	public void setVersion(String mVersion) {
		this.version = mVersion;
	}

	public void setName(String mName) {
		this.name = mName;
	}

}
