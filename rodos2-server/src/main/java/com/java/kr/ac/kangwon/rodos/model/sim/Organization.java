package com.java.kr.ac.kangwon.rodos.model.sim;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class Organization {

	@JacksonXmlProperty(localName = xmlTagNames.OWNER)
	private Owner owner;

	@JacksonXmlProperty(localName = xmlTagNames.DEPENDENCY)
	private String dependency;

	public Owner getOwner() {
		return owner;
	}

	public void setOwner(Owner owner) {
		this.owner = owner;
	}

	public String getDependency() {
		return dependency;
	}

	public void setDependency(String dependency) {
		this.dependency = dependency;
	}
}