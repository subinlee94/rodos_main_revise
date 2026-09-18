import React from 'react';

function SWModuleItem({ name }) {
    const handleDragStart = (e) => {
        e.dataTransfer.setData('type', 'sw');
        e.dataTransfer.setData('name', name);
        e.dataTransfer.setData('sourceHwIdx', ''); // 사이드바에서 드래그하는 경우
        e.dataTransfer.setData('sourceSwIdx', ''); // 사이드바에서 드래그하는 경우
        e.dataTransfer.effectAllowed = 'move';
    };
    return (
        <div draggable onDragStart={handleDragStart} style={{ cursor: 'grab', color: '#bfa32a', fontWeight: 600 }}>
            {name}
        </div>
    );
}
export default SWModuleItem; 