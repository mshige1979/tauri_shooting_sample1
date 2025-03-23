import React from 'react';

interface EnemyProps {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  health: number;
}

const Enemy: React.FC<EnemyProps> = ({ x, y, width, height, type, health }) => {
  // 敵のタイプに応じて色と最大HPを設定
  let color = '#e74c3c';
  let secondaryColor = '#c0392b';
  let maxHealth = 1;
  
  if (type === 'medium') {
    color = '#e67e22';
    secondaryColor = '#d35400';
    maxHealth = 2;
  } else if (type === 'large') {
    color = '#9b59b6';
    secondaryColor = '#8e44ad';
    maxHealth = 3;
  }
  
  // HPゲージの幅を計算
  const healthPercentage = (health / maxHealth) * 100;
  
  return (
    <div 
      className={`enemy enemy-${type}`}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: color,
        borderRadius: '5px',
        zIndex: 5,
      }}
    >
      <div className="enemy-core" style={{
        width: '60%',
        height: '60%',
        backgroundColor: secondaryColor,
        borderRadius: '50%',
        position: 'absolute',
        left: '20%',
        top: '20%'
      }}></div>
      
      {/* HPゲージ */}
      <div className="enemy-health-bar" style={{
        position: 'absolute',
        width: '100%',
        height: '4px',
        backgroundColor: '#7f8c8d',
        bottom: '-8px',
        left: '0',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div className="enemy-health" style={{
          width: `${healthPercentage}%`,
          height: '100%',
          backgroundColor: health > maxHealth / 2 ? '#2ecc71' : '#e74c3c',
          transition: 'width 0.2s ease-out'
        }}></div>
      </div>
    </div>
  );
};

export default Enemy;
