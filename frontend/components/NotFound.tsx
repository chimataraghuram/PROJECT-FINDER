import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Home, Compass, Terminal, Bot, Radio, RotateCcw, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotFoundProps {
  onGoHome: () => void;
  onExploreTrending?: () => void;
  onAskAI?: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onGoHome, onExploreTrending, onAskAI }) => {
  const [gameActive, setGameActive] = useState(false);
  const [hasJumped, setHasJumped] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('pf_404_highscore') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameLoopRef = useRef<number | null>(null);

  // Capture current path
  const badUrl = typeof window !== 'undefined' ? window.location.pathname : '/unknown';

  // Game internal state ref for high-performance 60fps loop
  const gameState = useRef({
    running: false,
    playerY: 105,
    groundY: 105,
    velocity: 0,
    gravity: 0.5,
    jumpForce: -9.2,
    droneX: 42,
    obstacles: [] as { x: number; width: number; height: number }[],
    stars: [] as { x: number; y: number; collected: boolean }[],
    score: 0,
    frame: 0,
    speed: 3.2,
  });

  const jump = useCallback(() => {
    const s = gameState.current;
    if (!gameActive) {
      setGameActive(true);
      s.running = true;
    }
    if (gameOver) {
      restartGame();
      return;
    }
    setHasJumped(true);
    // Jump when on or near the ground line
    if (s.playerY >= s.groundY - 4) {
      s.velocity = s.jumpForce;
    }
  }, [gameActive, gameOver]);

  const restartGame = () => {
    setGameOver(false);
    setScore(0);
    const s = gameState.current;
    s.playerY = s.groundY;
    s.velocity = 0;
    s.score = 0;
    s.frame = 0;
    s.speed = 3.2;
    s.obstacles = [
      { x: 380, width: 14, height: 20 },
      { x: 620, width: 16, height: 26 },
    ];
    s.stars = [
      { x: 260, y: 55, collected: false },
      { x: 500, y: 48, collected: false },
    ];
    s.running = true;
  };

  // Automatically make the 404 page a game after 2 seconds!
  useEffect(() => {
    const timer = setTimeout(() => {
      setGameActive(true);
      gameState.current.running = true;
      gameState.current.obstacles = [
        { x: 360, width: 14, height: 20 },
        { x: 580, width: 16, height: 24 },
      ];
      gameState.current.stars = [
        { x: 240, y: 55, collected: false },
        { x: 460, y: 45, collected: false },
      ];
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Keyboard controls (Space or ArrowUp to jump)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const s = gameState.current;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // --- Ground Line (Cyber Radar Track) ---
      const groundLineY = s.groundY + 14;
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, groundLineY);
      ctx.lineTo(width, groundLineY);
      ctx.stroke();

      // Moving cyber tick markers
      if (s.running && !gameOver) {
        s.frame++;
        const tickOffset = (s.frame * s.speed) % 24;
        ctx.fillStyle = 'rgba(249, 115, 22, 0.25)';
        for (let x = -tickOffset; x < width; x += 24) {
          ctx.fillRect(x, groundLineY + 2, 8, 1.5);
        }
      }

      // --- Player Physics ---
      if (s.running && !gameOver) {
        s.velocity += s.gravity;
        s.playerY += s.velocity;
        if (s.playerY >= s.groundY) {
          s.playerY = s.groundY;
          s.velocity = 0;
        }
      }

      // --- Draw Techboy Drone ---
      ctx.save();
      ctx.translate(s.droneX, s.playerY);

      // Soft Glow
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
      glow.addColorStop(0, 'rgba(249, 115, 22, 0.5)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      // Drone Outer Sphere
      ctx.fillStyle = '#ffedd5';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Core
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Jet Thruster Trail
      if (s.playerY < s.groundY) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-4, 5);
        ctx.lineTo(0, 10 + (s.frame % 3) * 2);
        ctx.lineTo(4, 5);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // --- Inactive state: Subtle hover animation before 2s ---
      if (!s.running && !gameOver) {
        s.playerY = s.groundY + Math.sin(Date.now() / 300) * 2;
      }

      // --- Obstacles & Stars (Active Game) ---
      if (s.running && !gameOver) {
        s.speed = 3.2 + Math.min(s.score / 250, 2.0);

        // Update & Render Obstacles (Red Neon Void Spikes)
        for (let i = 0; i < s.obstacles.length; i++) {
          const obs = s.obstacles[i];
          obs.x -= s.speed;

          // Recycle obstacle
          if (obs.x < -20) {
            obs.x = width + Math.random() * 120 + 80;
            obs.height = Math.random() > 0.5 ? 24 : 18;
            s.score += 10;
            setScore(s.score);
          }

          const obsY = groundLineY - obs.height;

          // Draw Spike
          ctx.save();
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = 'rgba(239, 68, 68, 0.7)';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.roundRect(obs.x, obsY, obs.width, obs.height, 3);
          ctx.fill();

          // Warning core tick
          ctx.fillStyle = '#fee2e2';
          ctx.fillRect(obs.x + obs.width / 2 - 1, obsY + 3, 2, obs.height - 6);
          ctx.restore();

          // Collision Check
          const hitX = s.droneX + 6 > obs.x && s.droneX - 6 < obs.x + obs.width;
          const hitY = s.playerY + 6 > obsY;
          if (hitX && hitY) {
            s.running = false;
            setGameOver(true);
            if (s.score > highScore) {
              setHighScore(s.score);
              localStorage.setItem('pf_404_highscore', s.score.toString());
            }
          }
        }

        // Update & Render Stars (Golden Data Packets)
        for (let i = 0; i < s.stars.length; i++) {
          const star = s.stars[i];
          star.x -= s.speed;

          if (star.x < -15) {
            star.x = width + Math.random() * 160 + 80;
            star.y = 35 + Math.random() * 40;
            star.collected = false;
          }

          if (!star.collected) {
            ctx.save();
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(star.x, star.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Collect Star
            const dist = Math.hypot(s.droneX - star.x, s.playerY - star.y);
            if (dist < 15) {
              star.collected = true;
              s.score += 25;
              setScore(s.score);
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    gameLoopRef.current = animId;

    return () => cancelAnimationFrame(animId);
  }, [gameOver, highScore]);

  return (
    <div className="min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-100px)] flex items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden select-none">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] bg-gradient-to-tr from-orange-500/10 via-red-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

      {/* Main 404 Card - Tap / Click anywhere on card to jump! */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        onClick={jump}
        className="max-w-md w-full mx-auto text-center relative z-10 px-6 py-8 sm:p-10 rounded-[2.5rem] bg-[#0a0a0f]/85 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] cursor-pointer"
      >
        {/* Top Status Pill: Error indicator that becomes live Scoreboard */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-black uppercase tracking-[0.2em] mb-3">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
          </span>
          {!gameActive ? (
            <span>Error 404 · Destination Missing</span>
          ) : (
            <div className="flex items-center gap-2 text-orange-400 font-mono">
              <span>SCORE: {score}</span>
              {highScore > 0 && (
                <span className="text-gray-400 text-[10px] flex items-center gap-0.5">
                  <Trophy size={10} className="text-amber-400" />
                  {highScore}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 404 Stage: Big 404 Number with Seamless Overlay Canvas Game */}
        <div className="relative flex items-center justify-center my-1 h-[125px] overflow-hidden">
          {/* Big Background 404 Gradient Text */}
          <h1 className="text-7xl sm:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-rose-500 select-none drop-shadow-[0_0_35px_rgba(249,115,22,0.35)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-90">
            404
          </h1>

          {/* Transparent Canvas overlay running the Drone Runner directly over the 404 */}
          <canvas
            ref={canvasRef}
            width={380}
            height={125}
            className="w-full h-full block relative z-10 pointer-events-none"
          />

          {/* Game Over Screen Overlay inside the 404 stage */}
          {gameOver && (
            <div className="absolute inset-0 z-20 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-2 rounded-2xl animate-fade-in">
              <span className="text-red-400 font-black text-xs uppercase tracking-widest mb-1 animate-pulse">
                RADAR SIGNAL LOST
              </span>
              <span className="text-white font-mono text-sm font-bold mb-2">
                Score: {score}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  restartGame();
                }}
                className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-md shadow-orange-500/25 active:scale-95"
              >
                <RotateCcw size={11} />
                <span>Retry</span>
              </button>
            </div>
          )}
        </div>

        {/* Interactive Prompt / Status Bar */}
        <div className="min-h-[22px] mb-2 flex items-center justify-center">
          {gameActive && !hasJumped && !gameOver && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-orange-400 font-bold uppercase tracking-wider animate-pulse"
            >
              [ Tap anywhere or press Space to jump! ]
            </motion.p>
          )}
          {gameOver && (
            <p className="text-[11px] text-gray-400 font-medium">
              Tap card or press Space to restart
            </p>
          )}
          {(!gameActive || (hasJumped && !gameOver)) && (
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              Project Not Found
            </h2>
          )}
        </div>

        {/* Clean Integrated Description with Inline Path */}
        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto mb-6 font-medium">
          The coordinates{' '}
          <code className="text-orange-400 bg-white/[0.05] px-2 py-0.5 rounded-md font-mono text-[11px] border border-white/5 inline-block max-w-[170px] truncate align-middle" title={badUrl}>
            {badUrl}
          </code>{' '}
          do not exist on the radar. It may have been moved or removed.
        </p>

        {/* Action Buttons: Clean Single Row (Clicking buttons navigates cleanly without jumping) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5"
        >
          <button
            onClick={onGoHome}
            className="w-full sm:w-auto px-5 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Home size={14} />
            <span>Return Home</span>
          </button>

          {onExploreTrending && (
            <button
              onClick={onExploreTrending}
              className="w-full sm:w-auto px-4 py-3 rounded-full bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Compass size={14} className="text-orange-400" />
              <span>Trending</span>
            </button>
          )}

          {onAskAI && (
            <button
              onClick={onAskAI}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-orange-400 hover:text-orange-300 border border-white/10 hover:border-orange-500/30 transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 gap-1.5"
              title="Ask Techboy AI"
            >
              <Bot size={16} />
              <span className="sm:hidden text-xs font-bold uppercase tracking-wider">Ask AI</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
