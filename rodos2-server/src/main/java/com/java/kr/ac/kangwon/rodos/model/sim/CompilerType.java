package com.java.kr.ac.kangwon.rodos.model.sim;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class CompilerType {

	@JacksonXmlProperty(localName = xmlTagNames.OS_NAME)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	public String osName;

	@JacksonXmlProperty(localName = xmlTagNames.VER_RANGE_OS)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private RangeString verRangeOS;

	@JacksonXmlProperty(localName = xmlTagNames.COMPILER_NAME)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private String compilerName;

	@JacksonXmlProperty(localName = xmlTagNames.VER_RANGE_COMPILER)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private RangeString verRangeCompiler;

	@JacksonXmlProperty(localName = xmlTagNames.BIT_N_CPU_ARCH)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private String bitsnCPUarch;

	public String getOSName() {
		return osName;
	}

	public void setOSName(String osName) {
		this.osName = osName;
	}

	public String getBitsnCPUarch() {
		return bitsnCPUarch;
	}

	public void setBitsnCPUarch(String bitsnCPUarch) {
		this.bitsnCPUarch = bitsnCPUarch;
	}

	public RangeString getVerRangeCompiler() {
		return verRangeCompiler;
	}

	public void setVerRangeCompiler(RangeString verRangeCompiler) {
		this.verRangeCompiler = verRangeCompiler;
	}

	public RangeString getVerRangeOS() {
		return verRangeOS;
	}

	public void setVerRangeOS(RangeString verRangeOS) {
		this.verRangeOS = verRangeOS;
	}

	public String getCompilerName() {
		return compilerName;
	}

	public void setCompilerName(String compilerName) {
		this.compilerName = compilerName;
	}
}
