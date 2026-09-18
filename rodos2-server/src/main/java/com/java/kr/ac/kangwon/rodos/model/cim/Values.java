package com.java.kr.ac.kangwon.rodos.model.cim;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class Values {

	@JacksonXmlElementWrapper(useWrapping = false) // 래퍼 엘리먼트 없이
	@JacksonXmlProperty(localName = xmlTagNames.ITEM_LOWER) // 각 항목을 "item"으로
	@JsonInclude(JsonInclude.Include.NON_EMPTY) // 빈 리스트는 직렬화하지 않음
	private List<String> item;

	public void addItem(String item) {
		if (this.item != null)
			this.item.add(item);
		else {
			this.item = new ArrayList<>();
			this.item.add(item);
		}
	}

	public void setItem(List<String> item) {
		this.item = item;
	}

	public List<String> getItem() {
		return item;
	}
}
