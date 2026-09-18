package com.java.kr.ac.kangwon.rodos.model.cim;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class Output extends IOVariable {

	@JacksonXmlElementWrapper(useWrapping = false)
	@JacksonXmlProperty(localName = xmlTagNames.OUTPUT)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private List<Output> outputs;

	@SuppressWarnings("unchecked")
	@JsonIgnore
	@Override
	public List<IOVariable> getClassType() {
		if (outputs != null) {
			List<?> l = outputs;
			return (List<IOVariable>) l;
		}
		return new ArrayList<>();
	}

	@JsonProperty("nestedOutputs")
	public void setOutputs(List<Output> nestedOutputs) {
		this.outputs = nestedOutputs;
	}

	@JsonIgnore
	public List<Output> getOutputs() {
		return this.outputs;
	}

	public void addNestedOutput(Output output) {
		if (this.outputs != null) {
			this.outputs.add(output);
		} else {
			this.outputs = new ArrayList<>();
			this.outputs.add(output);
		}
	}
}
