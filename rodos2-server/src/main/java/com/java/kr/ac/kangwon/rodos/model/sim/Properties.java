package com.java.kr.ac.kangwon.rodos.model.sim;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.cim.Property;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class Properties {

	@JacksonXmlElementWrapper(useWrapping = false)
	@JacksonXmlProperty(localName = xmlTagNames.PROPERTY)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private List<Property> properties;

	@JacksonXmlProperty(localName = xmlTagNames.OS_TYPE)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	public OSType osType;

	@JacksonXmlProperty(localName = xmlTagNames.COMPILER_TYPE)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	public CompilerType compilerType;

	/** 인수인계(4.6): legacy {@code compiler}와 새 {@code compilerType} XML을 모두 읽는다. */
	@JacksonXmlProperty(localName = "compilerType")
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private CompilerType compilerTypeAlt;

	@JacksonXmlElementWrapper(localName = xmlTagNames.EXECUTION_TYPES)
	@JacksonXmlProperty(localName = xmlTagNames.ITEM_UPPER)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	public List<ExecutionType> executionTypes;

	@JacksonXmlElementWrapper(localName = xmlTagNames.LIBRARIES)
	@JacksonXmlProperty(localName = xmlTagNames.LIBRARY)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private List<Library> libraries;

	/** WorkSpace IM XML은 {@code Libraries/Item} 형식을 사용한다. */
	@JacksonXmlElementWrapper(localName = xmlTagNames.LIBRARIES)
	@JacksonXmlProperty(localName = xmlTagNames.ITEM_UPPER)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private List<Library> libraryItems;

	@JacksonXmlProperty(localName = xmlTagNames.ORGANIZATION)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private Organization organization;

	// Prevent duplicate serialization
	@JsonIgnore
	public OSType ostype;

	public Properties() {
		properties = new ArrayList<>();
		osType = new OSType();
		compilerType = new CompilerType();
		executionTypes = new ArrayList<>();
		libraries = new ArrayList<>();
	}

	public void addProperty(Property property) {
		if (this.properties != null)
			this.properties.add(property);
		else {
			this.properties = new ArrayList<>();
			this.properties.add(property);
		}
	}

	public void setProperties(List<Property> properties) {
		this.properties = properties;
	}

	public List<Property> getProperties() {
		// 모든 Property 반환 (NONE 타입도 포함)
		if (this.properties == null)
			return new ArrayList<>();
		return this.properties;
	}

	public List<Library> getLibraries() {
		List<Library> merged = new ArrayList<>();
		if (libraries != null) {
			merged.addAll(libraries);
		}
		if (libraryItems != null) {
			for (Library library : libraryItems) {
				if (library != null && library.getName() != null && !library.getName().isBlank()) {
					merged.add(library);
				}
			}
		}
		if (merged.isEmpty() && libraries != null) {
			return libraries;
		}
		return merged;
	}

	public Organization getOrganization() {
		return organization;
	}

	public void setOrganization(Organization organization) {
		this.organization = organization;
	}

	public void addLibrary(Library library) {
		if (this.libraries != null)
			this.libraries.add(library);
		else {
			this.libraries = new ArrayList<>();
			this.libraries.add(library);
		}
	}

	public void addExecutionType(ExecutionType executionType) {
		if (this.executionTypes != null)
			this.executionTypes.add(executionType);
		else {
			this.executionTypes = new ArrayList<>();
			this.executionTypes.add(executionType);
		}
	}

	public List<ExecutionType> getExecutionTypes() {
		return executionTypes;
	}

	public void setExecutionTypes(List<ExecutionType> executionTypes) {
		this.executionTypes = executionTypes;
	}

	public CompilerType getCompilerType() {
		if (compilerTypeAlt != null && hasCompilerValues(compilerTypeAlt)) {
			return compilerTypeAlt;
		}
		return compilerType;
	}

	private static boolean hasCompilerValues(CompilerType compiler) {
		if (compiler == null) {
			return false;
		}
		if (compiler.osName != null && !compiler.osName.isBlank()) {
			return true;
		}
		if (compiler.getCompilerName() != null && !compiler.getCompilerName().isBlank()) {
			return true;
		}
		if (compiler.getVerRangeOS() != null
				&& (compiler.getVerRangeOS().getMin() != null || compiler.getVerRangeOS().getMax() != null)) {
			return true;
		}
		if (compiler.getVerRangeCompiler() != null
				&& (compiler.getVerRangeCompiler().getMin() != null
						|| compiler.getVerRangeCompiler().getMax() != null)) {
			return true;
		}
		return compiler.getBitsnCPUarch() != null && !compiler.getBitsnCPUarch().isBlank();
	}

	public void setCompilerType(CompilerType compilerType) {
		this.compilerType = compilerType;
	}

	@JsonIgnore
	public OSType getOSType() {
		return osType;
	}

	public void setOSType(OSType osType) {
		this.osType = osType;
	}
}
