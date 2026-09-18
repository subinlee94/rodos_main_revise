package com.java.kr.ac.kangwon.rodos.model.sim;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public class Communication {

	@JacksonXmlProperty(localName = "mostTopProtocol")
	private List<Protocol> mostTopProtocol;

	@JacksonXmlProperty(localName = "underlyingProtocol")
	private Protocol underlyingProtocol;

	public Communication() {
		this.mostTopProtocol = new ArrayList<>();
	}

	public List<Protocol> getMostTopProtocol() {
		return mostTopProtocol;
	}

	public void setMostTopProtocol(List<Protocol> mostTopProtocol) {
		this.mostTopProtocol = mostTopProtocol;
	}

	public Protocol getUnderlyingProtocol() {
		return underlyingProtocol;
	}

	public void setUnderlyingProtocol(Protocol underlyingProtocol) {
		this.underlyingProtocol = underlyingProtocol;
	}

	public void addMostTopProtocol(Protocol mostTopProtocol) {
		if (this.mostTopProtocol == null) {
			this.mostTopProtocol = new ArrayList<>();
		}
		this.mostTopProtocol.add(mostTopProtocol);
	}
}
