package com.java.kr.ac.kangwon.rodos.model.cim;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class MethodList {
	@JsonFormat(with = JsonFormat.Feature.ACCEPT_SINGLE_VALUE_AS_ARRAY)
	@JacksonXmlElementWrapper(useWrapping = false)
	@JacksonXmlProperty(localName = xmlTagNames.METHOD)
	private List<ServiceMethod> method;

	public List<ServiceMethod> getMethod() {
		return method;
	}

	public void setMethod(List<ServiceMethod> method) {
		this.method = method;
	}
}
