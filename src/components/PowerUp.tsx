import React from 'react';

interface PowerUpProps {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'speedUp' | 'doubleFire' | 'shield' | 'bomb';
}

const PowerUp: React.FC<PowerUpProps> = ({ x, y, width, height, type }) => {
  // タイプに応じた色と形
  let color = '#3498db'; // デフォルト色
  let icon = '⚡'; // デフォルトアイコン
  
  switch (type) {
    case 'speedUp':
      color = '#f39c12'; // オレンジ
      icon = '⚡';
      break;
    case 'doubleFire':
      color = '#e74c3c'; // 赤
      icon = '🔥';
      break;
    case 'shield':
      color = '#1abc9c'; // ターコイズ
      icon = '🛡️';
      break;
    case 'bomb':
      color = '#8e44ad'; // 紫
      icon = '💣';
      break;
  }
  
  return (
    <div 
      className={`powerup powerup-${type}`}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: color,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        boxShadow: `0 0 10px ${color}`,
        animation: 'pulse 1s infinite alternate',
        zIndex: 6,
      }}
    >
      {icon}
    </div>
  );
};

export default PowerUp;
