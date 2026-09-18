import { v5 as uuidv5 } from 'uuid';

// 1. Manufacturer → UUID v5 (16 bytes, 32 hex chars)
export function getVID(manufacturer) {
    const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // 예시 네임스페이스
    return uuidv5(manufacturer || '', NAMESPACE).replace(/-/g, ''); // 32 hex chars
}

// 2. PID 조합 (4 bytes, 8 hex chars)
export function getPID({ compositeType, swAspect, safety, security, vendorPid1, vendorPid2, vendorPid3, boxType, simulation, moduleCategory }) {
    let bits = '';
    bits += compositeType === 'composite' ? '1' : '0';
    bits += swAspect === 'comp' ? '1' : '0';
    bits += '0'; // HW Aspect (항상 0)
    bits += safety ? '1' : '0';
    bits += security ? '1' : '0';
    // 하위 3비트: White Box/Black Box, Simulation, Robot/Another
    bits += boxType === 'white' ? '1' : '0';  // 좌측(white)=1, 우측(black)=0
    bits += (simulation === true || simulation === 'true') ? '1' : '0';  // 좌측(true)=1, 우측(false)=0
    bits += moduleCategory === 'robot' ? '1' : '0';  // 좌측(robot)=1, 우측(another)=0
    const bitsHex = parseInt(bits, 2).toString(16).padStart(2, '0');
    const vendorPidHex = [vendorPid1, vendorPid2, vendorPid3].map(v => (v || '00').padStart(2, '0')).join('');
    return (bitsHex + vendorPidHex).padEnd(8, '0');
}

// 3. Revision Number (4 bytes, 8 hex chars)
export function getRevNo(rev1, rev2) {
    // 각각 4자리 16진수로 보정
    const major = (rev1 || '').toUpperCase().replace(/[^0-9A-F]/g, '').padStart(4, '0').slice(-4);
    const minor = (rev2 || '').toUpperCase().replace(/[^0-9A-F]/g, '').padStart(4, '0').slice(-4);
    return (major + minor);
}

// 4. Serial Number (4 bytes, 8 hex chars)
export function getSerialNo(serial) {
    return Number(serial || 0).toString(16).padStart(8, '0');
}

// 5. CategoryID (3 bytes, 6 hex chars)
export function getCategoryID(l1, l2, level0 = '10') {
    // 0th Level: 입력기 타입에 따라 결정 (2비트)
    // '10' = Software 입력기, '00' = Controller 입력기
    const level0Bits = level0.padStart(2, '0').slice(-2);
    // 1st Level: 4비트 (Category 1 값은 0000~1111, 2진수 문자열)
    const level1 = parseInt(l1 || '0', 2).toString(2).padStart(4, '0').slice(-4);
    // 2nd Level: 6비트 (Category 2 값은 000000~111111, 2진수 문자열)
    const level2 = parseInt(l2 || '0', 2).toString(2).padStart(6, '0').slice(-6);
    // 나머지 12비트: 0
    const zeros = '0'.repeat(12);
    // 24비트 2진수 조합 (2 + 4 + 6 + 12 = 24)
    const binary = level0Bits + level1 + level2 + zeros;
    // 16진수 6자리로 변환
    const hex = parseInt(binary, 2).toString(16).padStart(6, '0').toUpperCase();
    return hex;
}

// 6. IID (1 byte, 2 hex chars)
export function getIID(iid) {
    return Number(iid || 0).toString(16).padStart(2, '0');
}

// 7. mID 조합 (Instance ID 제외)
export function generateMID(genInfo, categoryInfo) {
    const vid = getVID(genInfo.manufacturer);
    const pid = getPID(genInfo);
    const revNo = getRevNo(genInfo.revisionNumber1, genInfo.revisionNumber2);
    const serialNo = getSerialNo(genInfo.serialNumber);
    const categoryID = getCategoryID(categoryInfo.l1, categoryInfo.l2, categoryInfo.level0);
    return `${vid}${pid}${revNo}${serialNo}${categoryID}`;
}

// 8. iID 생성 (0~255 정수)
export function generateIID(iid) {
    const instanceID = Number(iid || 0);
    // 0~255 범위로 제한
    return Math.max(0, Math.min(255, instanceID));
}

// 9. moduleID 조합 (mID와 iID를 분리하여 반환)
export function generateModuleID(genInfo, categoryInfo, iid) {
    const mID = generateMID(genInfo, categoryInfo);
    const iID = generateIID(iid);
    return {
        mID: mID,
        iID: iID
    };
}

// 10. moduleID를 문자열로 변환 (기존 호환성을 위해 유지)
export function generateModuleIDString(genInfo, categoryInfo, iid) {
    const mID = generateMID(genInfo, categoryInfo);
    const iID = generateIID(iid);
    return `${mID}${iID.toString(16).padStart(2, '0')}`;
}