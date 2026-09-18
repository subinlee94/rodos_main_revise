package com.java.kr.ac.kangwon.rodos.model.cim;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import com.java.kr.ac.kangwon.rodos.model.sim.ExeForm;
import com.java.kr.ac.kangwon.rodos.model.sim.ExecutableForm;
import com.java.kr.ac.kangwon.rodos.model.sim.Infrastructure;
import com.java.kr.ac.kangwon.rodos.model.sim.Modelling;
import com.java.kr.ac.kangwon.rodos.model.sim.Properties;
import com.java.kr.ac.kangwon.rodos.model.sim.SWIDnType;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

@JacksonXmlRootElement(localName = "Module")
public class CompModule {

	@JacksonXmlProperty(isAttribute = true)
	private String type = "Composite";

	@JsonIgnore
	public boolean isSafety, isSecurity;
	@JsonIgnore
	public boolean isHw, isSw;
	@JsonIgnore
	public boolean isTool;

	@JsonIgnore
	public String[] complexList;

	@JacksonXmlProperty(localName = xmlTagNames.MODULE_NAME)
	private String moduleName;

	@JacksonXmlProperty(localName = xmlTagNames.MANUFACTURES)
	private String manufacturer;

	@JacksonXmlProperty(localName = xmlTagNames.DESCRIPTION)
	private String description;

	@JacksonXmlProperty(localName = xmlTagNames.EXAMPLES)
	private String examples;

	@JacksonXmlProperty(localName = xmlTagNames.ID_N_TYPE)
	private SWIDnType idnType;

	@JacksonXmlProperty(localName = xmlTagNames.PROPERTIES)
	private Properties properties;

	@JacksonXmlProperty(localName = xmlTagNames.IO_VARIABLES)
	private IOVariables ioVariables;

	@JacksonXmlProperty(localName = xmlTagNames.SERVICES)
	private Services services;

	@JacksonXmlProperty(localName = xmlTagNames.INFRA)
	private Infrastructure infrastructure;

	@JacksonXmlProperty(localName = xmlTagNames.SAFE_SECURE)
	private SafeSecure safeSecure;

	@JacksonXmlProperty(localName = xmlTagNames.MODELLING)
	private Modelling modelling;

	@JacksonXmlProperty(localName = xmlTagNames.EXECUTABLE_FORM)
	private ExecutableForm executableForm;

	public CompModule() {
		idnType = new SWIDnType();
		properties = new Properties();
		ioVariables = new IOVariables();
		infrastructure = new Infrastructure();
		executableForm = new ExecutableForm();
	}

	public void setModuleName(String moduleName) {
		this.moduleName = moduleName;
	}

	public String getModuleName() {
		return moduleName;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getDescription() {
		return description;
	}

	public void setManufacturer(String manufacturer) {
		this.manufacturer = manufacturer;
	}

	public String getManufacturer() {
		return manufacturer;
	}

	public void setExamples(String examples) {
		this.examples = examples;
	}

	public String getExamples() {
		return examples;
	}

	public void setInfoList() {
		this.complexList = new String[] { "None", "array", "class", "pointer", "vector" };
	}

	public SWIDnType getIdnType() {
		return idnType;
	}

	public void setIdnType(SWIDnType idnType) {
		this.idnType = idnType;
	}

	public Properties getProperties() {
		return properties;
	}

	public void setProperties(Properties properties) {
		this.properties = properties;
	}

	public IOVariables getIoVariables() {
		return ioVariables;
	}

	public void setIoVariables(IOVariables ioVariables) {
		this.ioVariables = ioVariables;
	}

	public Infrastructure getInfrastructure() {
		return infrastructure;
	}

	public void setInfrastructure(Infrastructure infrastructure) {
		this.infrastructure = infrastructure;
	}

	public Services getServices() {
		return services;
	}

	public void setServices(Services services) {
		this.services = services;
	}

	public SafeSecure getSafeSecure() {
		return safeSecure;
	}

	public void setSafeSecure(SafeSecure safeSecure) {
		this.safeSecure = safeSecure;
	}

	public Modelling getModelling() {
		return modelling;
	}

	public void setModelling(Modelling modelling) {
		this.modelling = modelling;
	}

	public ExecutableForm getExecutableForm() {
		return executableForm;
	}

	public void setExecutableForm(ExecutableForm executableForm) {
		this.executableForm = executableForm;
	}

	/**
	 * XML 문자열을 SoftwareModule 객체로 파싱하는 정적 메서드
	 */
	public static CompModule fromXml(String xmlContent) {
		try {
			XmlMapper xmlMapper = new XmlMapper();
			// 알 수 없는 속성이나 필드가 있어도 파싱을 계속 진행하도록 설정
			xmlMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,
					false);
			xmlMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES,
					false);
			xmlMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES,
					false);
			xmlMapper.configure(
					com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT, true);

			CompModule module = xmlMapper.readValue(xmlContent, CompModule.class);

			// ExecutableForm 파싱 결과만 집중적으로 로그 출력
			System.out.println("=== ExecutableForm 파싱 결과 ===");
			System.out.println("ExecutableForm: " + (module.getExecutableForm() != null ? "있음" : "없음"));
			if (module.getExecutableForm() != null) {
				System.out.println("  - ExeForms: " + (module.getExecutableForm().getExeForms() != null
						? module.getExecutableForm().getExeForms().size() + "개"
						: "null"));
				if (module.getExecutableForm().getExeForms() != null) {
					System.out.println("  - ExeForms 리스트 상태: "
							+ (module.getExecutableForm().getExeForms().isEmpty() ? "비어있음" : "데이터 있음"));
				}
				if (module.getExecutableForm().getExeForms() != null
						&& !module.getExecutableForm().getExeForms().isEmpty()) {
					ExeForm firstExeForm = module.getExecutableForm().getExeForms().get(0);
					System.out.println("  - 첫 번째 ExeForm:");
					System.out.println("    * ExeFileURL: " + firstExeForm.getExeFileURL());
					System.out.println("    * ShellCmd: " + firstExeForm.getShellCmd());
				}
			}
			System.out.println("===============================");

			return module;
		} catch (Exception e) {
			System.err.println("XML 파싱 실패: " + e.getMessage());
			e.printStackTrace();
			return null;
		}
	}

	/**
	 * ExecutableForm에서 첫 번째 ExeForm의 ShellCmd를 가져오는 메서드
	 * 
	 * @JsonIgnore로 XML 직렬화에서 제외
	 */
	@JsonIgnore
	public String getExecutableCommand() {
		if (executableForm != null && executableForm.getExeForms() != null && !executableForm.getExeForms().isEmpty()) {
			ExeForm firstExeForm = executableForm.getExeForms().get(0);
			return firstExeForm.getShellCmd();
		}
		return "default-command";
	}

	/**
	 * ExecutableForm에서 첫 번째 ExeForm의 ExeFileURL을 가져오는 메서드
	 * 
	 * @JsonIgnore로 XML 직렬화에서 제외
	 */
	@JsonIgnore
	public String getExecutableImage() {
		if (executableForm != null && executableForm.getExeForms() != null && !executableForm.getExeForms().isEmpty()) {
			ExeForm firstExeForm = executableForm.getExeForms().get(0);
			return firstExeForm.getExeFileURL();
		}
		return "default-image:latest";
	}
}
