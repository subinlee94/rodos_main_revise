package com.java.kr.ac.kangwon.rodos.model.sim;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class Organization {

	@JacksonXmlProperty(localName = xmlTagNames.OWNER)
	private Owner owner;

	@JacksonXmlProperty(localName = xmlTagNames.DEPENDENCY)
	private String dependency;

	@JacksonXmlElementWrapper(useWrapping = false)
	@JacksonXmlProperty(localName = "member")
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private List<OrgMemberType> members = new ArrayList<>();

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

	public List<OrgMemberType> getMembers() {
		return members;
	}

	public void setMembers(List<OrgMemberType> members) {
		this.members = members != null ? members : new ArrayList<>();
	}
}
