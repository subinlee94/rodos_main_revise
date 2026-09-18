package com.java.kr.ac.kangwon.rodos.model.sim;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public class Modelling {

	@JacksonXmlElementWrapper(localName = "ModelCases")
	@JacksonXmlProperty(localName = "modelCase")
	public List<ModelCase> list_simulationModel;

	public void addSimModel(ModelCase modelCase) {
		if (this.list_simulationModel != null) {
			this.list_simulationModel.add(modelCase);
		} else {
			this.list_simulationModel = new ArrayList<>();
			this.list_simulationModel.add(modelCase);
		}
	}

	public List<ModelCase> getList_simulationModel() {
		return this.list_simulationModel;
	}
}
