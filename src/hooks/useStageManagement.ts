import { useState, useRef, useCallback, useEffect } from 'react';
import { STAGE_SETTINGS, STAGE_CLEAR_DISPLAY_TIME, getKillsRequiredForStageClear } from '../constants/gameConstants';

interface StageManagementProps {
  initialStage: number;
  onStageClear: () => void;
}

export default function useStageManagement({ initialStage, onStageClear }: StageManagementProps) {
  const [stageClearScreen, setStageClearScreen] = useState(false);
  const stageScoreRef = useRef(0);
  const stageKillCountRef = useRef(0);
  const stageClearTimerRef = useRef<NodeJS.Timeout | null>(null);

  // クリーンアップ関数
  useEffect(() => {
    return () => {
      if (stageClearTimerRef.current) {
        clearTimeout(stageClearTimerRef.current);
      }
    };
  }, []);

  // ステージが変わったときにリセット
  useEffect(() => {
    resetStageProgress();
  }, [initialStage]);

  // 現在のステージ設定を取得
  const getStageSettings = useCallback((stage: number) => {
    const safeStage = Math.max(1, stage); // 負の値を防止
    const index = Math.min(safeStage - 1, STAGE_SETTINGS.length - 1);
    return STAGE_SETTINGS[index];
  }, []);

  // ステージクリア要件チェック
  const checkStageClearCondition = useCallback((stage: number) => {
    const killsRequired = getKillsRequiredForStageClear(stage);
    
    if (stageKillCountRef.current >= killsRequired && !stageClearScreen) {
      setStageClearScreen(true);
      
      // 既存のタイマーをクリア
      if (stageClearTimerRef.current) {
        clearTimeout(stageClearTimerRef.current);
      }
      
      // 新しいタイマーを設定
      stageClearTimerRef.current = setTimeout(() => {
        setStageClearScreen(false);
        onStageClear();
        resetStageProgress();
        stageClearTimerRef.current = null;
      }, STAGE_CLEAR_DISPLAY_TIME);
      
      return true;
    }
    
    return false;
  }, [onStageClear, stageClearScreen]);

  // スコア加算
  const addToStageScore = useCallback((points: number) => {
    stageScoreRef.current += points;
  }, []);

  // 撃破数増加
  const incrementKillCount = useCallback(() => {
    stageKillCountRef.current += 1;
  }, []);

  // ステージ進捗リセット
  const resetStageProgress = useCallback(() => {
    stageScoreRef.current = 0;
    stageKillCountRef.current = 0;
  }, []);

  return {
    stageClearScreen,
    stageScore: stageScoreRef.current,
    stageKillCount: stageKillCountRef.current,
    getStageSettings,
    checkStageClearCondition,
    addToStageScore,
    incrementKillCount,
    resetStageProgress
  };
}
