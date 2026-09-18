// Canvas 드래그 앤 드롭 관련 유틸리티 함수들

export function calculateDropPosition(e, canvasRect) {
    return {
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top
    };
}

export function calculateHexDropPosition(e, hexRect) {
    const dropX = e.clientX - hexRect.left;
    const dropY = e.clientY - hexRect.top;

    // 육각형 중심을 기준으로 상대 좌표 계산
    const centerX = 120; // 육각형 중심 X
    const centerY = 120; // 육각형 중심 Y

    return {
        x: dropX - centerX,
        y: dropY - centerY
    };
}

export function isWithinHexBoundary(x, y, maxDistance = 80) {
    const distance = Math.sqrt(x * x + y * y);
    return distance <= maxDistance;
}

export function getDragData(e) {
    return {
        type: e.dataTransfer.getData('type'),
        name: e.dataTransfer.getData('name'),
        sourceHwIdx: e.dataTransfer.getData('sourceHwIdx'),
        sourceSwIdx: e.dataTransfer.getData('sourceSwIdx')
    };
}

export function setDragData(e, type, name, moduleType, sourceHwIdx = '', sourceSwIdx = '', moduleID = '') {
    e.dataTransfer.setData('text/plain', JSON.stringify({
        type,
        name,
        moduleType,
        moduleID,
        sourceHwIdx: sourceHwIdx.toString(),
        sourceSwIdx: sourceSwIdx.toString()
    }));
    e.dataTransfer.effectAllowed = 'move';
} 