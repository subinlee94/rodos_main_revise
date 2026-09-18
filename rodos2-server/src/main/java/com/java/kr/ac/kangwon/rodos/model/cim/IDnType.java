package com.java.kr.ac.kangwon.rodos.model.cim;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class IDnType {

	@JacksonXmlProperty(isAttribute = true)
	protected String type;

	@JacksonXmlProperty(localName = xmlTagNames.MODULE_ID_TAG)
	@JsonProperty("moduleID")
	protected ModuleID moduleID;

	@JacksonXmlProperty(localName = "swAspects")
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	@JsonIgnore
	private SwAspects swAspects;

	@JacksonXmlProperty(localName = "hwAspects")
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	@JsonIgnore
	private HwAspects hwAspects;

	public IDnType() {
		this.swAspects = new SwAspects();
		this.hwAspects = new HwAspects();
	}

	@JsonProperty("swAspects")
	public SwAspects getSwAspects() {
		return swAspects;
	}

	@JsonProperty("swAspects")
	public void setSwAspects(SwAspects swAspects) {
		this.swAspects = swAspects;
	}

	@JsonProperty("hwAspects")
	public HwAspects getHwAspects() {
		return hwAspects;
	}

	@JsonProperty("hwAspects")
	public void setHwAspects(HwAspects hwAspects) {
		this.hwAspects = hwAspects;
	}

	@JacksonXmlProperty(localName = xmlTagNames.INFORMATION_MODEL_VERSION)
	protected String informationModelVersion;

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public ModuleID getModuleID() {
		return moduleID;
	}

	public void setModuleID(ModuleID moduleID) {
		this.moduleID = moduleID;
	}

	public String getInformationModelVersion() {
		return informationModelVersion;
	}

	public void setInformationModelVersion(String informationModelVersion) {
		this.informationModelVersion = informationModelVersion;
	}
}
