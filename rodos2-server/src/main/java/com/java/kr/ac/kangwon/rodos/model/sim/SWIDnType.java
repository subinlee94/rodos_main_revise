package com.java.kr.ac.kangwon.rodos.model.sim;

import com.java.kr.ac.kangwon.rodos.model.cim.HwAspects;
import com.java.kr.ac.kangwon.rodos.model.cim.IDnType;
import com.java.kr.ac.kangwon.rodos.model.cim.ModuleID;
import com.java.kr.ac.kangwon.rodos.model.cim.SwAspects;

public class SWIDnType extends IDnType {

    public SWIDnType() {
        super();
    }

    public void addModuleIDToSWAspects(ModuleID moduleId) {
        if (getSwAspects() == null) {
            setSwAspects(new SwAspects());
        }
        getSwAspects().add(moduleId);
    }

    public void addModuleIDToHWAspects(ModuleID moduleId) {
        if (getHwAspects() == null) {
            setHwAspects(new HwAspects());
        }
        getHwAspects().add(moduleId);
    }
}