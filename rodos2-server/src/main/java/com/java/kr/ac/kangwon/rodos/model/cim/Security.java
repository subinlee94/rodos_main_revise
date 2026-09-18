package com.java.kr.ac.kangwon.rodos.model.cim;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.Enumerate;
import com.java.kr.ac.kangwon.rodos.model.cim.CyberSecurity;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class Security {

	@JacksonXmlProperty(localName = xmlTagNames.CYBER_SECURITY)
	private CyberSecurity cyberSecurity;

	private Enumerate.SecurityType type;

	private Enumerate.CybSecurityLevel value;

	public String getType() {
		return type.toString();
	}

	public void setType(String type) {
		this.type = Enum.valueOf(Enumerate.SecurityType.class, type);
	}

	public void setValue(String overallPhySecurityLevel) {
		this.value = Enum.valueOf(Enumerate.CybSecurityLevel.class, "_" + overallPhySecurityLevel);
	}

	public String getValue() {
		return value.toString().split("_")[1];
	}

}
