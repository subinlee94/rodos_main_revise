package com.java.kr.ac.kangwon.rodos.model;

public class Enumerate {

	public enum DependencyType {
		OWNER, OWNED, OWNEROWNED, NONE
	}

	public enum ConnectorType {
		USB, IEEE1394, D_SUB, RIBBON, EDGE, PS2, DIN, RJ, MT, MPO, RS, ACPOWER, DCPOWER, BNC, MTYPE, NTYPE, TNCTYPE,
		FTYPE, SMATYPE, WTB
	}

	public enum MemType {
		NVMEM, VMEM
	}

	public enum NoBit {
		BIT64, BIT32, BIT16
	}

	public enum OriginType {
		LT, LB, RT, RB, CENTER, LBF, LTF, RBF, RTF, LBB, LTB, RBB, RTB, CENTER3
	}

	public enum ReqType {
		PACKAGE, LIBRARY, MIDDLEWARE
	}

	public enum ComplexType {
		NONE, CLASS, ARRAY, VECTOR, POINTER
	}

	public enum InstanceTypes {
		Singleton, MultitionStatic, MultitionComm
	}

	public enum OpTypes {
		PERIODIC, EVENTDRIVEN, NONRT
	}

	public enum ExeStatus {
		CREATED, IDLE, EXECUTING, DESTRUCTED, ERROR
	}

	public enum MOType {
		MANDATORY, OPTIONAL;
	}

	public enum InOutType {
		IN, OUT, INOUT
	}

	public enum PhysicalVirtual {
		Physical, Virtual
	}

	public enum ReqProvType {
		REQUIRED, PROVIDED
	}

	public enum SafetyLevelPL {
		n, a, b, c, d, e
	}

	public enum SafetyLevelSIL {
		_0, _1, _2, _3, _4
	}

	public enum SafetyType {
		ESTOP, PSTOP, LIMWS, SRSC, SRFC, HCOLA, STCON
	}

	public enum PLSILType {
		PL, SIL, BOTH, NONE
	}

	public enum CybSecurityLevel {
		_0, _1, _2, _3, _4
	}

	public enum PhySecurityLevel {
		LatchSensor, LockwithKey, LockwithActuator, NotDefined
	}

	public enum SecurityType {
		HU_IA, SD_IA, ACNT_MGT, ID_MGT, AUTH_MGT, WIRELEE_MGT, PW_AUTH, PK_CERT,
		STR_PK_AUTH, LOGIN_NO, ACC_UNTRUST_NET, AUTHORIZE, WIRELESS_USE, SESS_LOCK,
		SESS_TERM, SECC_CNTR, AUDT_EVT, TIMESTM, NON_REP, COMM_INTG, PROT_MALI_CODE,
		SECUR_VERIFY, SW_INTGT, INPUT_VALD, DET_OUT, ERR_HNDL, SESS_, INTGT, INFO_CONFI,
		INFO_PERS, CRYTO, RSTIC_FLOW, DoS, RESOU_MGT, CNTR_RECOV_RECON
	}

	public enum Location {
		ROBOT, EDGE, CLOUD
	}
}
