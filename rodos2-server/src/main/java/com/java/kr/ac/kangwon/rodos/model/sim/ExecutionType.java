package com.java.kr.ac.kangwon.rodos.model.sim;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.Enumerate;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class ExecutionType {

	@JacksonXmlProperty(localName = xmlTagNames.PRIORITY)
	private String priority;

	@JacksonXmlProperty(localName = xmlTagNames.OPTYPE)
	private Enumerate.OpTypes opType;

	/** ISO/WorkSpace IM XML은 {@code opType} (camelCase)를 사용하는 경우가 많다. */
	@JacksonXmlProperty(localName = "opType")
	private String opTypeRaw;

	@JacksonXmlProperty(localName = xmlTagNames.HARD_RT)
	private String hardRT;

	@JacksonXmlProperty(localName = xmlTagNames.TIME_CONSTRAINT)
	private String timeConstraint;

	@JacksonXmlProperty(localName = xmlTagNames.INSTANCE_TYPE)
	private Enumerate.InstanceTypes instanceType;

	public ExecutionType(String priority, Enumerate.OpTypes opType, String hardRT, String timeConstraint,
			Enumerate.InstanceTypes instanceType) {
		this.priority = priority;
		this.opType = opType;
		this.hardRT = hardRT;
		this.timeConstraint = timeConstraint;
		this.instanceType = instanceType;
	}

	public ExecutionType() {
	}

	public Enumerate.OpTypes getOPType() {
		if (opType != null) {
			return opType;
		}
		return parseOpType(opTypeRaw);
	}

	private static Enumerate.OpTypes parseOpType(String raw) {
		if (raw == null || raw.isBlank()) {
			return null;
		}
		String normalized = raw.trim().toUpperCase().replace(" ", "").replace("_", "");
		if ("EVENTDRIVEN".equals(normalized)) {
			return Enumerate.OpTypes.EVENTDRIVEN;
		}
		if ("PERIODIC".equals(normalized)) {
			return Enumerate.OpTypes.PERIODIC;
		}
		if ("NONRT".equals(normalized)) {
			return Enumerate.OpTypes.NONRT;
		}
		try {
			return Enumerate.OpTypes.valueOf(normalized);
		} catch (IllegalArgumentException ignored) {
			return null;
		}
	}

	public Enumerate.InstanceTypes getInstanceType() {
		return instanceType;
	}

	public void setInstanceType(Enumerate.InstanceTypes mInstanceType) {
		this.instanceType = mInstanceType;
	}

	public String getTimeConstraint() {
		return timeConstraint;
	}

	public void setTimeConstraint(String mTimeConstraint) {
		this.timeConstraint = mTimeConstraint;
	}

	public String getHardRT() {
		return hardRT;
	}

	public void setHardRT(String mHardRT) {
		this.hardRT = mHardRT;
	}

	public void setOPType(Enumerate.OpTypes mOPType) {
		this.opType = mOPType;
	}

	public String getPriority() {
		return priority;
	}

	public void setPriority(String priority) {
		this.priority = priority;
	}
}
