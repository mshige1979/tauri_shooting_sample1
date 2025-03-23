import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Player from './Player';
import Enemy from './Enemy';
import PowerUp from './PowerUp';
import Explosion from './Explosion';
import Bullet from './Bullet';  // Bulletコンポーネントを正しくインポート
import './Game.css';

import useGameEntities from '../hooks/useGameEntities';
import useCollisionDetection from '../hooks/useCollisionDetection';
import useGameLoop from '../hooks/useGameLoop';
import useStageManagement from '../hooks/useStageManagement';
import { PowerUpType, BulletEntity, EnemyEntity, PlayerEntity, PowerUpEntity } from '../types/gameTypes';
import { 
  BULLET_COOLDOWN, 
  ENEMY_SPAWN_BASE_RATE, 
  SCROLL_SPEED, 
  POWERUP_CHANCE,
  POWERUP_TYPES
} from '../constants/gameConstants';

// ゲーム設定値
// ENEMY_SPAWN_BASE_RATE is imported, no need for local declaration
const LOCAL_SCROLL_SPEED = 2; // 背景スクロール速度
// Removed local declaration of POWERUP_CHANCE to resolve conflict

interface GameProps {
  stage: number;
  onGameOver: () => void;
  onStageClear: () => void;
  updateScore: (points: number) => void;
  isShooting: boolean;
  isPaused: boolean;
  lives: number;
  onLivesDecrement: () => void;
}

const Game: React.FC<GameProps> = ({
  stage,
  onGameOver,
  onStageClear,
  updateScore,
  isShooting,
  isPaused,
  lives,
  onLivesDecrement
}) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 400, height: 500 }); // デフォルト値を設定
  const [gameRunning, setGameRunning] = useState(true);
  
  // キー入力の状態
  const [keyState, setKeyState] = useState({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });
  
  // スクロール背景の位置
  const scrollOffsetRef = useRef<number>(0);
  
  // 時間参照変数
  const lastBulletTimeRef = useRef<number>(0);
  const lastEnemySpawnRef = useRef<number>(0);
  const gameOverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // カスタムフックの使用
  const { 
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
    setBullets,
    setEnemies,
    setPowerUps
  } = useGameEntities({ 
    containerWidth: containerSize.width, 
    containerHeight: containerSize.height 
  });

  // ステージ管理
  const { 
    stageClearScreen, 
    stageScore, 
    getStageSettings, 
    checkStageClearCondition, 
    addToStageScore, 
    incrementKillCount, 
    resetStageProgress 
  } = useStageManagement({ 
    initialStage: stage, 
    onStageClear
  });

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (gameOverTimeoutRef.current) {
        clearTimeout(gameOverTimeoutRef.current);
      }
    };
  }, []);

  // 衝突判定ハンドラ - メモ化
  const collisionHandlers = useMemo(() => ({
    onBulletHitEnemy: (bullet: BulletEntity, enemy: EnemyEntity) => {
      bullet.isActive = false;
      enemy.health -= bullet.power;
      if (enemy.health <= 0) {
        enemy.isActive = false;
        updateScore(enemy.points);
        addToStageScore(enemy.points);
        incrementKillCount();
        addExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        if (Math.random() < POWERUP_CHANCE) {
          const randomType = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
          setPowerUps(prev => [...prev, { x: enemy.x, y: enemy.y, width: 30, height: 30, speed: 1, isActive: true, type: randomType }]);
        }
      }
    },
    onPlayerHitEnemy: (player: PlayerEntity, enemy: EnemyEntity) => {
      enemy.isActive = false;
      addExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
      if (!useShield()) {
        onLivesDecrement();
        makePlayerInvulnerable(2000);
        if (lives <= 1) {
          setGameRunning(false);
          setTimeout(onGameOver, 1000);
        }
      }
    },
    onPlayerCollectPowerUp: (player: PlayerEntity, powerUp: PowerUpEntity) => {
      powerUp.isActive = false;
      applyPowerUp(powerUp.type, updateScore);
    }
  }), [updateScore, addToStageScore, incrementKillCount, addExplosion, setPowerUps, useShield, onLivesDecrement, makePlayerInvulnerable, lives, onGameOver, applyPowerUp]);
  
  // 衝突判定フック
  const { 
    checkBulletEnemyCollisions, 
    checkPlayerEnemyCollisions, 
    checkPlayerPowerUpCollisions 
  } = useCollisionDetection(collisionHandlers);

  // ゲームコンテナのサイズを監視 - リサイズ後のプレイヤー位置更新を追加
  useEffect(() => {
    const updateSize = () => {
      if (gameContainerRef.current) {
        const { width, height } = gameContainerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
        
        // プレイヤーの位置を更新（画面サイズに合わせて）
        resetPlayer();
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    
    // ステージ開始時の初期化
    resetStageProgress();
    resetAllEntities();
    
    return () => window.removeEventListener('resize', updateSize);
  }, [resetPlayer, resetStageProgress, resetAllEntities]);

  // キー入力のイベントリスナー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setKeyState(prev => ({ ...prev, [e.key]: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setKeyState(prev => ({ ...prev, [e.key]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // ゲームの更新関数
  const updateGame = useCallback((timestamp: number, deltaTime: number) => {
    if (isPaused || !gameRunning || stageClearScreen) return;
    
    // ステージ設定を取得
    const stageSettings = getStageSettings(stage);
    const spawnRate = ENEMY_SPAWN_BASE_RATE * stageSettings.enemySpawnRateMultiplier;
    
    // スクロール背景の更新
    scrollOffsetRef.current = (scrollOffsetRef.current + LOCAL_SCROLL_SPEED) % 200;
    
    // プレイヤーの移動
    updatePlayerPosition(keyState);
    
    // 弾の発射
    if (isShooting) {
      const newTime = fireBullet(timestamp, lastBulletTimeRef.current, BULLET_COOLDOWN);
      if (newTime !== null) {
        lastBulletTimeRef.current = newTime;
      }
    }
    
    // 敵の生成
    const newSpawnTime = spawnEnemy(
      timestamp, 
      lastEnemySpawnRef.current, 
      spawnRate, 
      stage, 
      stageSettings.enemySpeedMultiplier
    );
    if (newSpawnTime !== null) {
      lastEnemySpawnRef.current = newSpawnTime;
    }
    
    // エンティティの更新
    updateBullets();
    updateEnemies(timestamp);
    updatePowerUps();
    updateExplosions();
    
    // 衝突判定
    checkBulletEnemyCollisions(bullets, enemies, setBullets);
    
    // 非アクティブな敵を削除
    setEnemies(prev => prev.filter(enemy => enemy.isActive));
    
    // プレイヤーとエンティティの衝突
    checkPlayerEnemyCollisions(player, enemies);
    checkPlayerPowerUpCollisions(player, powerUps);
    
    // ステージクリア条件のチェック
    checkStageClearCondition(stage);
  }, [
    isPaused, 
    gameRunning, 
    stageClearScreen, 
    stage, 
    getStageSettings, 
    updatePlayerPosition, 
    keyState, 
    isShooting, 
    fireBullet, 
    spawnEnemy, 
    updateBullets, 
    updateEnemies, 
    updatePowerUps, 
    updateExplosions, 
    bullets, 
    enemies, 
    player, 
    powerUps,
    checkBulletEnemyCollisions,
    checkPlayerEnemyCollisions,
    checkPlayerPowerUpCollisions,
    checkStageClearCondition
  ]);
  
  // ゲームループの使用
  useGameLoop({
    onUpdate: updateGame,
    isRunning: gameRunning && !isPaused
  });

  // プレイヤー要素をメモ化
  const playerElement = useMemo(() => (
    <Player 
      x={player.x} 
      y={player.y} 
      width={player.width} 
      height={player.height} 
      invulnerable={player.invulnerable}
      powerUps={player.powerUps}
    />
  ), [player.x, player.y, player.width, player.height, player.invulnerable, player.powerUps]);

  return (
    <div ref={gameContainerRef} className="game-field">
      {/* スクロール背景 */}
      <div 
        className="scroll-background" 
        style={{ backgroundPosition: `0 ${scrollOffsetRef.current}px` }}
      />
      
      {/* プレイヤー */}
      {playerElement}
      
      {/* 弾 - Bulletコンポーネントを使用 */}
      {bullets.map((bullet, index) => (
        <Bullet 
          key={`bullet-${index}`} 
          x={bullet.x} 
          y={bullet.y} 
          width={bullet.width} 
          height={bullet.height} 
        />
      ))}
      
      {/* 敵 */}
      {enemies.map((enemy, index) => (
        <Enemy 
          key={`enemy-${index}`} 
          x={enemy.x} 
          y={enemy.y} 
          width={enemy.width} 
          height={enemy.height} 
          type={enemy.type}
          health={enemy.health}
        />
      ))}
      
      {/* パワーアップアイテム */}
      {powerUps.map((powerUp, index) => (
        <PowerUp 
          key={`powerup-${index}`} 
          x={powerUp.x} 
          y={powerUp.y} 
          width={powerUp.width} 
          height={powerUp.height} 
          type={powerUp.type}
        />
      ))}
      
      {/* 爆発エフェクト */}
      {explosions.map((explosion, index) => (
        <Explosion 
          key={`explosion-${index}`} 
          x={explosion.x} 
          y={explosion.y} 
          size={explosion.size}
          progress={(Date.now() - explosion.startTime) / explosion.duration}
        />
      ))}
      
      {/* ステージクリア表示 */}
      {stageClearScreen && (
        <div className="stage-clear">
          <h2>ステージクリア！</h2>
          <p>スコア: {stageScore}</p>
        </div>
      )}
    </div>
  );
};

export default Game;
