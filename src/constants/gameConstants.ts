// ゲーム全体で使用する定数値を一元管理

// タイミング関連
export const BULLET_COOLDOWN = 200; // 弾の発射間隔（ミリ秒）
export const ENEMY_SPAWN_BASE_RATE = 1000; // 基本敵出現レート（ミリ秒）
export const POWERUP_DURATION = 10000; // パワーアップ効果持続時間（ミリ秒）
export const INVULNERABLE_DURATION = 2000; // 無敵時間（ミリ秒）
export const SHIELD_DURATION = 3000; // シールド効果時間（ミリ秒）
export const EXPLOSION_DURATION = 500; // 爆発エフェクト持続時間（ミリ秒）
export const STAGE_CLEAR_DISPLAY_TIME = 3000; // ステージクリア表示時間（ミリ秒）

// ゲームプレイ関連
export const SCROLL_SPEED = 2; // 背景スクロール速度
export const POWERUP_CHANCE = 0.1; // パワーアップ出現確率
export const PLAYER_BASE_SPEED = 5; // プレイヤー基本移動速度
export const PLAYER_BOOSTED_SPEED = 8; // スピードアップ時の移動速度
export const BULLET_SPEED = 7; // 弾の速度
export const INITIAL_LIVES = 3; // 初期残機数

// ステージ設定
export const STAGE_SETTINGS = [
  { enemySpeedMultiplier: 1.0, enemySpawnRateMultiplier: 1.0, bossLevel: false },
  { enemySpeedMultiplier: 1.2, enemySpawnRateMultiplier: 0.9, bossLevel: false },
  { enemySpeedMultiplier: 1.3, enemySpawnRateMultiplier: 0.8, bossLevel: true },
  { enemySpeedMultiplier: 1.4, enemySpawnRateMultiplier: 0.7, bossLevel: false },
  { enemySpeedMultiplier: 1.5, enemySpawnRateMultiplier: 0.6, bossLevel: true },
];

// エネミータイプ定義
export const ENEMY_TYPES = [
  { width: 30, height: 30, speed: 2, points: 10, type: 'small', health: 1, movementPattern: 'straight' as const },
  { width: 40, height: 40, speed: 1.5, points: 20, type: 'medium', health: 2, movementPattern: 'zigzag' as const },
  { width: 60, height: 60, speed: 1, points: 30, type: 'large', health: 3, movementPattern: 'sine' as const },
];

// パワーアップ定義
export const POWERUP_TYPES = ['speedUp', 'doubleFire', 'shield', 'bomb'] as const;

// ステージクリア条件
export const getKillsRequiredForStageClear = (stage: number): number => 20 + (stage - 1) * 5;

// ローカルストレージキー
export const LOCAL_STORAGE_HIGH_SCORE_KEY = 'highScore';
