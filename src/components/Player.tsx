import React from 'react';

interface PlayerProps {
  x: number;
  y: number;
  width: number;
  height: number;
  invulnerable?: boolean;
  powerUps?: string[];
}

const Player: React.FC<PlayerProps> = ({ x, y, width, height, invulnerable = false, powerUps = [] }) => {
  const hasSpeedUp = powerUps.includes('speedUp');
  const hasDoubleFire = powerUps.includes('doubleFire');
  const hasShield = powerUps.includes('shield');
  
  return (
    <>
      <div 
        className={`player ${invulnerable ? 'invulnerable' : ''}`}
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: '#3498db',
          borderRadius: '5px',
          transition: 'transform 0.1s',
          zIndex: 10,
          animation: invulnerable ? 'blink 0.2s infinite alternate' : 'none',
        }}
      >
        <div className="player-cockpit" style={{
          width: '60%',
          height: '50%',
          backgroundColor: '#2980b9',
          borderRadius: '50%',
          position: 'absolute',
          left: '20%',
          top: '10%'
        }}></div>
        <div className="player-wing left" style={{
          position: 'absolute',
          width: '80%',
          height: '20%',
          backgroundColor: '#2980b9',
          bottom: '20%',
          left: '10%',
          clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)'
        }}></div>
        
        {/* パワーアップ表示 */}
        {hasSpeedUp && (
          <div className="powerup-indicator speed" style={{
            position: 'absolute',
            width: '100%',
            height: '10%',
            backgroundColor: '#f39c12',
            bottom: '-15%',
            left: '0',
            borderRadius: '2px'
          }}></div>
        )}
        
        {hasDoubleFire && (
          <div className="powerup-indicator double-fire" style={{
            position: 'absolute',
            width: '30%',
            height: '20%',
            backgroundColor: '#e74c3c',
            top: '-25%',
            left: '35%',
            borderRadius: '50%'
          }}></div>
        )}
      </div>
      
      {/* シールド表示 */}
      {hasShield && (
        <div className="shield" style={{
          position: 'absolute',
          left: `${x - 10}px`,
          top: `${y - 10}px`,
          width: `${width + 20}px`,
          height: `${height + 20}px`,
          border: '2px solid #1abc9c',
          borderRadius: '50%',
          animation: 'pulse 1.5s infinite',
          backgroundColor: 'rgba(26, 188, 156, 0.2)',
          zIndex: 9
        }}></div>
      )}
    </>
  );
};

export default Player;
