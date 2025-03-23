import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { 
  PlayerEntity, 
  BulletEntity, 
  EnemyEntity, 
  PowerUpEntity, 
  ExplosionEntity,
  PowerUpType
} from '../types/gameTypes';
import {
  PLAYER_BASE_SPEED,
  PLAYER_BOOSTED_SPEED,
  BULLET_SPEED,
  POWERUP_DURATION,
  SHIELD_DURATION,
  EXPLOSION_DURATION,
  ENEMY_TYPES
} from '../constants/gameConstants';

interface EntityHookProps {
  containerWidth: number;
  containerHeight: number;
}

export default function useGameEntities({ containerWidth, containerHeight }: EntityHookProps) {
  // 初期プレイヤー位置をメモ化
  const initialPlayerPosition = useMemo(() => {
    return {
      x: containerWidth / 2 - 20,
      y: containerHeight - 60,
    };
  }, [containerWidth, containerHeight]);

  // プレイヤー状態
  const [player, setPlayer] = useState<PlayerEntity>({
    ...initialPlayerPosition,
    width: 40, 
    height: 40, 
    speed: PLAYER_BASE_SPEED, 
    invulnerable: false, 
    invulnerableTime: 0, 
    powerUps: []
  });

  // エンティティ状態
  const [bullets, setBullets] = useState<BulletEntity[]>([]);
  const [enemies, setEnemies] = useState<EnemyEntity[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUpEntity[]>([]);
  const [explosions, setExplosions] = useState<ExplosionEntity[]>([]);

  // コンテナサイズ変更に対応する
  useEffect(() => {
    if (containerWidth > 0 && containerHeight > 0) {
      setPlayer(prev => ({
        ...prev,
        x: containerWidth / 2 - prev.width / 2,
        y: containerHeight - prev.height - 20
      }));
    }
  }, [containerWidth, containerHeight]);

  // プレイヤー位置の更新 - パフォーマンス最適化
  const updatePlayerPosition = useCallback((keyState: Record<string, boolean>) => {
    setPlayer(prev => {
      // 変更がない場合は現在の状態を返す
      if (!keyState.ArrowLeft && !keyState.ArrowRight && 
          !keyState.ArrowUp && !keyState.ArrowDown && 
          !(prev.invulnerable && Date.now() > prev.invulnerableTime)) {
        return prev;
      }

      let newX = prev.x;
      let newY = prev.y;
      
      if (keyState.ArrowLeft) newX = Math.max(0, newX - prev.speed);
      if (keyState.ArrowRight) newX = Math.min(containerWidth - prev.width, newX + prev.speed);
      if (keyState.ArrowUp) newY = Math.max(0, newY - prev.speed);
      if (keyState.ArrowDown) newY = Math.min(containerHeight - prev.height, newY + prev.speed);
      
      // 無敵状態の更新
      let invulnerable = prev.invulnerable;
      if (invulnerable && Date.now() > prev.invulnerableTime) {
        invulnerable = false;
      }
      
      return { 
        ...prev, 
        x: newX, 
        y: newY,
        invulnerable,
        invulnerableTime: invulnerable ? prev.invulnerableTime : 0
      };
    });
  }, [containerWidth, containerHeight]);

  // プレイヤーリセット
  const resetPlayer = useCallback(() => {
    if (containerWidth > 0 && containerHeight > 0) {
      setPlayer({
        x: containerWidth / 2 - 20,
        y: containerHeight - 60,
        width: 40,
        height: 40,
        speed: PLAYER_BASE_SPEED,
        invulnerable: false,
        invulnerableTime: 0,
        powerUps: []
      });
    }
  }, [containerWidth, containerHeight]);

  // 弾の発射ロジックを最適化
  const createBullets = useCallback((
    playerX: number, 
    playerY: number, 
    playerWidth: number, 
    hasDoubleFire: boolean
  ): BulletEntity[] => {
    const newBullets: BulletEntity[] = [];
    
    if (hasDoubleFire) {
      // 2連射
      newBullets.push({
        x: playerX + playerWidth / 4 - 2.5,
        y: playerY,
        width: 5,
        height: 10,
        speed: BULLET_SPEED,
        isActive: true,
        power: 1
      });
      
      newBullets.push({
        x: playerX + playerWidth * 3/4 - 2.5,
        y: playerY,
        width: 5,
        height: 10,
        speed: BULLET_SPEED,
        isActive: true,
        power: 1
      });
    } else {
      // 通常射撃
      newBullets.push({
        x: playerX + playerWidth / 2 - 2.5,
        y: playerY,
        width: 5,
        height: 10,
        speed: BULLET_SPEED,
        isActive: true,
        power: 1
      });
    }
    
    return newBullets;
  }, []);

  // 弾発射ハンドラ
  const fireBullet = useCallback((timestamp: number, lastBulletTime: number, bulletCooldown: number) => {
    if (timestamp - lastBulletTime < bulletCooldown) return null;
    const hasDoubleFire = player.powerUps.includes('doubleFire');
    const newBullets = createBullets(player.x, player.y, player.width, hasDoubleFire);
    setBullets(prev => [...prev, ...newBullets]);
    return timestamp;
  }, [player, createBullets]);

  // 弾の更新
  const updateBullets = useCallback(() => {
    setBullets(prev => {
      if (prev.length === 0) return prev;
      
      return prev
        .map(bullet => {
          if (!bullet.isActive) return bullet;
          return {
            ...bullet,
            y: bullet.y - bullet.speed,
            isActive: bullet.y > -bullet.height
          };
        })
        .filter(bullet => bullet.isActive || bullet.y > -bullet.height);
    });
  }, []);

  // 敵の生成
  const spawnEnemy = useCallback((
    timestamp: number, 
    lastSpawnTime: number, 
    spawnRate: number, 
    stage: number, 
    enemySpeedMultiplier: number
  ) => {
    if (timestamp - lastSpawnTime < spawnRate || containerWidth <= 0) return null;
    
    // ステージが上がるほど、強い敵が出現しやすくなる
    let typeIndex = Math.floor(Math.random() * ENEMY_TYPES.length);
    if (Math.random() < (stage - 1) * 0.1) {
      typeIndex = Math.min(typeIndex + 1, ENEMY_TYPES.length - 1);
    }
    
    const enemyType = ENEMY_TYPES[typeIndex];
    const x = Math.random() * (containerWidth - enemyType.width);
    
    const newEnemy: EnemyEntity = {
      x,
      y: -enemyType.height,
      width: enemyType.width,
      height: enemyType.height,
      speed: enemyType.speed * enemySpeedMultiplier,
      isActive: true,
      points: enemyType.points,
      type: enemyType.type,
      health: enemyType.health,
      movementPattern: enemyType.movementPattern
    };
    
    setEnemies(prev => [...prev, newEnemy]);
    return timestamp;
  }, [containerWidth]);

  // 敵の更新 - サイン波パターンを最適化
  const updateEnemies = useCallback((timestamp: number) => {
    setEnemies(prev => {
      if (prev.length === 0) return prev;
      
      return prev.map(enemy => {
        if (!enemy.isActive) return enemy;
        
        let newX = enemy.x;
        let newY = enemy.y + enemy.speed;
        
        // 移動パターンの適用
        switch (enemy.movementPattern) {
          case 'zigzag':
            newX += Math.sin(newY * 0.05) * 2;
            break;
          case 'sine':
            // より効率的な計算方法
            newX = enemy.x + Math.sin(timestamp * 0.002) * 2;
            break;
        }
        
        // 画面の端で反射
        if (newX < 0 || newX > containerWidth - enemy.width) {
          newX = Math.max(0, Math.min(containerWidth - enemy.width, newX));
        }
        
        return {
          ...enemy,
          x: newX,
          y: newY,
          isActive: newY < containerHeight
        };
      }).filter(enemy => enemy.isActive || enemy.y < containerHeight + enemy.height);
    });
  }, [containerWidth, containerHeight]);

  // パワーアップ更新
  const updatePowerUps = useCallback(() => {
    setPowerUps(prev => {
      if (prev.length === 0) return prev;
      
      return prev.map(powerUp => {
        if (!powerUp.isActive) return powerUp;
        return {
          ...powerUp,
          y: powerUp.y + powerUp.speed,
          isActive: powerUp.y < containerHeight
        };
      }).filter(powerUp => powerUp.isActive);
    });
  }, [containerHeight]);

  // 爆発エフェクト追加 - サイズデフォルトパラメータ追加
  const addExplosion = useCallback((x: number, y: number, size: number = 40, duration: number = EXPLOSION_DURATION) => {
    const newExplosion: ExplosionEntity = {
      x, y, size, isActive: true, startTime: Date.now(), duration
    };
    
    setExplosions(prev => [...prev, newExplosion]);
  }, []);

  // 爆発エフェクト更新
  const updateExplosions = useCallback(() => {
    const now = Date.now();
    
    setExplosions(prev => {
      if (prev.length === 0) return prev;
      
      return prev.filter(explosion => {
        const elapsed = now - explosion.startTime;
        return elapsed < explosion.duration;
      });
    });
  }, []);

  // パワーアップ適用 - タイマー参照を保持
  const powerUpTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  // コンポーネントのアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      // 全てのタイマーをクリア
      Object.values(powerUpTimersRef.current).forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, []);

  // パワーアップ効果適用
  const applyPowerUp = useCallback((type: PowerUpType, updateScore: (points: number) => void) => {
    if (powerUpTimersRef.current[type]) clearTimeout(powerUpTimersRef.current[type]);
    setPlayer(prev => {
      const newPowerUps = [...prev.powerUps, type];
      const newSpeed = type === 'speedUp' ? PLAYER_BOOSTED_SPEED : prev.speed;
      return { ...prev, speed: newSpeed, powerUps: newPowerUps };
    });

    if (type !== 'bomb') {
      powerUpTimersRef.current[type] = setTimeout(() => {
        setPlayer(prev => {
          const newPowerUps = prev.powerUps.filter(p => p !== type);
          return { ...prev, speed: type === 'speedUp' ? PLAYER_BASE_SPEED : prev.speed, powerUps: newPowerUps };
        });
        delete powerUpTimersRef.current[type];
      }, POWERUP_DURATION);
    } else {
      setEnemies(prev => {
        prev.forEach(enemy => {
          if (enemy.isActive) {
            addExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            updateScore(enemy.points);
          }
        });
        return [];
      });
    }
  }, [addExplosion, setEnemies]);

  // 無敵状態
  const makePlayerInvulnerable = useCallback((duration: number) => {
    setPlayer(prev => ({
      ...prev,
      invulnerable: true,
      invulnerableTime: Date.now() + duration
    }));
  }, []);

  // シールド使用
  const useShield = useCallback(() => {
    if (player.powerUps.includes('shield')) {
      setPlayer(prev => ({
        ...prev,
        powerUps: prev.powerUps.filter(p => p !== 'shield'),
        invulnerable: true,
        invulnerableTime: Date.now() + SHIELD_DURATION
      }));
      return true;
    }
    return false;
  }, [player.powerUps]);

  // 全エンティティリセット
  const resetAllEntities = useCallback(() => {
    // 全てのタイマーをクリア
    Object.values(powerUpTimersRef.current).forEach(timer => {
      clearTimeout(timer);
    });
    powerUpTimersRef.current = {};
    
    setBullets([]);
    setEnemies([]);
    setPowerUps([]);
    setExplosions([]);
    resetPlayer();
  }, [resetPlayer]);

  return {
    player,
    bullets,
    enemies,
    powerUps,
    explosions,
    updatePlayerPosition,
    resetPlayer,
    fireBullet,
    updateBullets,
    spawnEnemy,
    updateEnemies,
    updatePowerUps,
    addExplosion,
    updateExplosions,
    applyPowerUp,
    makePlayerInvulnerable,
    useShield,
    resetAllEntities,
    setPlayer,
    setBullets,
    setEnemies,
    setPowerUps
  };
}
