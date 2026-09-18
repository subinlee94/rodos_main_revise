package com.java.kr.ac.kangwon.rodos.model.sim;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

@JacksonXmlRootElement(localName = "item")
public class Protocol {

	@JacksonXmlProperty(localName = "name")
	private String name;

	@JacksonXmlProperty(localName = "layerType")
	private String layerType;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getLayerType() {
		return layerType;
	}

	public void setLayerType(String layerType) {
		this.layerType = layerType;
	}
}
