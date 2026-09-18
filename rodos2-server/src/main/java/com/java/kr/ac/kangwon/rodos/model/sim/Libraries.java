package com.java.kr.ac.kangwon.rodos.model.sim;

import java.util.ArrayList;
import java.util.List;

public class Libraries {
    private List<Library> libraries;

    public void addLibrary(Library library) {
        if (libraries == null) {
            libraries = new ArrayList<>();
        }
        libraries.add(library);
    }

    public List<Library> getLibraries() {
        return libraries;
    }

    public void setLibraries(List<Library> libraries) {
        this.libraries = libraries;
    }
}
