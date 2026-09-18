package com.java.kr.ac.kangwon.rodos.model.sim;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.cim.ModuleID;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class Owner {

    @JacksonXmlProperty(localName = xmlTagNames.MODULE_ID_TAG)
    private ModuleID moduleID;

    public ModuleID getModuleID() {
        return moduleID;
    }

    public void setModuleID(ModuleID moduleID) {
        this.moduleID = moduleID;
    }
}
