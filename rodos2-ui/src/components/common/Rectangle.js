import React from 'react';
import '../../styles/common/Rectangle.css';

function Rectangle({ size = 30, color = '#4CAF50' }) {
    const style = {
        width: `${size}px`,
        height: `${size * 0.6}px`, // 직사각형 비율
        backgroundColor: color
    };

    return (
        <div className="rectangle-container">
            <div className="rectangle" style={style}></div>
        </div>
    );
}

export default Rectangle;
