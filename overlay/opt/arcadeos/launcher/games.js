/* ArcadeOS builtin canvas games — STACK, BREAK, ORBIT, NIBBLE */
window.ArcadeGames = (function () {
  function loop(canvas, update, draw, onKey) {
    const ctx = canvas.getContext("2d");
    let raf = 0, last = performance.now(), alive = true;
    const kd = (e) => onKey(e, true);
    const ku = (e) => onKey(e, false);
    function resize() {
      const w = canvas.parentElement ? canvas.parentElement.clientWidth : innerWidth;
      const h = canvas.parentElement ? canvas.parentElement.clientHeight : innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, (w * dpr) | 0);
      canvas.height = Math.max(1, (h * dpr) | 0);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function frame(now) {
      if (!alive) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      update(dt);
      draw(ctx, canvas.clientWidth, canvas.clientHeight);
      raf = requestAnimationFrame(frame);
    }
    addEventListener("keydown", kd);
    addEventListener("keyup", ku);
    addEventListener("resize", resize);
    resize();
    raf = requestAnimationFrame(frame);
    return {
      destroy() {
        alive = false;
        cancelAnimationFrame(raf);
        removeEventListener("keydown", kd);
        removeEventListener("keyup", ku);
        removeEventListener("resize", resize);
      },
    };
  }
  function bg(ctx, w, h) { ctx.fillStyle = "#07080c"; ctx.fillRect(0, 0, w, h); }
  function hud(ctx, w, lines) {
    ctx.save();
    ctx.font = "500 13px sans-serif";
    ctx.fillStyle = "#8b909c";
    ctx.textBaseline = "top";
    lines.forEach((l, i) => ctx.fillText(l, 20, 18 + i * 20));
    ctx.textAlign = "right";
    ctx.fillText("Esc · quitter", w - 20, 18);
    ctx.restore();
  }
  function overlay(ctx, w, h, title) {
    ctx.fillStyle = "rgba(7,8,12,0.72)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f0f1f4";
    ctx.textAlign = "center";
    ctx.font = "600 28px sans-serif";
    ctx.fillText(title, w / 2, h / 2 - 8);
    ctx.font = "500 14px sans-serif";
    ctx.fillStyle = "#8b909c";
    ctx.fillText("Esc pour revenir", w / 2, h / 2 + 22);
  }

  function stack(canvas, hooks) {
    const COLS = 10, ROWS = 20;
    const PIECES = [
      { c: "#c5cdd8", s: [[1,1,1,1]] },
      { c: "#9aa3b0", s: [[1,1],[1,1]] },
      { c: "#d7dde6", s: [[0,1,0],[1,1,1]] },
      { c: "#b7c0ca", s: [[1,1,0],[0,1,1]] },
      { c: "#8e98a6", s: [[0,1,1],[1,1,0]] },
      { c: "#cfd5dc", s: [[1,0,0],[1,1,1]] },
      { c: "#a8b1bc", s: [[0,0,1],[1,1,1]] },
    ];
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    function rot(m) {
      const h = m.length, w = m[0].length;
      const o = Array.from({ length: w }, () => Array(h).fill(0));
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) o[x][h - 1 - y] = m[y][x];
      return o;
    }
    let bag = [0,1,2,3,4,5,6].sort(() => Math.random() - 0.5);
    function spawn() {
      if (bag.length < 2) bag = bag.concat([0,1,2,3,4,5,6].sort(() => Math.random() - 0.5));
      const id = bag.shift();
      return { x: 3, y: 0, s: PIECES[id].s.map((r) => r.slice()), c: PIECES[id].c };
    }
    let piece = spawn(), acc = 0, g = 0.7, score = 0, lines = 0, over = false;
    const held = {};
    function hits(p, dx, dy, s) {
      s = s || p.s;
      for (let y = 0; y < s.length; y++) for (let x = 0; x < s[0].length; x++) {
        if (!s[y][x]) continue;
        const nx = p.x + dx + x, ny = p.y + dy + y;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && grid[ny][nx]) return true;
      }
      return false;
    }
    function lock() {
      for (let y = 0; y < piece.s.length; y++) for (let x = 0; x < piece.s[0].length; x++) {
        if (!piece.s[y][x]) continue;
        const ny = piece.y + y, nx = piece.x + x;
        if (ny < 0) { over = true; return; }
        grid[ny][nx] = { c: piece.c };
      }
      let cleared = 0;
      for (let y = ROWS - 1; y >= 0; y--) if (grid[y].every(Boolean)) {
        grid.splice(y, 1); grid.unshift(Array(COLS).fill(0)); cleared++; y++;
      }
      lines += cleared;
      score += [0,100,300,500,800][cleared] || 0;
      piece = spawn();
      if (hits(piece, 0, 0)) over = true;
    }
    return loop(canvas, function (dt) {
      if (over) return;
      if (held.ArrowLeft && !hits(piece, -1, 0)) { piece.x--; held.ArrowLeft = false; }
      if (held.ArrowRight && !hits(piece, 1, 0)) { piece.x++; held.ArrowRight = false; }
      acc += dt;
      const step = held.ArrowDown ? g / 12 : g;
      while (acc >= step) {
        acc -= step;
        if (!hits(piece, 0, 1)) piece.y++; else lock();
      }
    }, function (ctx, w, h) {
      bg(ctx, w, h);
      const cell = Math.floor(Math.min((w - 48) / COLS, (h - 80) / ROWS));
      const ox = ((w - cell * COLS) / 2) | 0, oy = ((h - cell * ROWS) / 2 + 10) | 0;
      ctx.fillStyle = "#12141a";
      ctx.fillRect(ox - 6, oy - 6, cell * COLS + 12, cell * ROWS + 12);
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (grid[y][x]) {
        ctx.fillStyle = grid[y][x].c;
        ctx.fillRect(ox + x * cell + 1, oy + y * cell + 1, cell - 2, cell - 2);
      }
      for (let y = 0; y < piece.s.length; y++) for (let x = 0; x < piece.s[0].length; x++) if (piece.s[y][x]) {
        ctx.fillStyle = piece.c;
        ctx.fillRect(ox + (piece.x + x) * cell + 1, oy + (piece.y + y) * cell + 1, cell - 2, cell - 2);
      }
      hud(ctx, w, ["STACK", "Score " + score, "Lignes " + lines]);
      if (over) overlay(ctx, w, h, "Fin de partie");
    }, function (e, down) {
      if (e.code === "Escape" && down) hooks.onExit();
      if (["ArrowLeft","ArrowRight","ArrowDown","ArrowUp","Space"].indexOf(e.code) >= 0) e.preventDefault();
      held[e.code] = down;
      if (!down || over) return;
      if (e.code === "ArrowUp") {
        const s = rot(piece.s);
        if (!hits(piece, 0, 0, s)) piece.s = s;
      }
      if (e.code === "Space") { while (!hits(piece, 0, 1)) piece.y++; lock(); }
    });
  }

  function breakout(canvas, hooks) {
    const COLS = 10, ROWS = 5;
    let bricks = [], px = 0.5, ball = { x: 0.5, y: 0.78, vx: 0.22, vy: -0.34 };
    let lives = 3, score = 0, started = false, over = false, won = false, W = 800, H = 500;
    const held = {};
    function layout(w, h) {
      W = w; H = h;
      const gap = 8, bw = (w - 48 - gap * (COLS - 1)) / COLS;
      bricks = [];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++)
        bricks.push({ x: 24 + c * (bw + gap), y: 70 + r * 26, w: bw, h: 18, live: true });
    }
    return loop(canvas, function (dt) {
      const w = W, h = H, paddleW = Math.max(90, w * 0.14), paddleY = h - 36;
      if (held.ArrowLeft || held.KeyA) px -= 0.7 * dt;
      if (held.ArrowRight || held.KeyD) px += 0.7 * dt;
      px = Math.max(paddleW / 2 / w, Math.min(1 - paddleW / 2 / w, px));
      if (!started || over || won) { if (!started) { ball.x = px; ball.y = (paddleY - 14) / h; } return; }
      ball.x += ball.vx * dt; ball.y += ball.vy * dt;
      const r = 7, bx = ball.x * w, by = ball.y * h;
      if (bx < r) { ball.x = r / w; ball.vx *= -1; }
      if (bx > w - r) { ball.x = (w - r) / w; ball.vx *= -1; }
      if (by < r + 8) { ball.y = (r + 8) / h; ball.vy *= -1; }
      const pLeft = px * w - paddleW / 2;
      if (by + r >= paddleY && bx >= pLeft && bx <= pLeft + paddleW && ball.vy > 0) {
        ball.vy = -Math.abs(ball.vy) * 1.03;
        ball.vx = ((bx - (pLeft + paddleW / 2)) / (paddleW / 2)) * 0.55;
      }
      bricks.forEach(function (b) {
        if (!b.live) return;
        if (bx + r > b.x && bx - r < b.x + b.w && by + r > b.y && by - r < b.y + b.h) {
          b.live = false; ball.vy *= -1; score += 50;
        }
      });
      if (bricks.every(function (b) { return !b.live; })) won = true;
      if (by > h + 20) {
        lives--; started = false; ball = { x: px, y: 0.78, vx: 0.22, vy: -0.34 };
        if (lives <= 0) over = true;
      }
    }, function (ctx, w, h) {
      if (!bricks.length) layout(w, h);
      bg(ctx, w, h);
      const paddleW = Math.max(90, w * 0.14);
      bricks.forEach(function (b) { if (!b.live) return; ctx.fillStyle = "#c5cdd8"; ctx.fillRect(b.x, b.y, b.w, b.h); });
      ctx.fillStyle = "#f0f1f4";
      ctx.fillRect(px * w - paddleW / 2, h - 36, paddleW, 12);
      ctx.beginPath(); ctx.arc(ball.x * w, ball.y * h, 7, 0, Math.PI * 2); ctx.fill();
      hud(ctx, w, ["BREAK", "Score " + score, "Vies " + lives]);
      if (over) overlay(ctx, w, h, "Fin de partie");
      if (won) overlay(ctx, w, h, "Terrain clean");
    }, function (e, down) {
      if (e.code === "Escape" && down) hooks.onExit();
      held[e.code] = down;
      if (down && (e.code === "Space" || e.code === "Enter")) started = true;
      if (["ArrowLeft","ArrowRight","Space"].indexOf(e.code) >= 0) e.preventDefault();
    });
  }

  function orbit(canvas, hooks) {
    let ship = { x: 0.5, y: 0.5, vx: 0, vy: 0, a: -Math.PI / 2 };
    let rocks = [], shots = [], score = 0, lives = 3, cool = 0, over = false, inv = 0, W = 800, H = 500;
    const held = {};
    function wrap(b) {
      if (b.x < -0.05) b.x += 1.1; if (b.x > 1.05) b.x -= 1.1;
      if (b.y < -0.05) b.y += 1.1; if (b.y > 1.05) b.y -= 1.1;
    }
    function reset() {
      rocks = [];
      for (let i = 0; i < 5; i++) {
        const a = Math.random() * Math.PI * 2;
        rocks.push({ x: Math.cos(a) * 0.4 + 0.5, y: Math.sin(a) * 0.4 + 0.5, vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12, r: 30, rot: 0 });
      }
    }
    reset();
    return loop(canvas, function (dt) {
      if (over) return;
      if (held.ArrowLeft || held.KeyA) ship.a -= 3.2 * dt;
      if (held.ArrowRight || held.KeyD) ship.a += 3.2 * dt;
      if (held.ArrowUp || held.KeyW) { ship.vx += Math.cos(ship.a) * 0.55 * dt; ship.vy += Math.sin(ship.a) * 0.55 * dt; }
      ship.vx *= 0.995; ship.vy *= 0.995; ship.x += ship.vx * dt; ship.y += ship.vy * dt; wrap(ship);
      cool -= dt; inv -= dt;
      if (held.Space && cool <= 0) {
        cool = 0.18;
        shots.push({ x: ship.x, y: ship.y, vx: Math.cos(ship.a) * 0.9 + ship.vx, vy: Math.sin(ship.a) * 0.9 + ship.vy });
      }
      shots.forEach(function (s) { s.x += s.vx * dt; s.y += s.vy * dt; });
      shots = shots.filter(function (s) { return s.x > -0.1 && s.x < 1.1 && s.y > -0.1 && s.y < 1.1; });
      rocks.forEach(function (r) { r.x += r.vx * dt; r.y += r.vy * dt; r.rot += dt; wrap(r); });
      const next = [];
      rocks.forEach(function (r) {
        let hit = false;
        shots.forEach(function (s) {
          const dx = (r.x - s.x) * W, dy = (r.y - s.y) * H;
          if (dx * dx + dy * dy < (r.r + 3) * (r.r + 3)) {
            hit = true; s.x = -9; score += 20;
            if (r.r > 16) {
              next.push({ x: r.x, y: r.y, vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2, r: r.r * 0.55, rot: 0 });
              next.push({ x: r.x, y: r.y, vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2, r: r.r * 0.55, rot: 0 });
            }
          }
        });
        if (!hit) next.push(r);
      });
      rocks = next;
      if (!rocks.length) reset();
      if (inv <= 0) {
        rocks.forEach(function (r) {
          const dx = (r.x - ship.x) * W, dy = (r.y - ship.y) * H;
          if (dx * dx + dy * dy < (r.r + 8) * (r.r + 8)) {
            lives--; inv = 1.6; ship = { x: 0.5, y: 0.5, vx: 0, vy: 0, a: -Math.PI / 2 };
            if (lives <= 0) over = true;
          }
        });
      }
    }, function (ctx, w, h) {
      W = w; H = h; bg(ctx, w, h);
      ctx.strokeStyle = "#c5cdd8"; ctx.lineWidth = 1.5;
      rocks.forEach(function (r) {
        ctx.beginPath();
        for (let i = 0; i <= 8; i++) {
          const ang = (i / 8) * Math.PI * 2 + r.rot;
          const rr = r.r * (i % 2 ? 0.86 : 1);
          const x = r.x * w + Math.cos(ang) * rr, y = r.y * h + Math.sin(ang) * rr;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      ctx.fillStyle = "#f0f1f4";
      shots.forEach(function (s) { ctx.fillRect(s.x * w - 2, s.y * h - 2, 4, 4); });
      ctx.save(); ctx.translate(ship.x * w, ship.y * h); ctx.rotate(ship.a);
      ctx.globalAlpha = inv > 0 && ((inv * 10) | 0) % 2 === 0 ? 0.35 : 1;
      ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-9, 8); ctx.lineTo(-5, 0); ctx.lineTo(-9, -8); ctx.closePath();
      ctx.strokeStyle = "#f0f1f4"; ctx.stroke(); ctx.restore();
      hud(ctx, w, ["ORBIT", "Score " + score, "Vies " + lives]);
      if (over) overlay(ctx, w, h, "Vaisseau perdu");
    }, function (e, down) {
      if (e.code === "Escape" && down) hooks.onExit();
      held[e.code] = down;
      if (["ArrowLeft","ArrowRight","ArrowUp","Space"].indexOf(e.code) >= 0) e.preventDefault();
    });
  }

  function nibble(canvas, hooks) {
    const COLS = 24, ROWS = 16;
    let snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
    let dir = { x: 1, y: 0 }, pending = { x: 1, y: 0 }, food = { x: 14, y: 8 };
    let acc = 0, speed = 9, score = 0, over = false;
    function place() {
      for (let i = 0; i < 200; i++) {
        const x = (Math.random() * COLS) | 0, y = (Math.random() * ROWS) | 0;
        if (!snake.some(function (s) { return s.x === x && s.y === y; })) { food = { x: x, y: y }; return; }
      }
    }
    return loop(canvas, function (dt) {
      if (over) return;
      acc += dt;
      const step = 1 / speed;
      while (acc >= step) {
        acc -= step; dir = pending;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS || snake.some(function (s) { return s.x === head.x && s.y === head.y; })) {
          over = true; return;
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) { score += 10; speed = Math.min(18, speed + 0.25); place(); }
        else snake.pop();
      }
    }, function (ctx, w, h) {
      bg(ctx, w, h);
      const cell = Math.floor(Math.min((w - 48) / COLS, (h - 80) / ROWS));
      const ox = ((w - cell * COLS) / 2) | 0, oy = ((h - cell * ROWS) / 2 + 10) | 0;
      ctx.fillStyle = "#12141a";
      ctx.fillRect(ox - 6, oy - 6, cell * COLS + 12, cell * ROWS + 12);
      ctx.fillStyle = "#c5cdd8";
      ctx.fillRect(ox + food.x * cell + 3, oy + food.y * cell + 3, cell - 6, cell - 6);
      snake.forEach(function (s, i) {
        ctx.fillStyle = i === 0 ? "#f0f1f4" : "#9aa3b0";
        ctx.fillRect(ox + s.x * cell + 1, oy + s.y * cell + 1, cell - 2, cell - 2);
      });
      hud(ctx, w, ["NIBBLE", "Score " + score, "Taille " + snake.length]);
      if (over) overlay(ctx, w, h, "Fin de partie");
    }, function (e, down) {
      if (!down) return;
      if (e.code === "Escape") hooks.onExit();
      const map = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, KeyW: { x: 0, y: -1 }, KeyS: { x: 0, y: 1 }, KeyA: { x: -1, y: 0 }, KeyD: { x: 1, y: 0 } };
      const n = map[e.code];
      if (n) { e.preventDefault(); if (n.x !== -dir.x || n.y !== -dir.y) pending = n; }
    });
  }

  const starters = { stack: stack, breakout: breakout, orbit: orbit, nibble: nibble };

  return {
    start(id, canvas, hooks) {
      const fn = starters[id] || stack;
      return fn(canvas, hooks);
    },
  };
})();
