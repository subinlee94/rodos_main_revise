package com.java.kr.ac.kangwon.rodos.model.cim;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.Enumerate;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class ServiceProfile {

	@JsonIgnore
	private String type; // IDL, XML

	@JacksonXmlProperty(localName = xmlTagNames.ID)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private String ID;

	// id 필드 중복 방지
	@JsonIgnore
	public String getId() {
		return ID;
	}

	@JsonIgnore
	private Enumerate.PhysicalVirtual PVType;

	@JsonIgnore
	private Enumerate.MOType MOType;

	@JsonIgnore
	private String path;

	@JsonIgnore
	private List<NameValue> additionalInfo;

	@JacksonXmlElementWrapper(useWrapping = false)
	@JacksonXmlProperty(localName = xmlTagNames.METHOD_LIST)
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private List<MethodList> methodLists;

	public ServiceProfile() {
		additionalInfo = new ArrayList<>();
		methodLists = new ArrayList<>();
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getType() {
		return type;
	}

	public void setID(String ID) {
		this.ID = ID;
	}

	public String getID() {
		return ID;
	}

	public void setPVType(Enumerate.PhysicalVirtual pvType) {
		this.PVType = pvType;
	}

	@JsonIgnore
	public Enumerate.PhysicalVirtual getPVType() {
		return PVType;
	}

	// XML 직렬화를 위한 문자열 변환 getter
	@JacksonXmlProperty(localName = xmlTagNames.PV_TYPE)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	public String getPvType() {
		return PVType != null ? PVType.toString() : null;
	}

	// JSON 역직렬화를 위한 문자열을 Enum으로 변환하는 setter
	@JsonProperty("PVType")
	public void setPvType(String pvType) {
		if (pvType != null && !pvType.trim().isEmpty()) {
			try {
				this.PVType = Enumerate.PhysicalVirtual.valueOf(pvType);
			} catch (IllegalArgumentException e) {
				// 잘못된 값이면 null로 설정
				this.PVType = null;
			}
		} else {
			this.PVType = null;
		}
	}

	public void addAdditionalInfo(NameValue namevalue) {
		if (this.additionalInfo != null)
			this.additionalInfo.add(namevalue);
		else {
			this.additionalInfo = new ArrayList<>();
			this.additionalInfo.add(namevalue);
		}
	}

	public List<NameValue> getAdditionalInfo() {
		return this.additionalInfo;
	}

	public void setMOType(Enumerate.MOType moType) {
		this.MOType = moType;
	}

	@JsonIgnore
	public Enumerate.MOType getMOType() {
		return MOType;
	}

	// XML 직렬화를 위한 문자열 변환 getter
	@JacksonXmlProperty(localName = xmlTagNames.MO_TYPE)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	public String getMoType() {
		return MOType != null ? MOType.toString() : null;
	}

	// JSON 역직렬화를 위한 문자열을 Enum으로 변환하는 setter
	@JsonProperty("MOType")
	public void setMoType(String moType) {
		if (moType != null && !moType.trim().isEmpty()) {
			try {
				this.MOType = Enumerate.MOType.valueOf(moType);
			} catch (IllegalArgumentException e) {
				// 잘못된 값이면 null로 설정
				this.MOType = null;
			}
		} else {
			this.MOType = null;
		}
	}

	// 기존 serviceMethods와의 호환성을 위한 메서드
	@JsonIgnore
	public List<ServiceMethod> getServiceMethods() {
		List<ServiceMethod> methods = new ArrayList<>();
		if (methodLists != null) {
			for (MethodList methodList : methodLists) {
				if (methodList.getMethod() != null) {
					methods.addAll(methodList.getMethod());
				}
			}
		}
		return methods;
	}

	public void addServiceMethod(ServiceMethod serviceMethod) {
		if (this.methodLists == null) {
			this.methodLists = new ArrayList<>();
		}
		MethodList methodList = new MethodList();
		List<ServiceMethod> methods = new ArrayList<>();
		methods.add(serviceMethod);
		methodList.setMethod(methods);
		this.methodLists.add(methodList);
	}

	public List<MethodList> getMethodLists() {
		return this.methodLists;
	}

	public void setMethodLists(List<MethodList> methodLists) {
		this.methodLists = methodLists;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}
}
