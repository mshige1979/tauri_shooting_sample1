// 基本位置インターフェース
export interface Position {
  x: number;
  y: number;
}

// エンティティ基本インターフェース
export interface Entity extends Position {
  width: number;
  height: number;
  speed: number;
}

// 弾エンティティ
export interface BulletEntity extends Entity {
  isActive: boolean;
  power: number; // 弾の威力
}

// 敵エンティティ
export interface EnemyEntity extends Entity {
  isActive: boolean;
  points: number;
  type: string;
  health: number; // 敵のHP
  movementPattern: 'straight' | 'zigzag' | 'sine'; // 移動パターン
}

// パワーアップアイテム
export interface PowerUpEntity extends Entity {
  isActive: boolean;
  type: PowerUpType;
  duration?: number; // 効果の持続時間（ミリ秒）
}

// 爆発エフェクト
export interface ExplosionEntity extends Position {
  size: number;
  isActive: boolean;
  startTime: number;
  duration: number; // 爆発の持続時間
}

// プレイヤーエンティティ
export interface PlayerEntity extends Entity {
  invulnerable: boolean;
  invulnerableTime: number;
  powerUps: PowerUpType[];
}

// パワーアップの種類
export type PowerUpType = 'speedUp' | 'doubleFire' | 'shield' | 'bomb';

// ゲーム状態インターフェース
export interface GameStateInterface {
  gameStarted: boolean;
  gameOver: boolean;
  gamePaused: boolean;
  stage: number;
  score: number;
  highScore: number;
  isShooting: boolean;
  lives: number; // プレイヤーの残機
}

// ステージ設定
export interface StageSettings {
  enemySpeedMultiplier: number;
  enemySpawnRateMultiplier: number;
  bossLevel: boolean;
}
