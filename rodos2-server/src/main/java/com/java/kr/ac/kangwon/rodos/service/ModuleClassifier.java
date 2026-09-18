package com.java.kr.ac.kangwon.rodos.service;

import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.java.kr.ac.kangwon.rodos.model.sim.SoftwareModule;
import java.io.IOException;

/**
 * 모듈 ID를 분석하여 AI, Software, Controller로 분류하는 서비스
 * XML을 SoftwareModule로 변환하는 기능도 포함
 */
@Service
public class ModuleClassifier {

    private final XmlMapper xmlMapper;

    public ModuleClassifier() {
        this.xmlMapper = new XmlMapper();
        // 일부 XML이 필드를 추가해도 services 파싱이 깨지지 않도록 허용
        this.xmlMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        this.xmlMapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false);
        this.xmlMapper.configure(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT, true);
        // 빈 문자열/미정 enum 값이 와도 null로 처리해 파싱 중단을 방지
        this.xmlMapper.configure(DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_AS_NULL, true);
    }

    /**
     * 모듈 ID를 분석하여 분류 반환 (ModelDetector와 동일한 로직)
     * 
     * @param moduleID 모듈 ID (예:
     *                 "d6c36f43f76e58ca90b2c49be0841fb000FFFFFFFFFFFFFF000004052001000")
     * @return 분류 ("ai", "software", "controller", "edge", "cloud", "robot")
     */
    public String classifyModule(String moduleID) {
        try {
            // 새로운 형태: 0c95eb9da4e156248d865fea1499ca3fff00000000000000baffffaa140000-00
            // 기존 형태:
            // d6c36f43f76e58ca90b2c49be0841fb000FFFFFFFFFFFFFF000004052001000-00-00-00-405-2001000

            String mCID;
            String[] mIDs = moduleID.split("-");

            if (mIDs.length >= 5) {
                // 기존 형태: 5개 이상의 부분으로 분리됨
                mCID = mIDs[4];
            } else if (mIDs.length == 2) {
                // 새로운 형태: 2개 부분으로 분리됨 (mID-iID)
                // mID에서 마지막 6자리를 mCID로 사용
                String mID = mIDs[0];
                if (mID.length() >= 6) {
                    mCID = mID.substring(mID.length() - 6);
                } else {
                    return "unknown";
                }
            } else {
                return "unknown";
            }

            int dCID = Integer.parseInt(mCID, 16);
            String bCID = toBinaryStringWithLeadingZero(dCID, 24);
            String level0Bits = bCID.substring(0, 2);

            // categoryID(level0) 우선 규칙
            // 10: software module, 00: controller module
            if ("10".equals(level0Bits)) {
                return "software";
            }
            if ("00".equals(level0Bits)) {
                // PID의 상위 8비트 중 비트 0(LSB, moduleCategory) 확인
                String PID;
                if (mIDs.length >= 5) {
                    // 기존 형태: 5개 이상의 부분으로 분리됨
                    PID = mIDs[1];
                } else if (mIDs.length == 2) {
                    // 새로운 형태: 2개 부분으로 분리됨 (mID-iID)
                    // mID 구조: VID(32자) + PID(8자) + RevNo(8자) + SerialNo(8자) + CategoryID(6자)
                    // PID는 mID의 32번째부터 8자리
                    String mID = mIDs[0];
                    if (mID.length() >= 40) {
                        // mID의 VID(32자) 다음 8자리가 PID
                        PID = mID.substring(32, 40);
                    } else {
                        return "controller";
                    }
                } else {
                    return "controller";
                }
                
                // PID를 2진수로 변환하여 상위 8비트 중 비트 0(LSB) 확인
                try {
                    Long dPID = Long.parseLong(PID, 16);
                    String bPID = Long.toBinaryString(dPID);
                    // 패딩을 추가하여 최소 32비트로 만들기
                    while (bPID.length() < 32) {
                        bPID = "0" + bPID;
                    }
                    // 상위 8비트 중 비트 0(LSB) 확인
                    // PID 구조: 비트 31(MSB)~24 = 상위 8비트, 비트 23~0 = 하위 24비트
                    // 상위 8비트: 비트 31(compositeType), 30(swAspect), 29(HW Aspect), 
                    //            28(safety), 27(security), 26(boxType), 25(simulation), 24(moduleCategory)
                    // 상위 8비트 추출: bPID[0]~bPID[7] (비트 31~24)
                    // 상위 8비트 중 비트 0(LSB) = 전체 32비트 중 비트 24 = bPID[7]
                    if (bPID.length() >= 32) {
                        // 상위 8비트 중 비트 0(LSB) 확인 (bPID[7], 전체 32비트 중 비트 24)
                        char bit0 = bPID.charAt(7); // 상위 8비트 중 비트 0 (LSB)
                        if (bit0 == '1') {
                            return "robot";
                        } else {
                            return "controller";
                        }
                    }
                } catch (Exception e) {
                    // 파싱 실패 시 기본값으로 controller 반환
                    return "controller";
                }
                return "controller";
            }

            // AI Module 분류 (RECOGNITION) - 정확한 패턴 매칭
            if (bCID.startsWith("100010") || bCID.startsWith("100011") || bCID.startsWith("100101")) {
                return "ai";
            }
            // Controller 분류 - Edge와 Robot으로 세분화 (시작 2비트: "00")
            else if (bCID.startsWith("00")) {
                // ModelDetector의 getClassification()과 동일한 로직
                String classification = bCID.substring(2, 6);
                if (classification.equals("0000") || classification.equals("0001")) {
                    return "controller";
                } else {
                    return "edge";
                }
            }
            // Software 분류 - Cloud와 일반 Software로 구분
            else {
                // Software 중에서 Cloud 여부 확인
                String softwareType = bCID.substring(6, 8);
                if (softwareType.equals("11") || softwareType.equals("10")) {
                    return "cloud";
                } else {
                    return "software";
                }
            }
        } catch (Exception e) {
            return "unknown";
        }
    }

    /**
     * Controller 중에서 Edge와 Robot 구분 (ModelDetector의 getClassification과 동일)
     * 
     * @param moduleID 모듈 ID
     * @return "edge" 또는 "robot"
     */
    public String classifyController(String moduleID) {
        try {
            // 새로운 형태와 기존 형태 모두 처리
            String mCID;
            String[] mIDs = moduleID.split("-");

            if (mIDs.length >= 5) {
                // 기존 형태: 5개 이상의 부분으로 분리됨
                mCID = mIDs[4];
            } else if (mIDs.length == 2) {
                // 새로운 형태: 2개 부분으로 분리됨 (mID-iID)
                // mID에서 마지막 6자리를 mCID로 사용
                String mID = mIDs[0];
                if (mID.length() >= 6) {
                    mCID = mID.substring(mID.length() - 6);
                } else {
                    return "unknown";
                }
            } else {
                return "unknown";
            }

            int dCID = Integer.parseInt(mCID, 16);
            String bCID = toBinaryStringWithLeadingZero(dCID, 24);

            String classification = bCID.substring(2, 6);
            if (classification.equals("0000") || classification.equals("0001")) {
                return "robot";
            } else {
                return "edge";
            }
        } catch (Exception e) {
            return "unknown";
        }
    }

    /**
     * Composite/Basic 구분 (ModelDetector의 isComposite와 동일)
     * 
     * @param moduleID 모듈 ID
     * @return "Com" 또는 "Bas"
     */
    public String isComposite(String moduleID) {
        try {
            // 새로운 형태와 기존 형태 모두 처리
            String[] mIDs = moduleID.split("-");
            if (mIDs.length < 2) {
                return "unknown";
            }

            String PID;
            if (mIDs.length >= 5) {
                // 기존 형태: 5개 이상의 부분으로 분리됨
                PID = mIDs[1];
            } else if (mIDs.length == 2) {
                // 새로운 형태: 2개 부분으로 분리됨 (mID-iID)
                // iID를 PID로 사용
                PID = mIDs[1];
            } else {
                return "unknown";
            }

            Long dPID = Long.parseLong(PID, 16);
            String bPID = Long.toBinaryString(dPID);

            // 0이면 Basic, 0이 아니면 Composite
            if (dPID == 0) {
                return "Bas";
            } else {
                return "Com";
            }
        } catch (Exception e) {
            return "unknown";
        }
    }

    /**
     * XML 문자열을 SoftwareModule로 변환
     * 
     * @param xml XML 문자열
     * @return SoftwareModule 객체
     * @throws IOException XML 파싱 오류 시
     */
    public SoftwareModule xmlToSoftwareModule(String xml) throws IOException {
        try {
            // Jackson XML을 사용하여 XML을 SoftwareModule로 변환
            SoftwareModule softwareModule = xmlMapper.readValue(xml, SoftwareModule.class);

            // 기본값 설정 (XML에 없는 경우)
            if (softwareModule.getModuleName() == null || softwareModule.getModuleName().isEmpty()) {
                softwareModule.setModuleName("Unknown Module");
            }
            if (softwareModule.getManufacturer() == null || softwareModule.getManufacturer().isEmpty()) {
                softwareModule.setManufacturer("Unknown Manufacturer");
            }
            if (softwareModule.getDescription() == null || softwareModule.getDescription().isEmpty()) {
                softwareModule.setDescription("Module created from XML upload");
            }
            if (softwareModule.getExamples() == null) {
                softwareModule.setExamples("");
            }

            return softwareModule;
        } catch (IOException e) {
            System.err.println("Error parsing XML to SoftwareModule: " + e.getMessage());
            throw e;
        }
    }

    /**
     * XML 문자열을 SoftwareModule로 변환 (예외 처리 포함)
     * 
     * @param xml          XML 문자열
     * @param fallbackName 파싱 실패 시 사용할 기본 모듈명
     * @return SoftwareModule 객체 (파싱 실패 시 기본값으로 생성)
     */
    public SoftwareModule xmlToSoftwareModuleSafe(String xml, String fallbackName) {
        try {
            SoftwareModule module = xmlToSoftwareModule(xml);
            if (module != null && (module.getIdnType() == null || module.getIdnType().getModuleID() == null)) {
                extractModuleIDFromXML(xml, module);
            }
            
            return module;
        } catch (Exception e) {
            System.err.println("Failed to parse XML, creating default SoftwareModule: " + e.getMessage());

            // 파싱 실패 시 기본 SoftwareModule 생성
            SoftwareModule fallbackModule = new SoftwareModule();
            fallbackModule.setModuleName(fallbackName != null ? fallbackName : "Unknown Module");
            fallbackModule.setManufacturer("Unknown Manufacturer");
            fallbackModule.setDescription("Module created from XML upload (parsing failed)");
            fallbackModule.setExamples("");

            // XML에서 moduleID 추출 시도
            extractModuleIDFromXML(xml, fallbackModule);

            return fallbackModule;
        }
    }

    /**
     * XML 문자열에서 moduleID를 추출하여 SoftwareModule에 설정
     * 
     * @param xml XML 문자열
     * @param module SoftwareModule 객체
     */
    private void extractModuleIDFromXML(String xml, SoftwareModule module) {
        try {
            // 정규표현식으로 <mID>...</mID>와 <iID>...</iID> 추출
            java.util.regex.Pattern mIDPattern = java.util.regex.Pattern.compile("<mID>(.*?)</mID>", java.util.regex.Pattern.DOTALL);
            java.util.regex.Pattern iIDPattern = java.util.regex.Pattern.compile("<iID>(.*?)</iID>", java.util.regex.Pattern.DOTALL);
            
            java.util.regex.Matcher mIDMatcher = mIDPattern.matcher(xml);
            java.util.regex.Matcher iIDMatcher = iIDPattern.matcher(xml);
            
            String mID = null;
            String iID = null;
            
            if (mIDMatcher.find()) {
                mID = mIDMatcher.group(1).trim();
            }
            
            if (iIDMatcher.find()) {
                iID = iIDMatcher.group(1).trim();
            }
            
            // moduleID 객체 생성 및 설정
            if (mID != null && !mID.isEmpty()) {
                if (module.getIdnType() == null) {
                    module.setIdnType(new com.java.kr.ac.kangwon.rodos.model.sim.SWIDnType());
                }
                
                com.java.kr.ac.kangwon.rodos.model.cim.ModuleID moduleIDObj = new com.java.kr.ac.kangwon.rodos.model.cim.ModuleID();
                moduleIDObj.setmID(mID);
                if (iID != null && !iID.isEmpty()) {
                    moduleIDObj.setiID(iID);
                } else {
                    moduleIDObj.setiID("00"); // 기본값
                }
                
                module.getIdnType().setModuleID(moduleIDObj);
                System.out.println("XML에서 추출한 moduleID 설정: mID=" + mID + ", iID=" + moduleIDObj.getiID());
            }
        } catch (Exception e) {
            System.err.println("XML에서 moduleID 추출 실패: " + e.getMessage());
        }
    }

    /**
     * 10진수 정수를 받아 2진수로 표현하여 문자열로 변환하되, 앞자리의 0이 생략되지 않도록 패딩을 추가하는 메서드
     * 
     * @param num       변환할 10진수 정수
     * @param totalBits 총 비트의 사이즈
     * @return totalBits 크기만큼의 문자열을 출력
     */
    private static String toBinaryStringWithLeadingZero(int num, int totalBits) {
        String binaryStr = Integer.toBinaryString(num);
        int zeroPadding = totalBits - binaryStr.length();
        for (int i = 0; i < zeroPadding; i++) {
            binaryStr = "0" + binaryStr;
        }
        return binaryStr;
    }
}
