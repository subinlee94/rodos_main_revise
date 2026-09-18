import React from 'react';

function HWModuleItem({ name }) {
    const handleDragStart = (e) => {
        e.dataTransfer.setData('type', 'hw');
        e.dataTransfer.setData('name', name);
    };
    return (
        <div draggable onDragStart={handleDragStart} style={{ cursor: 'grab', color: '#1976d2', fontWeight: 600 }}>
            {name}
        </div>
    );
}
export default HWModuleItem; 