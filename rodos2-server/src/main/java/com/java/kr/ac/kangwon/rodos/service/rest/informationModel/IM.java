package com.java.kr.ac.kangwon.rodos.service.rest.informationModel;

import com.fasterxml.jackson.annotation.JsonProperty;

public class IM {
	@JsonProperty("module_name")
	private String module_name;

	@JsonProperty("xml_file")
	private String xml_file;

	@JsonProperty("classification")
	private String classification;

	@JsonProperty("module_id")
	private String module_id;

	public enum Type {
		RECOGNITION, CONTROLLER,ROBOT, SOFTWARE
	}

	// Jackson 역직렬화를 위한 기본 생성자
	public IM() {
	}

	public IM(String module_name) {
		this.module_name = module_name;
	}

	public IM(String module_name, String module_id, String xml_file, Type type) {
		this.module_name = module_name;
		this.module_id = module_id;
		this.xml_file = xml_file;

		if (type.equals(Type.RECOGNITION))
			this.classification = "ai";
		else if (type.equals(Type.CONTROLLER))
			this.classification = "controller";
		else if (type.equals(Type.ROBOT))
			this.classification = "robot";
		else
			this.classification = "software";
	}

	public String getModuleName() {
		return module_name;
	}

	public void setModuleName(String module_name) {
		this.module_name = module_name;
	}

	public String getXmlString() {
		return xml_file;
	}

	public void setXmlString(String xml_file) {
		this.xml_file = xml_file;
	}

	public String getClassification() {
		return classification;
	}

	public void setClassification(String classification) {
		this.classification = classification;
	}

	public String getModuleID() {
		return module_id;
	}

	public void setModuleID(String module_id) {
		this.module_id = module_id;
	}
}
