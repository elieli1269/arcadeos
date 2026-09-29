(function () {
  const native = Boolean(window.arcadeosNative);
  const games = [
    { id: "stack", title: "STACK", genre: "Puzzle", blurb: "Sept pièces. Une grille. Les lignes disparaissent.", native: false },
    { id: "breakout", title: "BREAK", genre: "Arcade", blurb: "Casse chaque brique. La balle accélère.", native: false },
    { id: "orbit", title: "ORBIT", genre: "Shooter", blurb: "Astéroïdes, wrap écran, un vaisseau.", native: false },
    { id: "nibble", title: "NIBBLE", genre: "Arcade", blurb: "Grandis. Ne te mords pas.", native: false },
    { id: "neverball", title: "Neverball", genre: "Action", blurb: "Incline le monde. La balle cherche la sortie.", native: true, cmd: "neverball" },
    { id: "pingus", title: "Pingus", genre: "Puzzle", blurb: "Des pingouins, des tunnels, un timing serré.", native: true, cmd: "pingus" },
    { id: "lbreakout2", title: "LBreakout2", genre: "Arcade", blurb: "Le casse-briques classique, en natif.", native: true, cmd: "lbreakout2" },
  ];

  const els = {
    boot: document.getElementById("boot"),
    library: document.getElementById("library"),
    settings: document.getElementById("settings"),
    game: document.getElementById("game"),
    rail: document.getElementById("rail"),
    featTitle: document.getElementById("feat-title"),
    featBlurb: document.getElementById("feat-blurb"),
    featMeta: document.getElementById("feat-meta"),
    clock: document.getElementById("clock"),
    view: document.getElementById("view-label"),
    canvas: document.getElementById("canvas"),
    power: document.getElementById("power-row"),
  };

  let focus = 0;
  let screen = "boot";
  let running = null;

  function callNative(method, payload) {
    if (window.arcadeos && window.arcadeos.call) window.arcadeos.call(method, payload);
  }

  function tick() {
    els.clock.textContent = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  tick();
  setInterval(tick, 1000);

  function renderRail() {
    els.rail.innerHTML = "";
    games.forEach((g, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "card" + (i === focus ? " focus" : "");
      b.innerHTML = `<div class="tile"></div><strong>${g.title}</strong><span>${g.native ? "Natif · ISO" : "Arcade"}</span>`;
      b.addEventListener("click", () => {
        focus = i;
        renderFeature();
        play();
      });
      b.addEventListener("mouseenter", () => {
        focus = i;
        renderFeature();
      });
      els.rail.appendChild(b);
    });
  }

  function renderFeature() {
    const g = games[focus];
    els.featTitle.textContent = g.title;
    els.featBlurb.textContent = g.blurb;
    els.featMeta.textContent = g.genre + (g.native ? " · natif ISO" : " · intégré");
    renderRail();
  }

  function show(name) {
    screen = name;
    els.library.classList.toggle("hidden", name !== "library");
    els.settings.classList.toggle("hidden", name !== "settings");
    els.game.classList.toggle("hidden", name !== "game");
    els.view.textContent = name === "settings" ? "Système" : name === "game" ? "Jeu" : "Bibliothèque";
  }

  function exitBoot() {
    els.boot.classList.add("hidden");
    show("library");
  }

  function play() {
    const g = games[focus];
    if (g.native) {
      if (native && g.cmd) {
        callNative("launch", g.cmd);
        return;
      }
    }
    if (running && running.destroy) running.destroy();
    show("game");
    running = ArcadeGames.start(g.id, els.canvas, {
      onExit: function () {
        if (running && running.destroy) running.destroy();
        running = null;
        show("library");
      },
    });
  }

  document.getElementById("btn-play").addEventListener("click", play);
  document.getElementById("btn-settings").addEventListener("click", function () {
    show("settings");
  });
  document.getElementById("btn-back").addEventListener("click", function () {
    show("library");
  });
  els.boot.addEventListener("click", exitBoot);
  setTimeout(exitBoot, 2200);

  if (native) {
    els.power.innerHTML =
      '<button type="button" class="primary" id="btn-reboot">Redémarrer</button>' +
      '<button type="button" class="ghost" id="btn-off">Éteindre</button>' +
      '<button type="button" class="ghost" id="btn-tty">Terminal</button>';
    document.getElementById("btn-reboot").onclick = function () { callNative("reboot"); };
    document.getElementById("btn-off").onclick = function () { callNative("poweroff"); };
    document.getElementById("btn-tty").onclick = function () { callNative("terminal"); };
  }

  window.addEventListener("keydown", function (e) {
    if (screen === "boot") {
      exitBoot();
      return;
    }
    if (screen === "library") {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        focus = (focus + 1) % games.length;
        renderFeature();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        focus = (focus - 1 + games.length) % games.length;
        renderFeature();
      } else if (e.key === "Enter") play();
      else if (e.key === "s" || e.key === "S") show("settings");
    } else if (screen === "settings" && e.key === "Escape") {
      show("library");
    }
  });

  renderFeature();
})();
