import { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";
import Game from "./components/Game";
import { GameStateInterface } from "./types/gameTypes";
import { INITIAL_LIVES, LOCAL_STORAGE_HIGH_SCORE_KEY } from "./constants/gameConstants";

// 初期ゲーム状態
const INITIAL_GAME_STATE: GameStateInterface = {
  gameStarted: false,
  gameOver: false,
  gamePaused: false,
  stage: 1,
  score: 0,
  highScore: 0,
  isShooting: false,
  lives: INITIAL_LIVES
};

// ローカルストレージからハイスコアを取得
const getHighScore = (): number => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_HIGH_SCORE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  } catch (error) {
    console.warn('ハイスコアの読み込みに失敗しました', error);
    return 0;
  }
};

// ハイスコアを保存
const saveHighScore = (score: number): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_HIGH_SCORE_KEY, score.toString());
  } catch (error) {
    console.warn('ハイスコアの保存に失敗しました', error);
  }
};

/**
 * ゲーム状態を管理するカスタムフック
 */
function useGameState() {
  const [state, setState] = useState<GameStateInterface>({
    ...INITIAL_GAME_STATE,
    highScore: getHighScore()
  });

  const updateState = useCallback((updater: (prev: GameStateInterface) => GameStateInterface) => {
    setState(prev => updater(prev));
  }, []);

  const actions = useMemo(() => ({
    startNewGame: () => {
      updateState(prev => ({ ...INITIAL_GAME_STATE, gameStarted: true, highScore: prev.highScore }));
      console.log("ゲーム開始");
      setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    },
    endGame: () => {
      updateState(prev => {
        const newHighScore = Math.max(prev.score, prev.highScore);
        if (newHighScore > prev.highScore) saveHighScore(newHighScore);
        return { ...prev, gameOver: true, gameStarted: false, highScore: newHighScore };
      });
      console.log("ゲームオーバー");
    },
    advanceToNextStage: () => updateState(prev => ({ ...prev, stage: prev.stage + 1 })),
    incrementScore: (points: number) => {
      if (points > 0) updateState(prev => ({ ...prev, score: prev.score + points }));
    },
    togglePause: () => updateState(prev => prev.gameOver ? prev : { ...prev, gamePaused: !prev.gamePaused, isShooting: false }),
    decrementLives: () => updateState(prev => {
      const newLives = prev.lives - 1;
      return newLives <= 0 ? { ...prev, lives: 0 } : { ...prev, lives: newLives };
    }),
    startShooting: () => updateState(prev => prev.gamePaused ? prev : { ...prev, isShooting: true }),
    stopShooting: () => updateState(prev => ({ ...prev, isShooting: false })),
    returnToMenu: () => updateState(prev => ({ ...INITIAL_GAME_STATE, highScore: prev.highScore }))
  }), [updateState]);

  return { ...state, ...actions };
}

/**
 * Appコンポーネント
 */
function App() {
  const gameState = useGameState();
  
  const {
    gameStarted,
    gameOver,
    gamePaused,
    stage,
    score,
    highScore,
    lives,
    isShooting,
    startNewGame,
    endGame,
    advanceToNextStage,
    incrementScore,
    startShooting,
    stopShooting,
    togglePause,
    returnToMenu,
    decrementLives
  } = gameState;

  // キー入力ハンドラー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'Escape'].includes(e.code)) e.preventDefault();
      if (e.code === 'Escape' && gameStarted) togglePause();
      if (e.code === 'Space') gameStarted ? startShooting() : startNewGame();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') stopShooting();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, togglePause, startNewGame, startShooting, stopShooting]);

  // UIコンポーネント - メモ化してパフォーマンス向上
  const GameInfo = useMemo(() => (
    <div className="game-info">
      <p>ステージ: {stage}</p>
      <p>スコア: {score}</p>
      <p>ハイスコア: {highScore}</p>
      <p>残機: {lives}</p>
    </div>
  ), [stage, score, highScore, lives]);

  const GameMenu = useMemo(() => (
    <div className="menu">
      <h2>{gameOver ? "ゲームオーバー" : "ゲームスタート"}</h2>
      {gameOver && (
        <>
          <p>スコア: {score}</p>
          <p>ハイスコア: {highScore}</p>
        </>
      )}
      <button onClick={startNewGame}>
        {gameOver ? "リトライ" : "開始"}
      </button>
      <p className="hint">スペースキーを押しても開始できます</p>
    </div>
  ), [gameOver, score, highScore, startNewGame]);

  const PauseMenu = useMemo(() => (
    <div className="pause-menu">
      <h2>一時停止</h2>
      <p>スコア: {score}</p>
      <div className="pause-buttons">
        <button onClick={togglePause}>ゲームに戻る</button>
        <button onClick={returnToMenu} className="menu-button">メニューに戻る</button>
      </div>
      <p className="hint">ESCキーで再開</p>
    </div>
  ), [score, togglePause, returnToMenu]);

  // ゲームコンポーネント - メモ化
  const gameComponent = useMemo(() => (
    <Game 
      stage={stage} 
      onGameOver={endGame} 
      onStageClear={advanceToNextStage}
      updateScore={incrementScore}
      isShooting={isShooting}
      isPaused={gamePaused}
      lives={lives}
      onLivesDecrement={decrementLives}
    />
  ), [
    stage, 
    endGame, 
    advanceToNextStage, 
    incrementScore, 
    isShooting, 
    gamePaused, 
    lives, 
    decrementLives
  ]);

  return (
    <main className="container">
      <h1>スクロールシューティングゲーム</h1>
      
      {!gameStarted && GameMenu}
      
      {gameStarted && (
        <div className="game-container">
          {GameInfo}
          <div style={{ width: '100%', height: '80vh', maxHeight: '600px' }}>
            {gameComponent}
          </div>
          
          {/* 一時停止メニューオーバーレイ */}
          {gamePaused && PauseMenu}
        </div>
      )}
    </main>
  );
}

export default App;
