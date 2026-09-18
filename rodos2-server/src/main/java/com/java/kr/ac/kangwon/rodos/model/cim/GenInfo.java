package com.java.kr.ac.kangwon.rodos.model.cim;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class GenInfo {

	@JacksonXmlProperty(localName = xmlTagNames.MODULE_NAME)
	private String moduleName;

	@JacksonXmlProperty(localName = xmlTagNames.MANUFACTURER)
	private String manufacturer;

	@JacksonXmlProperty(localName = xmlTagNames.DESCRIPTION)
	private String description;

	@JacksonXmlProperty(localName = xmlTagNames.EXAMPLES)
	private String examples;

	public GenInfo() {
	}

	public void setModuleName(String moduleName) {
		this.moduleName = moduleName;
	}

	public String getModuleName() {
		return moduleName;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getDescription() {
		return description;
	}

	public void setManufacturer(String manufacturer) {
		this.manufacturer = manufacturer;
	}

	public String getManufacturer() {
		return manufacturer;
	}

	public void setExamples(String examples) {
		this.examples = examples;
	}

	public String getExamples() {
		return examples;
	}
}
