package com.java.kr.ac.kangwon.rodos.model.cim;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

@JacksonXmlRootElement(localName = xmlTagNames.MODULE_ID_TAG)
public class ModuleID {
    @JacksonXmlProperty(localName = xmlTagNames.M_ID)
    String mID;

    @JacksonXmlProperty(localName = xmlTagNames.I_ID)
    String iID;

    public String getmID() {
        return mID;
    }

    public String getiID() {
        return iID;
    }

    public void setmID(String mID) {
        this.mID = mID;
    }

    public void setiID(String iID) {
        this.iID = iID;
    }
}
