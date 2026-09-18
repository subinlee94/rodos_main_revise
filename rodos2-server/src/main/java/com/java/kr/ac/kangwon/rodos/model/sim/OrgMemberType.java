package com.java.kr.ac.kangwon.rodos.model.sim;

import com.java.kr.ac.kangwon.rodos.model.Enumerate;
import com.java.kr.ac.kangwon.rodos.model.cim.ModuleID;

public class OrgMemberType {

    private ModuleID moduleID;

    private Enumerate.DependencyType dependency;

    public OrgMemberType() {
    }

    public OrgMemberType(ModuleID moduleID, Enumerate.DependencyType dependency) {
        this.moduleID = moduleID;
        this.dependency = dependency;
    }

    public ModuleID getModuleID() {
        return moduleID;
    }

    public Enumerate.DependencyType getDependency() {
        return dependency;
    }

    public void setModuleID(ModuleID moduleID) {
        this.moduleID = moduleID;
    }

    public void setDependency(Enumerate.DependencyType dependency) {
        this.dependency = dependency;
    }
}
