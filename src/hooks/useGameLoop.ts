import { useRef, useCallback, useEffect } from 'react';

interface GameLoopProps {
  onUpdate: (timestamp: number, deltaTime: number) => void;
  isRunning: boolean;
  targetFPS?: number; // オプションのFPS制限
}

export default function useGameLoop({ onUpdate, isRunning, targetFPS }: GameLoopProps) {
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const fpsIntervalRef = useRef<number>(targetFPS ? 1000 / targetFPS : 0);
  const lastFpsUpdateRef = useRef<number>(0);

  const loop = useCallback((timestamp: number) => {
    // 初回実行時の処理
    if (previousTimeRef.current === 0) {
      previousTimeRef.current = timestamp;
      lastFpsUpdateRef.current = timestamp;
      requestRef.current = requestAnimationFrame(loop);
      return;
    }

    const deltaTime = timestamp - previousTimeRef.current;
    
    // FPS制限がある場合
    if (targetFPS) {
      if (timestamp - lastFpsUpdateRef.current < fpsIntervalRef.current) {
        requestRef.current = requestAnimationFrame(loop);
        return;
      }
      
      // FPS制限に基づいてタイムスタンプを更新
      lastFpsUpdateRef.current = timestamp - (timestamp % fpsIntervalRef.current);
    }
    
    previousTimeRef.current = timestamp;

    if (isRunning) {
      try {
        onUpdate(timestamp, deltaTime);
      } catch (error) {
        console.error('Error in game loop:', error);
      }
    }

    requestRef.current = requestAnimationFrame(loop);
  }, [onUpdate, isRunning, targetFPS]);

  useEffect(() => {
    // FPS間隔の更新
    if (targetFPS) {
      fpsIntervalRef.current = 1000 / targetFPS;
    }
    
    requestRef.current = requestAnimationFrame(loop);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [loop, targetFPS]);

  // ゲームループのリセット
  const resetTimer = useCallback(() => {
    previousTimeRef.current = 0;
    lastFpsUpdateRef.current = 0;
  }, []);

  // 一時停止と再開
  const pauseLoop = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = 0;
    }
  }, []);

  const resumeLoop = useCallback(() => {
    if (requestRef.current === 0) {
      requestRef.current = requestAnimationFrame(loop);
    }
  }, [loop]);

  return { resetTimer, pauseLoop, resumeLoop };
}
