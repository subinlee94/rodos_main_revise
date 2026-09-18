package com.java.kr.ac.kangwon.rodos.model.sim;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.cim.Property;

public class ExeForm {

	@JacksonXmlProperty(localName = "ExeFileURL")
	private String exeFileURL;

	@JacksonXmlProperty(localName = "ShellCmd")
	private String shellCmd;

	@JacksonXmlProperty(localName = "properties")
	private List<Property> properties;

	// Jackson 역직렬화를 위한 기본 생성자
	public ExeForm() {
		this.properties = new ArrayList<>();
	}

	public String getExeFileURL() {
		return exeFileURL;
	}

	public void setExeFileURL(String exeFileURL) {
		this.exeFileURL = exeFileURL;
	}

	public String getShellCmd() {
		return shellCmd;
	}

	public void setShellCmd(String shell) {
		this.shellCmd = shell;
	}

	public List<Property> getProperties() {
		return this.properties;
	}

	public void setProperties(List<Property> properties) {
		this.properties = properties;
	}

	public void addProperty(Property property) {
		if (this.properties != null) {
			this.properties.add(property);
		} else {
			this.properties = new ArrayList<>();
			this.properties.add(property);
		}
	}

}
