import { useCallback } from 'react';
import { calculateDropPosition, calculateHexDropPosition, isWithinHexBoundary, setDragData } from '../utils/canvas/canvasHelpers';
import {
    isControllerModule,
    isRobotModule,
    isSwLinkParentModule,
    fetchParentInfoModelFromRegistry
} from '../utils/canvas/moduleLinkUtils';

export function useCanvasDragAndDrop(
    canvasRef,
    hwModules,
    dragOffset,
    draggedModuleIdx,
    draggedSWModule,
    setDragState,
    setSWDragState,
    clearDragState,
    addHWModule,
    addSWModule,
    removeSWModule,
    updateHWModulePosition,
    updateSWModulePosition,
    setDragOverHexIdx,
    onOpenLinkedWizard
) {
    // 인수인계(4.4): Robot과 Controller에 동일한 SW 연결 흐름을 적용하고 중복 배치를 피한다.
    const attachSwToParent = useCallback((
        e,
        idx,
        hwModule,
        { name, moduleType, moduleID, sourceHwIdx, sourceSwIdx },
        wizardType
    ) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const { x, y } = calculateHexDropPosition(e, rect);

        if (sourceHwIdx !== '' && sourceSwIdx !== '') {
            const sourceHw = parseInt(sourceHwIdx, 10);
            const sourceSw = parseInt(sourceSwIdx, 10);
            if (sourceHw !== idx) {
                removeSWModule(sourceHw, sourceSw);
            }
        }

        const existingModules = Array.isArray(hwModule?.swModules) ? hwModule.swModules : [];
        const exists = existingModules.some(sw => (
            (sw?.moduleID && moduleID && sw.moduleID === moduleID) ||
            (!sw?.moduleID && (sw?.name || '') === (name || ''))
        ));
        if (!exists) {
            addSWModule(idx, name, x, y, moduleType, moduleID);
        }

        if (onOpenLinkedWizard) {
            onOpenLinkedWizard(wizardType, idx, hwModule, [{
                name,
                moduleType,
                moduleID: moduleID || ''
            }], {
                name,
                moduleType,
                moduleID: moduleID || ''
            });
        }
    }, [addSWModule, onOpenLinkedWizard, removeSWModule]);

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        const dragData = e.dataTransfer.getData('text/plain');

        if (!dragData) return;

        try {
            const { type, name, moduleType, moduleID } = JSON.parse(dragData);

            const rect = canvasRef.current.getBoundingClientRect();
            const { x, y } = calculateDropPosition(e, rect);

            if (type === 'hw') {
                addHWModule(name, x, y, moduleType, null, null, null, moduleID || '');
            } else if (type === 'controller') {
                const parentInfoModel = await fetchParentInfoModelFromRegistry(moduleID || '', name, 'Comp');
                addHWModule(name, x, y, moduleType, null, null, parentInfoModel, moduleID || '');
            } else if (type === 'robot') {
                const parentInfoModel = await fetchParentInfoModelFromRegistry(moduleID || '', name, 'Comp');
                addHWModule(name, x, y, 'robot', null, null, parentInfoModel, moduleID || '');
            } else if (type === 'sw') {
                alert(
                    'Software / AI 모듈은 캔버스 “빈 바닥”에 직접 놓을 수 없습니다.\n\n' +
                    '① Registry에서 Robot(육각형)·Controller(사각형)·Edge·Cloud를 먼저 캔버스에 드롭한 뒤,\n' +
                    '② Robot 또는 Controller 위로 Software 모듈을 드래그하면 연결(계승) 위자드가 열립니다.'
                );
            }
        } catch (error) {
            console.error('드롭 데이터 파싱 오류:', error);
        }
    }, [canvasRef, addHWModule]);

    const handleHexDrop = useCallback((e, idx) => {
        e.preventDefault();
        e.stopPropagation();

        const dragData = e.dataTransfer.getData('text/plain');
        if (!dragData) return;

        try {
            const { type, name, moduleType, moduleID, sourceHwIdx, sourceSwIdx } = JSON.parse(dragData);

            if (type !== 'sw') {
                setDragOverHexIdx(null);
                return;
            }

            const hwModule = hwModules[idx];

            if (isControllerModule(hwModule)) {
                attachSwToParent(e, idx, hwModule, { name, moduleType, moduleID, sourceHwIdx, sourceSwIdx }, 'controller');
                setDragOverHexIdx(null);
                return;
            }

            if (isRobotModule(hwModule)) {
                attachSwToParent(e, idx, hwModule, { name, moduleType, moduleID, sourceHwIdx, sourceSwIdx }, 'robot');
                setDragOverHexIdx(null);
                return;
            }

            if (isSwLinkParentModule(hwModule)) {
                setDragOverHexIdx(null);
                return;
            }

            const hexRect = e.currentTarget.getBoundingClientRect();
            const { x, y } = calculateHexDropPosition(e, hexRect);

            if (sourceHwIdx !== '' && sourceSwIdx !== '') {
                const sourceHw = parseInt(sourceHwIdx, 10);
                const sourceSw = parseInt(sourceSwIdx, 10);

                if (sourceHw !== idx) {
                    removeSWModule(sourceHw, sourceSw);
                } else {
                    setDragOverHexIdx(null);
                    return;
                }
            }

            addSWModule(idx, name, x, y, moduleType, moduleID);
        } catch (error) {
            console.error('HW 모듈 드롭 데이터 파싱 오류:', error);
        }

        setDragOverHexIdx(null);
    }, [addSWModule, attachSwToParent, hwModules, removeSWModule, setDragOverHexIdx]);

    const handleModuleMouseDown = useCallback((e, idx) => {
        e.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const module = hwModules[idx];
        const offset = {
            x: e.clientX - rect.left - module.x,
            y: e.clientY - rect.top - module.y
        };
        setDragState(idx, offset);
    }, [canvasRef, hwModules, setDragState]);

    const handleSWModuleMouseDown = useCallback((e, hwIdx, swIdx) => {
        e.preventDefault();
        e.stopPropagation();

        const hexRect = e.currentTarget.parentElement.getBoundingClientRect();
        const swModule = hwModules[hwIdx].swModules[swIdx];

        const centerX = 120;
        const centerY = 120;
        const currentX = (swModule.x || 0) + centerX;
        const currentY = (swModule.y || 0) + centerY;

        const offset = {
            x: e.clientX - hexRect.left - currentX,
            y: e.clientY - hexRect.top - currentY
        };

        setSWDragState(hwIdx, swIdx, offset);
        setDragData(e, 'sw', swModule.name, swModule.type, hwIdx, swIdx, swModule.moduleID || '');
    }, [hwModules, setSWDragState]);

    const handleCanvasMouseMove = useCallback((e) => {
        if (draggedModuleIdx !== null && dragOffset !== null) {
            const rect = canvasRef.current.getBoundingClientRect();
            const newX = e.clientX - rect.left - dragOffset.x;
            const newY = e.clientY - rect.top - dragOffset.y;
            updateHWModulePosition(draggedModuleIdx, newX, newY);
        }

        if (draggedSWModule !== null) {
            const hexElement = e.currentTarget.querySelector(`[data-hw-idx="${draggedSWModule.hwIdx}"]`);

            if (hexElement) {
                const hexRect = hexElement.getBoundingClientRect();
                const centerX = 120;
                const centerY = 120;

                const newX = e.clientX - hexRect.left - centerX - draggedSWModule.offset.x;
                const newY = e.clientY - hexRect.top - centerY - draggedSWModule.offset.y;

                if (isWithinHexBoundary(newX, newY)) {
                    updateSWModulePosition(draggedSWModule.hwIdx, draggedSWModule.swIdx, newX, newY);
                }
            }
        }
    }, [canvasRef, dragOffset, draggedModuleIdx, draggedSWModule, updateHWModulePosition, updateSWModulePosition]);

    return {
        handleDrop,
        handleHexDrop,
        handleModuleMouseDown,
        handleSWModuleMouseDown,
        handleCanvasMouseMove
    };
}
