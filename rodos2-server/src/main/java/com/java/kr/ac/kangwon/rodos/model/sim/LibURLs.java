package com.java.kr.ac.kangwon.rodos.model.sim;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public class LibURLs {
	@JacksonXmlProperty(localName = "urlnPaths")
	public List<String> urlnPaths;

	public LibURLs() {
		urlnPaths = new ArrayList<>();
	}

	public List<String> getUrlnPaths() {
		return this.urlnPaths;
	}

	public void addUrlnPath(String urlnPath) {
		if (this.urlnPaths != null) {
			this.urlnPaths.add(urlnPath);
		} else {
			this.urlnPaths = new ArrayList<>();
			this.urlnPaths.add(urlnPath);
		}
	}
}