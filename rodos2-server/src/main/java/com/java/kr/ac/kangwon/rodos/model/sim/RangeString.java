package com.java.kr.ac.kangwon.rodos.model.sim;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public class RangeString {

	@JacksonXmlProperty(isAttribute = true, localName = "min")
	private String min;

	@JacksonXmlProperty(isAttribute = true, localName = "max")
	private String max;

	public RangeString() {
	}

	public RangeString(String min, String max) {
		this.min = min;
		this.max = max;
	}

	public String getMin() {
		return min;
	}

	public void setMin(String min) {
		this.min = min;
	}

	public String getMax() {
		return max;
	}

	public void setMax(String max) {
		this.max = max;
	}
}
