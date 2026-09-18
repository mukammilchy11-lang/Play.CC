export const DEFAULT_GAMES = [
  {
    id: 'snake-retro',
    title: 'Retro Snake 2000',
    category: 'Arcade',
    description: 'Classic retro snake with smooth responsive controls, golden apples, and high-score tracking.',
    instructions: 'Guide the hungry snake to eat glowing apples. Avoid running into the perimeter walls or your own tail!',
    controls: [
      { key: 'Arrow Keys / WASD', action: 'Direct Snake' },
      { key: 'Space', action: 'Pause / Resume' },
      { key: 'R', action: 'Restart Game' }
    ],
    tags: ['classic', 'retro', 'arcade', 'snake'],
    color: '#10b981',
    iconName: 'Gamepad2',
    iframeType: 'srcdoc',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Retro Snake</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body {
    background: #0f172a;
    color: #f8fafc;
    font-family: system-ui, -apple-system, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 12px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 420px;
    margin-bottom: 10px;
    font-weight: 600;
    font-size: 15px;
  }
  .score-badge {
    background: #1e293b;
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid #334155;
  }
  .canvas-wrap {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5), 0 0 0 2px #334155;
    background: #020617;
  }
  canvas {
    display: block;
    background: #090d16;
  }
  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    transition: opacity 0.2s;
  }
  .overlay.hidden { display: none; }
  .btn {
    background: #10b981;
    color: #064e3b;
    border: none;
    padding: 10px 22px;
    font-weight: 700;
    font-size: 15px;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 12px;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  .btn:hover { background: #34d399; }
  .mobile-controls {
    display: grid;
    grid-template-columns: repeat(3, 50px);
    gap: 8px;
    margin-top: 14px;
  }
  .d-btn {
    background: #1e293b;
    border: 1px solid #334155;
    color: #cbd5e1;
    height: 48px;
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
  }
  .d-btn:active { background: #334155; }
</style>
</head>
<body>
<div class="header">
  <div class="score-badge">Score: <span id="score" style="color: #34d399;">0</span></div>
  <div class="score-badge">High: <span id="highScore" style="color: #fbbf24;">0</span></div>
</div>

<div class="canvas-wrap">
  <canvas id="gameCanvas" width="400" height="400"></canvas>
  <div id="overlay" class="overlay">
    <h2 id="overlayTitle" style="font-size: 24px; margin-bottom: 6px;">RETRO SNAKE</h2>
    <p id="overlaySub" style="color: #94a3b8; font-size: 14px;">Use Arrow keys or WASD to navigate</p>
    <button id="startBtn" class="btn">PLAY NOW</button>
  </div>
</div>

<div class="mobile-controls">
  <div></div>
  <button class="d-btn" id="btnUp">▲</button>
  <div></div>
  <button class="d-btn" id="btnLeft">◀</button>
  <button class="d-btn" id="btnDown">▼</button>
  <button class="d-btn" id="btnRight">▶</button>
</div>

<script>
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('highScore');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlaySub = document.getElementById('overlaySub');
  const startBtn = document.getElementById('startBtn');

  const GRID_SIZE = 20;
  const TILE_COUNT = canvas.width / GRID_SIZE;

  let snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
  let velocity = { x: 0, y: -1 };
  let nextVelocity = { x: 0, y: -1 };
  let food = { x: 5, y: 5 };
  let goldenApple = null;
  let goldenTimer = 0;
  let score = 0;
  let highScore = parseInt(localStorage.getItem('snake_highscore') || '0', 10);
  let gameRunning = false;
  let gameLoop = null;

  highScoreEl.innerText = highScore;

  function placeFood() {
    food = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT)
    };
    // Ensure food isn't on snake
    for (let part of snake) {
      if (part.x === food.x && part.y === food.y) return placeFood();
    }
  }

  function resetGame() {
    snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    velocity = { x: 0, y: -1 };
    nextVelocity = { x: 0, y: -1 };
    score = 0;
    scoreEl.innerText = score;
    placeFood();
    goldenApple = null;
    gameRunning = true;
    overlay.classList.add('hidden');
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 100);
  }

  function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('snake_highscore', highScore.toString());
      highScoreEl.innerText = highScore;
    }
    overlayTitle.innerText = 'GAME OVER';
    overlaySub.innerText = 'Final Score: ' + score;
    startBtn.innerText = 'PLAY AGAIN';
    overlay.classList.remove('hidden');
  }

  function update() {
    velocity = nextVelocity;
    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    // Wall collision check
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
      return gameOver();
    }

    // Self collision
    for (let i = 0; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return gameOver();
      }
    }

    snake.unshift(head);

    // Food check
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.innerText = score;
      placeFood();
      // Chance of golden apple
      if (Math.random() < 0.25 && !goldenApple) {
        goldenApple = {
          x: Math.floor(Math.random() * TILE_COUNT),
          y: Math.floor(Math.random() * TILE_COUNT),
          expire: 40
        };
      }
    } else if (goldenApple && head.x === goldenApple.x && head.y === goldenApple.y) {
      score += 50;
      scoreEl.innerText = score;
      goldenApple = null;
    } else {
      snake.pop();
    }

    if (goldenApple) {
      goldenApple.expire--;
      if (goldenApple.expire <= 0) goldenApple = null;
    }

    draw();
  }

  function draw() {
    // Clear
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines (subtle)
    ctx.strokeStyle = '#131d2e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvas.width; i += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    // Regular Food
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc((food.x + 0.5) * GRID_SIZE, (food.y + 0.5) * GRID_SIZE, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Golden Apple
    if (goldenApple) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc((goldenApple.x + 0.5) * GRID_SIZE, (goldenApple.y + 0.5) * GRID_SIZE, GRID_SIZE / 2 - 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Snake
    snake.forEach((part, index) => {
      if (index === 0) {
        ctx.fillStyle = '#34d399';
      } else {
        ctx.fillStyle = '#10b981';
      }
      ctx.fillRect(part.x * GRID_SIZE + 1, part.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    });
  }

  function handleKey(key) {
    if (!gameRunning) return;
    if ((key === 'ArrowUp' || key === 'w' || key === 'W') && velocity.y === 0) nextVelocity = { x: 0, y: -1 };
    if ((key === 'ArrowDown' || key === 's' || key === 'S') && velocity.y === 0) nextVelocity = { x: 0, y: 1 };
    if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && velocity.x === 0) nextVelocity = { x: -1, y: 0 };
    if ((key === 'ArrowRight' || key === 'd' || key === 'D') && velocity.x === 0) nextVelocity = { x: 1, y: 0 };
  }

  window.addEventListener('keydown', e => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    if (e.key === ' ' && gameRunning) {
      // Toggle pause
    }
    handleKey(e.key);
  });

  startBtn.addEventListener('click', resetGame);
  document.getElementById('btnUp').onclick = () => handleKey('ArrowUp');
  document.getElementById('btnDown').onclick = () => handleKey('ArrowDown');
  document.getElementById('btnLeft').onclick = () => handleKey('ArrowLeft');
  document.getElementById('btnRight').onclick = () => handleKey('ArrowRight');

  draw();
</script>
</body>
</html>`
  },
  {
    id: 'neon-pong',
    title: 'Neon Pong Rivals',
    category: 'Sports',
    description: 'Fast-paced table tennis with responsive physics, computer AI rival or local 2-player mode.',
    instructions: 'Deflect the glowing neon ball past your opponent. The first player to reach 7 points wins the championship!',
    controls: [
      { key: 'W / S or Arrow Keys', action: 'Move Paddle Up & Down' },
      { key: 'Space', action: 'Launch Ball / Pause' },
      { key: 'R', action: 'Reset Match' }
    ],
    tags: ['retro', 'sports', 'pong', 'arcade', '2-player'],
    color: '#06b6d4',
    iconName: 'Activity',
    iframeType: 'srcdoc',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Neon Pong Rivals</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body {
    background: #030712;
    color: #e2e8f0;
    font-family: system-ui, -apple-system, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 10px;
  }
  .controls-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    align-items: center;
  }
  .score-board {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: 2px;
    background: #111827;
    padding: 6px 20px;
    border-radius: 10px;
    border: 1px solid #1f2937;
  }
  .btn {
    background: #0284c7;
    color: #ffffff;
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
  }
  .btn:hover { background: #0369a1; }
  .canvas-wrap {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 0 30px rgba(6, 182, 212, 0.15);
    border: 2px solid #1e293b;
  }
  canvas { display: block; background: #080d1a; }
  .touch-controls {
    display: flex;
    gap: 20px;
    margin-top: 14px;
  }
  .t-btn {
    background: #1f2937;
    border: 1px solid #374151;
    color: #38bdf8;
    width: 60px;
    height: 48px;
    border-radius: 8px;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
  }
</style>
</head>
<body>
<div class="controls-bar">
  <div class="score-board">
    <span id="p1Score" style="color: #38bdf8;">0</span> : <span id="p2Score" style="color: #f43f5e;">0</span>
  </div>
  <button id="modeBtn" class="btn">Mode: 1P vs AI</button>
  <button id="resetBtn" class="btn">Restart</button>
</div>

<div class="canvas-wrap">
  <canvas id="pongCanvas" width="560" height="360"></canvas>
</div>

<div class="touch-controls">
  <button class="t-btn" id="tUp">▲</button>
  <button class="t-btn" id="tDown">▼</button>
</div>

<script>
  const canvas = document.getElementById('pongCanvas');
  const ctx = canvas.getContext('2d');
  const p1ScoreEl = document.getElementById('p1Score');
  const p2ScoreEl = document.getElementById('p2Score');
  const modeBtn = document.getElementById('modeBtn');
  const resetBtn = document.getElementById('resetBtn');

  let p1Score = 0;
  let p2Score = 0;
  let is2Player = false;

  const PADDLE_HEIGHT = 70;
  const PADDLE_WIDTH = 12;

  const p1 = { x: 20, y: canvas.height / 2 - PADDLE_HEIGHT / 2, vy: 0, speed: 6 };
  const p2 = { x: canvas.width - 20 - PADDLE_WIDTH, y: canvas.height / 2 - PADDLE_HEIGHT / 2, vy: 0, speed: 5.2 };

  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 5,
    vy: 3,
    radius: 7,
    speed: 5.5
  };

  const keys = {};

  modeBtn.onclick = () => {
    is2Player = !is2Player;
    modeBtn.innerText = is2Player ? 'Mode: 2 Player (Local)' : 'Mode: 1P vs AI';
  };

  resetBtn.onclick = () => {
    p1Score = 0;
    p2Score = 0;
    p1ScoreEl.innerText = '0';
    p2ScoreEl.innerText = '0';
    resetBall();
  };

  function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5.5;
    const dir = Math.random() > 0.5 ? 1 : -1;
    const angle = (Math.random() * Math.PI / 4) - (Math.PI / 8);
    ball.vx = dir * ball.speed * Math.cos(angle);
    ball.vy = ball.speed * Math.sin(angle);
  }

  window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
  });
  window.addEventListener('keyup', e => { keys[e.key] = false; });

  let touchUp = false;
  let touchDown = false;
  const tUp = document.getElementById('tUp');
  const tDown = document.getElementById('tDown');
  tUp.onmousedown = tUp.ontouchstart = () => { touchUp = true; };
  tUp.onmouseup = tUp.ontouchend = () => { touchUp = false; };
  tDown.onmousedown = tDown.ontouchstart = () => { touchDown = true; };
  tDown.onmouseup = tDown.ontouchend = () => { touchDown = false; };

  function loop() {
    // Player 1 input
    if (keys['w'] || keys['W'] || keys['ArrowUp'] || touchUp) {
      p1.y -= p1.speed;
    }
    if (keys['s'] || keys['S'] || keys['ArrowDown'] || touchDown) {
      p1.y += p1.speed;
    }

    // Clamp P1
    if (p1.y < 0) p1.y = 0;
    if (p1.y + PADDLE_HEIGHT > canvas.height) p1.y = canvas.height - PADDLE_HEIGHT;

    // Player 2 / AI
    if (is2Player) {
      if (keys['i'] || keys['I']) p2.y -= p2.speed;
      if (keys['k'] || keys['K']) p2.y += p2.speed;
    } else {
      // AI tracking with subtle reaction lag
      const targetY = ball.y - PADDLE_HEIGHT / 2;
      if (p2.y + PADDLE_HEIGHT / 2 < ball.y - 10) {
        p2.y += p2.speed;
      } else if (p2.y + PADDLE_HEIGHT / 2 > ball.y + 10) {
        p2.y -= p2.speed;
      }
    }

    // Clamp P2
    if (p2.y < 0) p2.y = 0;
    if (p2.y + PADDLE_HEIGHT > canvas.height) p2.y = canvas.height - PADDLE_HEIGHT;

    // Move Ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall bounces
    if (ball.y - ball.radius <= 0) {
      ball.y = ball.radius;
      ball.vy = -ball.vy;
    }
    if (ball.y + ball.radius >= canvas.height) {
      ball.y = canvas.height - ball.radius;
      ball.vy = -ball.vy;
    }

    // Paddle 1 collision
    if (
      ball.x - ball.radius <= p1.x + PADDLE_WIDTH &&
      ball.x + ball.radius >= p1.x &&
      ball.y >= p1.y &&
      ball.y <= p1.y + PADDLE_HEIGHT
    ) {
      ball.x = p1.x + PADDLE_WIDTH + ball.radius;
      const hitOffset = (ball.y - (p1.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
      const angle = hitOffset * (Math.PI / 3);
      ball.speed = Math.min(ball.speed + 0.3, 11);
      ball.vx = Math.abs(ball.speed * Math.cos(angle));
      ball.vy = ball.speed * Math.sin(angle);
    }

    // Paddle 2 collision
    if (
      ball.x + ball.radius >= p2.x &&
      ball.x - ball.radius <= p2.x + PADDLE_WIDTH &&
      ball.y >= p2.y &&
      ball.y <= p2.y + PADDLE_HEIGHT
    ) {
      ball.x = p2.x - ball.radius;
      const hitOffset = (ball.y - (p2.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
      const angle = hitOffset * (Math.PI / 3);
      ball.speed = Math.min(ball.speed + 0.3, 11);
      ball.vx = -Math.abs(ball.speed * Math.cos(angle));
      ball.vy = ball.speed * Math.sin(angle);
    }

    // Score checks
    if (ball.x < 0) {
      p2Score++;
      p2ScoreEl.innerText = p2Score;
      resetBall();
    } else if (ball.x > canvas.width) {
      p1Score++;
      p1ScoreEl.innerText = p1Score;
      resetBall();
    }

    // Render
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center dotted divider
    ctx.strokeStyle = '#1e293b';
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Paddle 1
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(p1.x, p1.y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Paddle 2
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(p2.x, p2.y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(loop);
  }

  resetBall();
  requestAnimationFrame(loop);
</script>
</body>
</html>`
  },
  {
    id: 'block-breaker',
    title: 'Block Breaker DX',
    category: 'Arcade',
    description: 'Vibrant breakout game with power-ups, multiple tiers of brick hardness, and combo scoring.',
    instructions: 'Bounce the steel ball to shatter every brick. Catch power capsules for extended paddles and multiballs!',
    controls: [
      { key: 'Mouse / Arrow Keys / A & D', action: 'Move Paddle' },
      { key: 'Space / Click', action: 'Launch Ball' },
      { key: 'P', action: 'Pause' }
    ],
    tags: ['breakout', 'arcade', 'blocks', 'retro'],
    color: '#8b5cf6',
    iconName: 'LayoutGrid',
    iframeType: 'srcdoc',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Block Breaker DX</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body {
    background: #0f172a;
    color: #f8fafc;
    font-family: system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 10px;
  }
  .hud {
    display: flex;
    justify-content: space-between;
    width: 480px;
    margin-bottom: 8px;
    font-weight: bold;
    font-size: 15px;
  }
  .hud-box {
    background: #1e293b;
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid #334155;
  }
  .wrap {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    border: 2px solid #334155;
  }
  canvas { display: block; background: #020617; cursor: crosshair; }
  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
  }
  .overlay.hidden { display: none; }
  .btn {
    background: #8b5cf6;
    color: #fff;
    border: none;
    padding: 10px 22px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    margin-top: 10px;
  }
  .btn:hover { background: #a78bfa; }
</style>
</head>
<body>
<div class="hud">
  <div class="hud-box">Score: <span id="score" style="color: #a78bfa;">0</span></div>
  <div class="hud-box">Lives: <span id="lives" style="color: #f43f5e;">❤❤❤</span></div>
  <div class="hud-box">Level: <span id="level" style="color: #38bdf8;">1</span></div>
</div>

<div class="wrap">
  <canvas id="gameCanvas" width="480" height="480"></canvas>
  <div id="overlay" class="overlay">
    <h2 id="title" style="font-size: 26px; margin-bottom: 6px;">BLOCK BREAKER</h2>
    <p id="sub" style="color: #94a3b8; font-size: 14px;">Move mouse or arrow keys to bounce ball</p>
    <button id="startBtn" class="btn">START GAME</button>
  </div>
</div>

<script>
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const levelEl = document.getElementById('level');
  const overlay = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');

  let score = 0;
  let lives = 3;
  let level = 1;
  let inPlay = false;
  let ballAttached = true;

  let paddle = { x: 200, y: 450, width: 85, height: 12, speed: 8 };
  let ball = { x: 240, y: 440, vx: 4, vy: -4, radius: 6 };

  const BRICK_ROWS = 5;
  const BRICK_COLS = 8;
  const BRICK_WIDTH = 50;
  const BRICK_HEIGHT = 18;
  const BRICK_PADDING = 8;
  const BRICK_OFFSET_TOP = 40;
  const BRICK_OFFSET_LEFT = 12;

  let bricks = [];
  const ROW_COLORS = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8'];

  function initBricks() {
    bricks = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      bricks[r] = [];
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks[r][c] = { x: 0, y: 0, status: 1, color: ROW_COLORS[r] };
      }
    }
  }

  function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    scoreEl.innerText = score;
    livesEl.innerText = '❤❤❤';
    levelEl.innerText = level;
    initBricks();
    resetBall();
    inPlay = true;
    overlay.classList.add('hidden');
  }

  function resetBall() {
    ballAttached = true;
    paddle.x = canvas.width / 2 - paddle.width / 2;
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius - 1;
    ball.vx = 4 * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = -4;
  }

  function launchBall() {
    if (ballAttached) {
      ballAttached = false;
    }
  }

  // Mouse movement
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, mouseX - paddle.width / 2));
    if (ballAttached) {
      ball.x = paddle.x + paddle.width / 2;
    }
  });

  window.addEventListener('click', launchBall);
  window.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'ArrowUp') launchBall();
    if (e.key === 'ArrowLeft' || e.key === 'a') paddle.x = Math.max(0, paddle.x - paddle.speed * 2);
    if (e.key === 'ArrowRight' || e.key === 'd') paddle.x = Math.min(canvas.width - paddle.width, paddle.x + paddle.speed * 2);
    if (ballAttached) ball.x = paddle.x + paddle.width / 2;
  });

  startBtn.addEventListener('click', resetGame);

  function update() {
    if (!inPlay) return;

    if (!ballAttached) {
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Wall bounces
      if (ball.x - ball.radius <= 0) {
        ball.x = ball.radius;
        ball.vx = -ball.vx;
      }
      if (ball.x + ball.radius >= canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.vx = -ball.vx;
      }
      if (ball.y - ball.radius <= 0) {
        ball.y = ball.radius;
        ball.vy = -ball.vy;
      }

      // Bottom death
      if (ball.y > canvas.height) {
        lives--;
        livesEl.innerText = '❤'.repeat(Math.max(0, lives));
        if (lives <= 0) {
          inPlay = false;
          overlay.querySelector('#title').innerText = 'GAME OVER';
          overlay.querySelector('#sub').innerText = 'Final Score: ' + score;
          startBtn.innerText = 'TRY AGAIN';
          overlay.classList.remove('hidden');
        } else {
          resetBall();
        }
      }

      // Paddle bounce
      if (
        ball.y + ball.radius >= paddle.y &&
        ball.y - ball.radius <= paddle.y + paddle.height &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.width
      ) {
        ball.y = paddle.y - ball.radius;
        const hitOffset = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        ball.vx = hitOffset * 6;
        ball.vy = -Math.abs(ball.vy);
      }

      // Brick collision
      let activeBricks = 0;
      for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
          const b = bricks[r][c];
          if (b.status === 1) {
            activeBricks++;
            const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
            const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
            b.x = brickX;
            b.y = brickY;

            if (
              ball.x > brickX &&
              ball.x < brickX + BRICK_WIDTH &&
              ball.y > brickY &&
              ball.y < brickY + BRICK_HEIGHT
            ) {
              ball.vy = -ball.vy;
              b.status = 0;
              score += 10 * (BRICK_ROWS - r);
              scoreEl.innerText = score;
            }
          }
        }
      }

      // Level cleared
      if (activeBricks === 0) {
        level++;
        levelEl.innerText = level;
        initBricks();
        resetBall();
      }
    }

    draw();
    requestAnimationFrame(update);
  }

  function draw() {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bricks
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const b = bricks[r]?.[c];
        if (b && b.status === 1) {
          const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
          const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.roundRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT, 4);
          ctx.fill();
        }
      }
    }

    // Paddle
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 6);
    ctx.fill();

    // Ball
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  initBricks();
  draw();
  requestAnimationFrame(update);
</script>
</body>
</html>`
  },
  {
    id: 'space-defender',
    title: 'Space Defender: Orbital War',
    category: 'Action',
    description: 'Defend planet Earth from descending alien invasion fleets with rapid-fire lasers and energy shields.',
    instructions: 'Maneuver your starship across the lower deck and blast incoming alien armadas before they breach orbit!',
    controls: [
      { key: 'Left / Right or A / D', action: 'Move Starfighter' },
      { key: 'Spacebar', action: 'Fire Plasma Laser' },
      { key: 'P', action: 'Pause Mission' }
    ],
    tags: ['space', 'shooter', 'retro', 'invaders', 'arcade'],
    color: '#ec4899',
    iconName: 'Rocket',
    iframeType: 'srcdoc',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Space Defender</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body {
    background: #09090b;
    color: #f4f4f5;
    font-family: monospace;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 10px;
  }
  .hud {
    display: flex;
    justify-content: space-between;
    width: 460px;
    margin-bottom: 8px;
    font-size: 16px;
    font-weight: bold;
  }
  .box { background: #18181b; padding: 6px 14px; border-radius: 6px; border: 1px solid #27272a; }
  .canvas-wrap {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    border: 2px solid #27272a;
    box-shadow: 0 0 25px rgba(236, 72, 153, 0.2);
  }
  canvas { display: block; background: #040406; }
  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(9, 9, 11, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .overlay.hidden { display: none; }
  .btn {
    background: #ec4899;
    color: #fff;
    border: none;
    padding: 10px 24px;
    border-radius: 6px;
    font-size: 15px;
    font-family: inherit;
    font-weight: bold;
    cursor: pointer;
    margin-top: 14px;
  }
  .btn:hover { background: #f472b6; }
  .controls-row {
    display: flex;
    gap: 12px;
    margin-top: 12px;
  }
  .m-btn {
    background: #27272a;
    color: #fff;
    border: 1px solid #3f3f46;
    padding: 10px 18px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
  }
</style>
</head>
<body>
<div class="hud">
  <div class="box">SCORE: <span id="score" style="color: #ec4899;">0</span></div>
  <div class="box">LIVES: <span id="lives" style="color: #38bdf8;">3</span></div>
  <div class="box">WAVE: <span id="wave" style="color: #fbbf24;">1</span></div>
</div>

<div class="canvas-wrap">
  <canvas id="spaceCanvas" width="460" height="460"></canvas>
  <div id="overlay" class="overlay">
    <h1 id="title" style="color: #ec4899; margin-bottom: 8px;">SPACE DEFENDER</h1>
    <p id="sub" style="color: #a1a1aa;">Defend orbit from incoming alien fleets</p>
    <button id="startBtn" class="btn">LAUNCH MISSION</button>
  </div>
</div>

<div class="controls-row">
  <button class="m-btn" id="leftBtn">◀ MOVE</button>
  <button class="m-btn" id="fireBtn" style="background: #ec4899; font-weight: bold;">FIRE ⚡</button>
  <button class="m-btn" id="rightBtn">MOVE ▶</button>
</div>

<script>
  const canvas = document.getElementById('spaceCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const waveEl = document.getElementById('wave');
  const overlay = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');

  let score = 0;
  let lives = 3;
  let wave = 1;
  let gameActive = false;

  const player = { x: 215, y: 410, width: 30, height: 20, speed: 6 };
  let lasers = [];
  let alienLasers = [];
  let aliens = [];
  let stars = [];
  let alienDir = 1;
  let alienSpeed = 1.2;

  // Starfield background
  for (let i = 0; i < 60; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speed: Math.random() * 0.8 + 0.2
    });
  }

  function spawnWave() {
    aliens = [];
    const rows = 4;
    const cols = 8;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        aliens.push({
          x: 40 + c * 44,
          y: 40 + r * 34,
          width: 26,
          height: 18,
          row: r,
          alive: true
        });
      }
    }
    alienDir = 1;
    alienSpeed = 1 + wave * 0.2;
  }

  function resetGame() {
    score = 0;
    lives = 3;
    wave = 1;
    scoreEl.innerText = score;
    livesEl.innerText = lives;
    waveEl.innerText = wave;
    lasers = [];
    alienLasers = [];
    spawnWave();
    gameActive = true;
    overlay.classList.add('hidden');
  }

  const keys = {};
  window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ' && gameActive) {
      fireLaser();
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => { keys[e.key] = false; });

  function fireLaser() {
    if (lasers.length < 4) {
      lasers.push({ x: player.x + player.width / 2, y: player.y, speed: 8 });
    }
  }

  startBtn.onclick = resetGame;
  document.getElementById('leftBtn').onmousedown = () => { keys['ArrowLeft'] = true; };
  document.getElementById('leftBtn').onmouseup = () => { keys['ArrowLeft'] = false; };
  document.getElementById('rightBtn').onmousedown = () => { keys['ArrowRight'] = true; };
  document.getElementById('rightBtn').onmouseup = () => { keys['ArrowRight'] = false; };
  document.getElementById('fireBtn').onclick = fireLaser;

  function update() {
    if (!gameActive) return;

    // Player move
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.x = Math.max(10, player.x - player.speed);
    if (keys['ArrowRight'] || keys['d'] || keys['D']) player.x = Math.min(canvas.width - player.width - 10, player.x + player.speed);

    // Player Lasers
    for (let i = lasers.length - 1; i >= 0; i--) {
      lasers[i].y -= lasers[i].speed;
      if (lasers[i].y < 0) {
        lasers.splice(i, 1);
        continue;
      }
      // Collision with aliens
      for (let a of aliens) {
        if (a.alive && lasers[i] && lasers[i].x >= a.x && lasers[i].x <= a.x + a.width && lasers[i].y >= a.y && lasers[i].y <= a.y + a.height) {
          a.alive = false;
          lasers.splice(i, 1);
          score += 20 * (4 - a.row);
          scoreEl.innerText = score;
          break;
        }
      }
    }

    // Alien Lasers
    for (let i = alienLasers.length - 1; i >= 0; i--) {
      alienLasers[i].y += alienLasers[i].speed;
      if (alienLasers[i].y > canvas.height) {
        alienLasers.splice(i, 1);
        continue;
      }
      // Hit player
      if (
        alienLasers[i].x >= player.x &&
        alienLasers[i].x <= player.x + player.width &&
        alienLasers[i].y >= player.y &&
        alienLasers[i].y <= player.y + player.height
      ) {
        alienLasers.splice(i, 1);
        lives--;
        livesEl.innerText = lives;
        if (lives <= 0) {
          gameActive = false;
          overlay.querySelector('#title').innerText = 'FLEET DESTROYED';
          overlay.querySelector('#sub').innerText = 'Final Score: ' + score;
          startBtn.innerText = 'REDEPLOY';
          overlay.classList.remove('hidden');
        }
      }
    }

    // Move aliens
    let shouldDrop = false;
    for (let a of aliens) {
      if (!a.alive) continue;
      a.x += alienDir * alienSpeed;
      if (a.x + a.width >= canvas.width - 10 || a.x <= 10) {
        shouldDrop = true;
      }
    }

    if (shouldDrop) {
      alienDir *= -1;
      for (let a of aliens) {
        if (a.alive) {
          a.y += 14;
          if (a.y + a.height >= player.y) {
            gameActive = false;
            overlay.querySelector('#title').innerText = 'EARTH INVADED';
            overlay.classList.remove('hidden');
          }
        }
      }
    }

    // Alien shoot
    if (Math.random() < 0.035 && alienLasers.length < 5) {
      const liveAliens = aliens.filter(a => a.alive);
      if (liveAliens.length > 0) {
        const shooter = liveAliens[Math.floor(Math.random() * liveAliens.length)];
        alienLasers.push({ x: shooter.x + shooter.width / 2, y: shooter.y + shooter.height, speed: 4.5 });
      }
    }

    // Check wave clear
    if (aliens.every(a => !a.alive)) {
      wave++;
      waveEl.innerText = wave;
      spawnWave();
    }
  }

  function draw() {
    // Canvas clear
    ctx.fillStyle = '#040406';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = '#ffffff';
    for (let s of stars) {
      ctx.fillRect(s.x, s.y, s.size, s.size);
      s.y += s.speed;
      if (s.y > canvas.height) s.y = 0;
    }

    // Player Ship (vector style)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    // Lasers
    ctx.fillStyle = '#38bdf8';
    for (let l of lasers) {
      ctx.fillRect(l.x - 2, l.y, 4, 10);
    }

    // Alien Lasers
    ctx.fillStyle = '#f43f5e';
    for (let al of alienLasers) {
      ctx.fillRect(al.x - 2, al.y, 4, 8);
    }

    // Aliens
    for (let a of aliens) {
      if (!a.alive) continue;
      ctx.fillStyle = a.row === 0 ? '#ec4899' : a.row === 1 ? '#a855f7' : a.row === 2 ? '#3b82f6' : '#10b981';
      ctx.fillRect(a.x, a.y, a.width, a.height);
      // Eye dots
      ctx.fillStyle = '#000000';
      ctx.fillRect(a.x + 5, a.y + 4, 4, 4);
      ctx.fillRect(a.x + a.width - 9, a.y + 4, 4, 4);
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  spawnWave();
  loop();
</script>
</body>
</html>`
  },
  {
    id: 'flappy-sky',
    title: 'Flappy Helicopter',
    category: 'Arcade',
    description: 'Tap or hold to guide your agile chopper through hazardous neon pillars and conquer the leaderboards.',
    instructions: 'Press Space, click, or tap to elevate altitude. Thread through narrow pipes without clipping edges!',
    controls: [
      { key: 'Space / Click / Touch', action: 'Propel Upward' },
      { key: 'R', action: 'Retry Run' }
    ],
    tags: ['flappy', 'arcade', 'fly', 'reflex'],
    color: '#f59e0b',
    iconName: 'Plane',
    iframeType: 'srcdoc',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Flappy Helicopter</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body {
    background: #0f172a;
    color: #f8fafc;
    font-family: system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 10px;
  }
  .wrap {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    border: 2px solid #334155;
  }
  canvas { display: block; background: #0c1524; cursor: pointer; }
  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
  }
  .overlay.hidden { display: none; }
  .btn {
    background: #f59e0b;
    color: #000;
    border: none;
    padding: 12px 26px;
    border-radius: 8px;
    font-weight: 800;
    font-size: 16px;
    cursor: pointer;
    margin-top: 14px;
  }
</style>
</head>
<body>
<div class="wrap">
  <canvas id="flappyCanvas" width="380" height="480"></canvas>
  <div id="overlay" class="overlay">
    <h2 id="title" style="font-size: 26px; margin-bottom: 6px;">FLAPPY COPTER</h2>
    <p id="sub" style="color: #94a3b8; font-size: 14px;">Click or press Space to ascend</p>
    <button id="startBtn" class="btn">TAKE FLIGHT</button>
  </div>
</div>

<script>
  const canvas = document.getElementById('flappyCanvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');

  let score = 0;
  let highScore = parseInt(localStorage.getItem('flappy_high') || '0', 10);
  let active = false;

  const bird = {
    x: 70,
    y: 200,
    radius: 12,
    gravity: 0.38,
    velocity: 0,
    jump: -6.5
  };

  let pipes = [];
  const PIPE_GAP = 125;
  const PIPE_WIDTH = 55;
  let frame = 0;

  function resetGame() {
    bird.y = 200;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frame = 0;
    active = true;
    overlay.classList.add('hidden');
  }

  function flap() {
    if (!active) return;
    bird.velocity = bird.jump;
  }

  window.addEventListener('keydown', e => {
    if (e.code === 'Space') {
      flap();
      e.preventDefault();
    }
  });
  canvas.addEventListener('mousedown', flap);
  canvas.addEventListener('touchstart', e => { flap(); e.preventDefault(); });
  startBtn.addEventListener('click', resetGame);

  function gameOver() {
    active = false;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('flappy_high', highScore.toString());
    }
    overlay.querySelector('#title').innerText = 'CRASHED!';
    overlay.querySelector('#sub').innerText = 'Score: ' + score + ' | High: ' + highScore;
    startBtn.innerText = 'TRY AGAIN';
    overlay.classList.remove('hidden');
  }

  function loop() {
    ctx.fillStyle = '#0c1524';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (active) {
      frame++;
      bird.velocity += bird.gravity;
      bird.y += bird.velocity;

      // Floor / ceiling collision
      if (bird.y + bird.radius >= canvas.height - 15 || bird.y - bird.radius <= 0) {
        gameOver();
      }

      // Spawn pipes
      if (frame % 85 === 0) {
        const topHeight = Math.floor(Math.random() * (canvas.height - PIPE_GAP - 100)) + 40;
        pipes.push({
          x: canvas.width,
          top: topHeight,
          bottom: topHeight + PIPE_GAP,
          passed: false
        });
      }

      // Move & check pipes
      for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= 2.6;

        // Collision check
        if (
          bird.x + bird.radius > p.x &&
          bird.x - bird.radius < p.x + PIPE_WIDTH &&
          (bird.y - bird.radius < p.top || bird.y + bird.radius > p.bottom)
        ) {
          gameOver();
        }

        // Passed pipe
        if (!p.passed && p.x + PIPE_WIDTH < bird.x) {
          p.passed = true;
          score++;
        }

        if (p.x + PIPE_WIDTH < 0) {
          pipes.splice(i, 1);
        }
      }
    }

    // Draw pipes
    for (let p of pipes) {
      ctx.fillStyle = '#10b981';
      // Top pipe
      ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);
      // Bottom pipe
      ctx.fillRect(p.x, p.bottom, PIPE_WIDTH, canvas.height - p.bottom);
      // Cap details
      ctx.fillStyle = '#059669';
      ctx.fillRect(p.x - 3, p.top - 12, PIPE_WIDTH + 6, 12);
      ctx.fillRect(p.x - 3, p.bottom, PIPE_WIDTH + 6, 12);
    }

    // Ground
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, canvas.height - 15, canvas.width, 15);

    // Draw Copter
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(Math.min(Math.PI / 4, Math.max(-Math.PI / 4, bird.velocity * 0.08)));

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
    ctx.fill();

    // Rotor blade
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-bird.radius * 1.3, -bird.radius - 4, bird.radius * 2.6, 3);

    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(5, -2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Score on screen
    if (active) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(score, canvas.width / 2, 60);
    }

    requestAnimationFrame(loop);
  }

  loop();
</script>
</body>
</html>`
  },
  {
    id: '2048-neon',
    title: '2048 Neon Pulse',
    category: 'Puzzle',
    description: 'Slide numbers together to combine twin tiles and strive for the elusive 2048 milestone.',
    instructions: 'Use Arrow Keys or WASD to slide all tiles in one direction. Identical numbers merge into their sum!',
    controls: [
      { key: 'Arrow Keys / WASD', action: 'Slide Grid' },
      { key: 'R', action: 'New Game' }
    ],
    tags: ['2048', 'puzzle', 'math', 'strategy'],
    color: '#eab308',
    iconName: 'Grid',
    iframeType: 'srcdoc',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>2048 Neon</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body {
    background: #0f172a;
    color: #f8fafc;
    font-family: system-ui, -apple-system, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 12px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    width: 360px;
    margin-bottom: 12px;
    align-items: center;
  }
  .score-card {
    background: #1e293b;
    padding: 6px 14px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 14px;
    border: 1px solid #334155;
  }
  .btn {
    background: #eab308;
    color: #713f12;
    border: none;
    padding: 7px 16px;
    font-weight: bold;
    border-radius: 6px;
    cursor: pointer;
  }
  .grid {
    width: 360px;
    height: 360px;
    background: #1e293b;
    border-radius: 12px;
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 10px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.4);
  }
  .cell {
    background: #334155;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 24px;
    color: #f8fafc;
    transition: transform 0.1s;
  }
  .val-2 { background: #38bdf8; color: #082f49; }
  .val-4 { background: #818cf8; color: #1e1b4b; }
  .val-8 { background: #c084fc; color: #3b0764; }
  .val-16 { background: #f472b6; color: #500724; }
  .val-32 { background: #fb7185; color: #4c0519; }
  .val-64 { background: #f87171; color: #450a0a; }
  .val-128 { background: #fb923c; color: #431407; font-size: 20px; }
  .val-256 { background: #facc15; color: #422006; font-size: 20px; box-shadow: 0 0 10px rgba(250,204,21,0.5); }
  .val-512 { background: #a3e635; color: #1a2e05; font-size: 20px; }
  .val-1024 { background: #34d399; color: #022c22; font-size: 18px; }
  .val-2048 { background: #2dd4bf; color: #042f2e; font-size: 18px; box-shadow: 0 0 20px #2dd4bf; }
  .controls-hint {
    margin-top: 14px;
    color: #94a3b8;
    font-size: 13px;
  }
</style>
</head>
<body>
<div class="header">
  <div class="score-card">SCORE: <span id="score" style="color: #facc15;">0</span></div>
  <div class="score-card">BEST: <span id="best" style="color: #38bdf8;">0</span></div>
  <button id="resetBtn" class="btn">RESET</button>
</div>

<div class="grid" id="gridContainer"></div>

<div class="controls-hint">Use Arrow Keys or Swipe on Touchscreen</div>

<script>
  let board = Array(4).fill(null).map(() => Array(4).fill(0));
  let score = 0;
  let best = parseInt(localStorage.getItem('2048_best') || '0', 10);
  const gridEl = document.getElementById('gridContainer');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  bestEl.innerText = best;

  function init() {
    board = Array(4).fill(null).map(() => Array(4).fill(0));
    score = 0;
    scoreEl.innerText = score;
    addRandom();
    addRandom();
    render();
  }

  function addRandom() {
    const empty = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) empty.push({ r, c });
      }
    }
    if (empty.length > 0) {
      const spot = empty[Math.floor(Math.random() * empty.length)];
      board[spot.r][spot.c] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  function render() {
    gridEl.innerHTML = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = board[r][c];
        const cell = document.createElement('div');
        cell.className = 'cell' + (val > 0 ? ' val-' + val : '');
        cell.innerText = val > 0 ? val : '';
        gridEl.appendChild(cell);
      }
    }
    scoreEl.innerText = score;
    if (score > best) {
      best = score;
      localStorage.setItem('2048_best', best.toString());
      bestEl.innerText = best;
    }
  }

  function slide(row) {
    let arr = row.filter(val => val);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        score += arr[i];
        arr.splice(i + 1, 1);
      }
    }
    while (arr.length < 4) arr.push(0);
    return arr;
  }

  function moveLeft() {
    let changed = false;
    for (let r = 0; r < 4; r++) {
      const original = [...board[r]];
      board[r] = slide(board[r]);
      if (board[r].some((val, idx) => val !== original[idx])) changed = true;
    }
    return changed;
  }

  function rotate() {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        newBoard[c][3 - r] = board[r][c];
      }
    }
    board = newBoard;
  }

  function move(direction) {
    let changed = false;
    if (direction === 'left') changed = moveLeft();
    if (direction === 'right') { rotate(); rotate(); changed = moveLeft(); rotate(); rotate(); }
    if (direction === 'up') { rotate(); rotate(); rotate(); changed = moveLeft(); rotate(); }
    if (direction === 'down') { rotate(); changed = moveLeft(); rotate(); rotate(); rotate(); }

    if (changed) {
      addRandom();
      render();
    }
  }

  window.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') move('left');
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') move('right');
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') move('up');
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') move('down');
  });

  // Touch gestures
  let touchStartX = 0, touchStartY = 0;
  window.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });
  window.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30) move('right');
      else if (dx < -30) move('left');
    } else {
      if (dy > 30) move('down');
      else if (dy < -30) move('up');
    }
  });

  document.getElementById('resetBtn').onclick = init;
  init();
</script>
</body>
</html>`
  },
  {
    id: 'minesweeper-retro',
    title: 'Minesweeper Classic',
    category: 'Puzzle',
    description: 'Uncover hidden minefields using deductive logic and numeric proximity clues.',
    instructions: 'Click tiles to uncover. Right-click or toggle Flag mode to mark suspected mines.',
    controls: [
      { key: 'Left Click', action: 'Uncover Square' },
      { key: 'Right Click', action: 'Plant Flag' },
      { key: 'Flag Toggle', action: 'Mobile Flag Mode' }
    ],
    tags: ['minesweeper', 'puzzle', 'classic', 'logic'],
    color: '#0284c7',
    iconName: 'ShieldAlert',
    iframeType: 'srcdoc',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Minesweeper Classic</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body {
    background: #0f172a;
    color: #f8fafc;
    font-family: monospace;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 12px;
  }
  .hud {
    display: flex;
    justify-content: space-between;
    width: 320px;
    background: #1e293b;
    padding: 10px 14px;
    border-radius: 8px 8px 0 0;
    align-items: center;
    border: 2px solid #334155;
    border-bottom: none;
  }
  .counter {
    background: #000;
    color: #ef4444;
    font-size: 20px;
    font-weight: bold;
    padding: 4px 8px;
    border-radius: 4px;
    letter-spacing: 2px;
  }
  .face-btn {
    font-size: 22px;
    background: #334155;
    border: 1px solid #475569;
    border-radius: 6px;
    cursor: pointer;
    width: 38px;
    height: 38px;
  }
  .board {
    display: grid;
    grid-template-columns: repeat(9, 35px);
    grid-template-rows: repeat(9, 35px);
    gap: 1px;
    background: #334155;
    border: 2px solid #334155;
    border-radius: 0 0 8px 8px;
  }
  .tile {
    background: #1e293b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
  }
  .tile.revealed { background: #0f172a; cursor: default; }
  .tile.c-1 { color: #38bdf8; }
  .tile.c-2 { color: #4ade80; }
  .tile.c-3 { color: #f87171; }
  .tile.c-4 { color: #818cf8; }
  .tile.mine { background: #ef4444; }
  .flag-mode-btn {
    margin-top: 12px;
    background: #1e293b;
    color: #e2e8f0;
    border: 1px solid #475569;
    padding: 8px 16px;
    border-radius: 6px;
    font-family: inherit;
    font-size: 14px;
    cursor: pointer;
  }
  .flag-mode-btn.active {
    background: #ef4444;
    color: #fff;
    border-color: #dc2626;
  }
</style>
</head>
<body>
<div class="hud">
  <div class="counter" id="mineCount">010</div>
  <button class="face-btn" id="faceBtn">🙂</button>
  <div class="counter" id="timer">000</div>
</div>

<div class="board" id="board"></div>

<button class="flag-mode-btn" id="flagModeBtn">🚩 Flag Mode: OFF</button>

<script>
  const ROWS = 9;
  const COLS = 9;
  const MINES = 10;

  let grid = [];
  let gameOver = false;
  let timerVal = 0;
  let timerInterval = null;
  let flagMode = false;

  const boardEl = document.getElementById('board');
  const mineCountEl = document.getElementById('mineCount');
  const timerEl = document.getElementById('timer');
  const faceBtn = document.getElementById('faceBtn');
  const flagModeBtn = document.getElementById('flagModeBtn');

  function initGame() {
    clearInterval(timerInterval);
    timerVal = 0;
    timerEl.innerText = '000';
    gameOver = false;
    faceBtn.innerText = '🙂';
    grid = [];

    for (let r = 0; r < ROWS; r++) {
      grid[r] = [];
      for (let c = 0; c < COLS; c++) {
        grid[r][c] = { r, c, mine: false, revealed: false, flagged: false, count: 0 };
      }
    }

    // Plant mines
    let planted = 0;
    while (planted < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (!grid[r][c].mine) {
        grid[r][c].mine = true;
        planted++;
      }
    }

    // Calculate proximity numbers
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!grid[r][c].mine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc].mine) {
                count++;
              }
            }
          }
          grid[r][c].count = count;
        }
      }
    }

    updateMineDisplay();
    render();
  }

  function startTimer() {
    if (!timerInterval) {
      timerInterval = setInterval(() => {
        timerVal = Math.min(timerVal + 1, 999);
        timerEl.innerText = timerVal.toString().padStart(3, '0');
      }, 1000);
    }
  }

  function updateMineDisplay() {
    let flags = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c].flagged) flags++;
      }
    }
    const remaining = Math.max(0, MINES - flags);
    mineCountEl.innerText = remaining.toString().padStart(3, '0');
  }

  function reveal(r, c) {
    if (gameOver || grid[r][c].revealed || grid[r][c].flagged) return;
    startTimer();

    grid[r][c].revealed = true;
    if (grid[r][c].mine) {
      gameOver = true;
      faceBtn.innerText = '💀';
      clearInterval(timerInterval);
      // Reveal all mines
      for (let ro = 0; ro < ROWS; ro++) {
        for (let co = 0; co < COLS; co++) {
          if (grid[ro][co].mine) grid[ro][co].revealed = true;
        }
      }
    } else if (grid[r][c].count === 0) {
      // Flood fill empty
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            reveal(nr, nc);
          }
        }
      }
    }

    checkWin();
    render();
  }

  function toggleFlag(r, c) {
    if (gameOver || grid[r][c].revealed) return;
    grid[r][c].flagged = !grid[r][c].flagged;
    updateMineDisplay();
    render();
  }

  function checkWin() {
    let unrevealedSafe = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!grid[r][c].mine && !grid[r][c].revealed) unrevealedSafe++;
      }
    }
    if (unrevealedSafe === 0) {
      gameOver = true;
      faceBtn.innerText = '😎';
      clearInterval(timerInterval);
    }
  }

  function render() {
    boardEl.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = grid[r][c];
        const el = document.createElement('div');
        el.className = 'tile' + (cell.revealed ? ' revealed' : '');

        if (cell.revealed) {
          if (cell.mine) {
            el.classList.add('mine');
            el.innerText = '💣';
          } else if (cell.count > 0) {
            el.classList.add('c-' + cell.count);
            el.innerText = cell.count;
          }
        } else if (cell.flagged) {
          el.innerText = '🚩';
        }

        el.addEventListener('click', () => {
          if (flagMode) toggleFlag(r, c);
          else reveal(r, c);
        });

        el.addEventListener('contextmenu', e => {
          e.preventDefault();
          toggleFlag(r, c);
        });

        boardEl.appendChild(el);
      }
    }
  }

  flagModeBtn.onclick = () => {
    flagMode = !flagMode;
    flagModeBtn.className = 'flag-mode-btn' + (flagMode ? ' active' : '');
    flagModeBtn.innerText = flagMode ? '🚩 Flag Mode: ON' : '🚩 Flag Mode: OFF';
  };

  faceBtn.onclick = initGame;
  initGame();
</script>
</body>
</html>`
  }
];
