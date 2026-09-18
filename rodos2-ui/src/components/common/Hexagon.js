import React from 'react';
import '../../styles/common/Hexagon.css';

function Hexagon({ size = 30, color = '#4CAF50' }) {
  const style = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color
  };

  return (
    <div className="hexagon-container">
      <div className="hexagon" style={style}></div>
    </div>
  );
}

export default Hexagon;