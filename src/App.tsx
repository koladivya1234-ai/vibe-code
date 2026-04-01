import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, RefreshCw } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 120;

const TRACKS = [
  {
    id: 1,
    title: "Cybernetic Horizon",
    artist: "AI Generator Alpha",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://picsum.photos/seed/cyber1/200/200"
  },
  {
    id: 2,
    title: "Neon Overdrive",
    artist: "AI Generator Beta",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://picsum.photos/seed/cyber2/200/200"
  },
  {
    id: 3,
    title: "Synthwave Dreams",
    artist: "AI Generator Gamma",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://picsum.photos/seed/cyber3/200/200"
  }
];

export default function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const lastProcessedDirection = useRef(INITIAL_DIRECTION);
  
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const currentDir = direction;
      lastProcessedDirection.current = currentDir;
      
      const newHead = { x: head.x + currentDir.x, y: head.y + currentDir.y };

      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return prevSnake;
      }

      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 10);
        let newFood;
        while (true) {
          newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          };
          // eslint-disable-next-line no-loop-func
          if (!newSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
            break;
          }
        }
        setFood(newFood);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, gameStarted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }
      
      if (!gameStarted && !gameOver && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        setGameStarted(true);
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (lastProcessedDirection.current.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (lastProcessedDirection.current.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (lastProcessedDirection.current.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (lastProcessedDirection.current.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const interval = setInterval(moveSnake, INITIAL_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex, volume]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  
  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    lastProcessedDirection.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setFood({
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-950 to-gray-950 -z-10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] -z-10 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <header className="w-full max-w-2xl flex justify-between items-center mb-4 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)] uppercase italic">
          Neon Snake
        </h1>
        <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
          SCORE: {score.toString().padStart(4, '0')}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center w-full relative">
        <div 
          className="relative bg-gray-950/80 border border-cyan-500/50 rounded-lg shadow-[0_0_30px_rgba(34,211,238,0.15)] overflow-hidden w-full max-w-[400px] aspect-square"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:5%_5%]"></div>

          {snake.map((segment, index) => (
            <div
              key={index}
              className={`absolute w-[5%] h-[5%] ${index === 0 ? 'bg-cyan-400 z-10' : 'bg-cyan-500/80'} border border-gray-950 rounded-sm shadow-[0_0_10px_rgba(34,211,238,0.6)]`}
              style={{
                left: `${segment.x * 5}%`,
                top: `${segment.y * 5}%`,
              }}
            />
          ))}

          <div
            className="absolute w-[5%] h-[5%] bg-fuchsia-500 rounded-full shadow-[0_0_15px_rgba(217,70,239,0.8)] animate-pulse"
            style={{
              left: `${food.x * 5}%`,
              top: `${food.y * 5}%`,
            }}
          />

          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-950/60 backdrop-blur-sm z-20">
              <p className="text-cyan-400 font-mono text-lg sm:text-xl animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] text-center px-4">
                PRESS ANY ARROW KEY<br/>TO START
              </p>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 backdrop-blur-md z-20">
              <h2 className="text-3xl sm:text-4xl font-black text-fuchsia-500 mb-2 sm:mb-4 drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]">SYSTEM FAILURE</h2>
              <p className="text-cyan-400 font-mono text-lg sm:text-xl mb-4 sm:mb-6">FINAL SCORE: {score}</p>
              <button 
                onClick={resetGame}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-cyan-500/20 border border-cyan-400 text-cyan-400 rounded hover:bg-cyan-400 hover:text-gray-950 transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.8)] font-bold tracking-widest"
              >
                <RefreshCw size={20} />
                REBOOT
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full max-w-2xl mt-4 sm:mt-8 bg-gray-900/80 border border-gray-800 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-6 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <audio 
          ref={audioRef} 
          src={TRACKS[currentTrackIndex].url} 
          onEnded={nextTrack}
        />
        
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 border border-gray-700 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
          <img 
            src={TRACKS[currentTrackIndex].cover} 
            alt="Album art" 
            className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''} rounded-full scale-110`}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 rounded-full border-4 border-gray-900/50 m-1"></div>
          <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-gray-950 rounded-full border border-gray-700"></div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-white truncate drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
            {TRACKS[currentTrackIndex].title}
          </h3>
          <p className="text-xs sm:text-sm text-fuchsia-400 truncate font-mono">
            {TRACKS[currentTrackIndex].artist}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={prevTrack} className="text-gray-400 hover:text-cyan-400 transition-colors">
            <SkipBack size={20} className="sm:w-6 sm:h-6" />
          </button>
          <button 
            onClick={togglePlay} 
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-cyan-500 text-gray-950 rounded-full hover:bg-cyan-400 hover:scale-105 transition-all shadow-[0_0_15px_rgba(34,211,238,0.6)]"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" className="sm:w-6 sm:h-6" /> : <Play size={20} fill="currentColor" className="ml-1 sm:w-6 sm:h-6" />}
          </button>
          <button onClick={nextTrack} className="text-gray-400 hover:text-cyan-400 transition-colors">
            <SkipForward size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 w-24 lg:w-32 ml-2 sm:ml-4">
          <Volume2 size={18} className="text-gray-500" />
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
          />
        </div>
      </footer>
    </div>
  );
}
