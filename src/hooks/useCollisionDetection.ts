import { useCallback, useMemo } from 'react';
import { Entity, BulletEntity, EnemyEntity, PlayerEntity, PowerUpEntity } from '../types/gameTypes';

interface CollisionHandlers {
  onBulletHitEnemy: (bullet: BulletEntity, enemy: EnemyEntity) => void;
  onPlayerHitEnemy: (player: PlayerEntity, enemy: EnemyEntity) => void;
  onPlayerCollectPowerUp: (player: PlayerEntity, powerUp: PowerUpEntity) => void;
}

export default function useCollisionDetection(handlers: CollisionHandlers) {
  // 境界ボックス計算を最適化
  const getBoundingBox = useCallback((entity: Entity) => {
    return {
      left: entity.x,
      right: entity.x + entity.width,
      top: entity.y,
      bottom: entity.y + entity.height
    };
  }, []);

  // 衝突判定の基本関数 - バウンディングボックスを利用
  const isColliding = useCallback((entity1: Entity, entity2: Entity): boolean => {
    const box1 = getBoundingBox(entity1);
    const box2 = getBoundingBox(entity2);
    return box1.left < box2.right && box1.right > box2.left && box1.top < box2.bottom && box1.bottom > box2.top;
  }, [getBoundingBox]);

  // 衝突が起きる可能性の空間分割チェック（最適化）
  const canPossiblyCollide = useCallback((entity1: Entity, entity2: Entity, margin: number = 50): boolean => {
    // エンティティが近くにいるかをまず確認（粗い判定）
    const distanceX = Math.abs((entity1.x + entity1.width/2) - (entity2.x + entity2.width/2));
    const distanceY = Math.abs((entity1.y + entity1.height/2) - (entity2.y + entity2.height/2));
    
    const maxPossibleDistanceX = (entity1.width + entity2.width) / 2 + margin;
    const maxPossibleDistanceY = (entity1.height + entity2.height) / 2 + margin;
    
    return distanceX < maxPossibleDistanceX && distanceY < maxPossibleDistanceY;
  }, []);

  // 弾と敵の衝突チェック - 空間分割最適化
  const checkBulletEnemyCollisions = useCallback(
    (bullets: BulletEntity[], enemies: EnemyEntity[], setBullets: React.Dispatch<React.SetStateAction<BulletEntity[]>>) => {
      if (bullets.length === 0 || enemies.length === 0) return;

      const updatedBullets = [...bullets];

      for (const bullet of updatedBullets) {
        if (!bullet.isActive) continue;

        for (const enemy of enemies) {
          if (!enemy.isActive) continue;

          // 空間分割チェックで高速化
          if (canPossiblyCollide(bullet, enemy, 10) && isColliding(bullet, enemy)) {
            handlers.onBulletHitEnemy(bullet, enemy);

            // 敵を非アクティブにする
            enemy.isActive = false;

            // 弾を非アクティブにする
            bullet.isActive = false;

            break; // この弾は処理済みなのでループを抜ける
          }
        }
      }

      // 非アクティブな弾を削除
      setBullets(updatedBullets.filter(bullet => bullet.isActive));
    },
    [isColliding, canPossiblyCollide, handlers]
  );

  // プレイヤーと敵の衝突チェック
  const checkPlayerEnemyCollisions = useCallback(
    (player: PlayerEntity, enemies: EnemyEntity[]) => {
      if (player.invulnerable || enemies.length === 0) return false;
      
      for (const enemy of enemies) {
        if (!enemy.isActive) continue;
        
        // 空間分割チェックで高速化
        if (canPossiblyCollide(player, enemy) && isColliding(player, enemy)) {
          handlers.onPlayerHitEnemy(player, enemy);
          return true;
        }
      }
      
      return false;
    },
    [isColliding, canPossiblyCollide, handlers]
  );

  // プレイヤーとパワーアップの衝突チェック
  const checkPlayerPowerUpCollisions = useCallback(
    (player: PlayerEntity, powerUps: PowerUpEntity[]) => {
      if (powerUps.length === 0) return null;
      
      for (const powerUp of powerUps) {
        if (!powerUp.isActive) continue;
        
        if (isColliding(player, powerUp)) {
          handlers.onPlayerCollectPowerUp(player, powerUp);
          return powerUp;
        }
      }
      
      return null;
    },
    [isColliding, handlers]
  );

  return {
    isColliding,
    canPossiblyCollide,
    checkBulletEnemyCollisions,
    checkPlayerEnemyCollisions,
    checkPlayerPowerUpCollisions
  };
}
