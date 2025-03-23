import React from 'react';

interface ExplosionProps {
  x: number;
  y: number;
  size: number;
  progress: number; // 0から1までの進行度
}

const Explosion: React.FC<ExplosionProps> = ({ x, y, size, progress }) => {
  // 爆発の大きさは進行に応じて変化（徐々に大きくなってから消える）
  const currentSize = size * (1 - Math.abs(2 * progress - 1));
  // 透明度も進行に応じて変化
  const opacity = 1 - progress;
  
  return (
    <div 
      className="explosion"
      style={{
        position: 'absolute',
        left: `${x - currentSize / 2}px`,
        top: `${y - currentSize / 2}px`,
        width: `${currentSize}px`,
        height: `${currentSize}px`,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,215,0,0.8) 40%, rgba(255,97,0,0.8) 70%, rgba(255,0,0,0) 100%)`,
        opacity,
        zIndex: 20,
        pointerEvents: 'none'
      }}
    />
  );
};

export default Explosion;
