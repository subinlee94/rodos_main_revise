package com.java.kr.ac.kangwon.rodos.model.cim;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class IOVariables {

	@JsonIgnore
	private List<Input> Inputs;

	@JsonIgnore
	private List<Output> Outputs;

	@JsonIgnore
	private List<InOut> InOuts;

	public void setInputs(List<Input> inputs) {
		this.Inputs = inputs;
	}

	public void setOutputs(List<Output> outputs) {
		this.Outputs = outputs;
	}

	public void setInOuts(List<InOut> inouts) {
		this.InOuts = inouts;
	}

	public void addInput(Input input) {
		if (this.Inputs != null)
			this.Inputs.add(input);
		else {
			this.Inputs = new ArrayList<>();
			this.Inputs.add(input);
		}
	}

	@JacksonXmlElementWrapper(localName = xmlTagNames.INPUTS)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	@JacksonXmlProperty(localName = xmlTagNames.INPUT)
	public List<Input> getInputs() {
		return this.Inputs;
	}

	public void addOutput(Output output) {
		if (this.Outputs != null)
			this.Outputs.add(output);
		else {
			this.Outputs = new ArrayList<>();
			this.Outputs.add(output);
		}
	}

	@JacksonXmlElementWrapper(localName = xmlTagNames.OUTPUTS)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	@JacksonXmlProperty(localName = xmlTagNames.OUTPUT)
	public List<Output> getOutputs() {
		return this.Outputs;
	}

	public void addInOut(InOut inOut) {
		if (this.InOuts != null)
			this.InOuts.add(inOut);
		else {
			this.InOuts = new ArrayList<>();
			this.InOuts.add(inOut);
		}
	}

	@JacksonXmlElementWrapper(localName = xmlTagNames.IN_OUTS)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	@JacksonXmlProperty(localName = xmlTagNames.IN_OUT)
	public List<InOut> getInOuts() {
		return this.InOuts;
	}
}