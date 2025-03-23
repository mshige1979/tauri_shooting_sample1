import React from 'react';

interface BulletProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

const Bullet: React.FC<BulletProps> = ({ x, y, width, height }) => {
  return (
    <div 
      className="bullet"
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: '#f1c40f',
        borderRadius: '50%',
        boxShadow: '0 0 5px #f39c12',
        zIndex: 8,
      }}
    />
  );
};

export default Bullet;
