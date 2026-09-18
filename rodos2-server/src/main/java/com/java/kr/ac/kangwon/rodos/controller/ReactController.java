package com.java.kr.ac.kangwon.rodos.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ReactController {

    /**
     * React Router를 위한 fallback 컨트롤러
     * 루트 경로만 처리하여 무한 루프 방지
     */
    @RequestMapping(value = "/")
    public String index() {
        return "forward:/index.html";
    }
}
