package com.java.kr.ac.kangwon.rodos.model.cim;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class SwAspects {

	private List<ModuleID> moduleIDs;

	public SwAspects() {
		this.moduleIDs = new ArrayList<>();
	}

	@JsonCreator(mode = JsonCreator.Mode.DELEGATING)
	public SwAspects(List<ModuleID> moduleIDs) {
		this.moduleIDs = moduleIDs != null ? moduleIDs : new ArrayList<>();
	}

	@JacksonXmlElementWrapper(useWrapping = false)
	@JacksonXmlProperty(localName = xmlTagNames.MODULE_ID_TAG)
	public List<ModuleID> getModuleIDs() {
		return moduleIDs;
	}

	public void setModuleIDs(List<ModuleID> moduleIDs) {
		this.moduleIDs = moduleIDs != null ? moduleIDs : new ArrayList<>();
	}

	public void add(ModuleID moduleID) {
		if (this.moduleIDs == null) {
			this.moduleIDs = new ArrayList<>();
		}
		this.moduleIDs.add(moduleID);
	}
}
