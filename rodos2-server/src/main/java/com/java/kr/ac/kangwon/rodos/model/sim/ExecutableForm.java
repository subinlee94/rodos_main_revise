package com.java.kr.ac.kangwon.rodos.model.sim;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public class ExecutableForm {

	@JacksonXmlElementWrapper(localName = "ExeForms")
	@JacksonXmlProperty(localName = "item")
	private List<ExeForm> exeForms;

	@JacksonXmlProperty(localName = "lib")
	private LibURLs lib;

	public ExecutableForm() {
		this.exeForms = new ArrayList<>();
		lib = new LibURLs();
	}

	public List<ExeForm> getExeForms() {
		return this.exeForms;
	}

	public void addExeForm(ExeForm exeForm) {
		if (this.exeForms != null) {
			this.exeForms.add(exeForm);
		} else {
			this.exeForms = new ArrayList<>();
			this.exeForms.add(exeForm);
		}
	}

	public LibURLs getLib() {
		return lib;
	}

	public void setLib(LibURLs lib) {
		this.lib = lib;
	}
}
