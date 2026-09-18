package com.java.kr.ac.kangwon.rodos.model.sim;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public class Communications {

	@JacksonXmlElementWrapper(useWrapping = false) // 래퍼 엘리먼트 없이
	@JacksonXmlProperty(localName = "item") // 각 항목을 "item"으로
	@JsonInclude(JsonInclude.Include.NON_EMPTY) // 빈 리스트는 제외
	private List<Communication> communicationList;

	public Communications() {
		this.communicationList = new ArrayList<>();
	}

	public List<Communication> getCommunicationList() {
		return this.communicationList;
	}

	public void setCommunicationList(List<Communication> communicationList) {
		this.communicationList = communicationList;
	}

	public void addCommunication(Communication communication) {
		if (this.communicationList == null) {
			this.communicationList = new ArrayList<>();
		}
		this.communicationList.add(communication);
	}
}
