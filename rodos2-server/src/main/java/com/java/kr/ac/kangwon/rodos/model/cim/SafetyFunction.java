package com.java.kr.ac.kangwon.rodos.model.cim;

import com.java.kr.ac.kangwon.rodos.model.Enumerate;
import com.java.kr.ac.kangwon.rodos.model.Enumerate.SafetyLevelSIL;

public class SafetyFunction {

	private Enumerate.SafetyType safetyFunctionType;

	private Enumerate.PLSILType validSafetyLevelType;

	private Enumerate.SafetyLevelPL eachSafetyLevelPL;

	private Enumerate.SafetyLevelSIL eachSafetyLevelSIL;

	public String getSafetyFunctionType() {
		return safetyFunctionType.toString();
	}

	public void setSafetyFunctionType(String safetyFunctionType) {
		this.safetyFunctionType = Enum.valueOf(Enumerate.SafetyType.class, safetyFunctionType);
	}

	public String getValidSafetyLevelType() {
		return validSafetyLevelType.toString();
	}

	public void setValidSafetyLevelType(String validSafetyLevelType) {
		this.validSafetyLevelType = Enum.valueOf(Enumerate.PLSILType.class, validSafetyLevelType);
	}

	public String getEachSafetyLevelPL() {
		if (eachSafetyLevelPL != null)
			return eachSafetyLevelPL.toString();
		else
			return "";
	}

	public void setEachSafetyLevelPL(String eachSafetyLevelPL) {
		if (!eachSafetyLevelPL.isEmpty())
			this.eachSafetyLevelPL = Enum.valueOf(Enumerate.SafetyLevelPL.class, eachSafetyLevelPL);
		else
			this.eachSafetyLevelPL = null;
	}

	public String getEachSafetyLevelSIL() {
		if (eachSafetyLevelSIL != null)
			return eachSafetyLevelSIL.toString().split("_")[1];
		else
			return "";
	}

	public void setEachSafetyLevelSIL(String eachSafetyLevelSIL) {
		if (!eachSafetyLevelSIL.isEmpty())
			try {
				this.eachSafetyLevelSIL = SafetyLevelSIL.values()[Integer.parseInt(eachSafetyLevelSIL)];
			} catch (NumberFormatException | IndexOutOfBoundsException ex) {
			}
		else
			this.eachSafetyLevelSIL = null;
	}

}