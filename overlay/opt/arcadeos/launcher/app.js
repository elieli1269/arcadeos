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
    store: document.getElementById("store"),
    settings: document.getElementById("settings"),
    game: document.getElementById("game"),
    rail: document.getElementById("rail"),
    storeGrid: document.getElementById("store-grid"),
    storeStatus: document.getElementById("store-status"),
    storeSearch: document.getElementById("store-search"),
    featTitle: document.getElementById("feat-title"),
    featBlurb: document.getElementById("feat-blurb"),
    featMeta: document.getElementById("feat-meta"),
    clock: document.getElementById("clock"),
    view: document.getElementById("view-label"),
    canvas: document.getElementById("canvas"),
    power: document.getElementById("power-row"),
    libCount: document.getElementById("lib-count"),
  };

  let focus = 0;
  let storeFocus = 0;
  let screen = "boot";
  let running = null;
  let query = "";

  function callNative(method, payload) {
    if (window.arcadeos && window.arcadeos.call) window.arcadeos.call(method, payload);
  }

  function tick() {
    els.clock.textContent = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  tick();
  setInterval(tick, 1000);

  function libraryGames() {
    const extra = [];
    ArcadeStore.CATALOG.forEach(function (item) {
      if (!ArcadeStore.isInstalled(item.id)) return;
      if (games.some(function (g) { return g.id === item.id; })) return;
      extra.push({
        id: item.id,
        title: item.title,
        genre: item.genre,
        blurb: item.blurb,
        native: true,
        cmd: item.command,
        fromStore: true,
        pkg: item.package,
      });
    });
    return games.concat(extra);
  }

  function filteredStore() {
    const needle = query.trim().toLowerCase();
    if (!needle) return ArcadeStore.CATALOG;
    return ArcadeStore.CATALOG.filter(function (item) {
      return (
        item.title.toLowerCase().indexOf(needle) >= 0 ||
        item.package.toLowerCase().indexOf(needle) >= 0 ||
        item.genre.toLowerCase().indexOf(needle) >= 0
      );
    });
  }

  function renderRail() {
    const list = libraryGames();
    if (focus >= list.length) focus = 0;
    els.rail.innerHTML = "";
    list.forEach(function (g, i) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "card" + (i === focus ? " focus" : "");
      const tag = g.fromStore ? "Store · installé" : g.native ? "Natif · ISO" : "Arcade";
      b.innerHTML = "<div class=\"tile\"></div><strong>" + g.title + "</strong><span>" + tag + "</span>";
      b.addEventListener("click", function () {
        focus = i;
        renderFeature();
        play();
      });
      b.addEventListener("mouseenter", function () {
        focus = i;
        renderFeature();
      });
      els.rail.appendChild(b);
    });
    if (els.libCount) els.libCount.textContent = list.length + " jeux";
  }

  function renderFeature() {
    const list = libraryGames();
    const g = list[focus] || list[0];
    if (!g) return;
    els.featTitle.textContent = g.title;
    els.featBlurb.textContent = g.blurb;
    els.featMeta.textContent =
      g.genre + (g.fromStore ? " · store" : g.native ? " · natif ISO" : " · intégré");
    renderRail();
  }

  function setStoreStatus(text, kind) {
    if (!text) {
      els.storeStatus.classList.add("hidden");
      els.storeStatus.textContent = "";
      return;
    }
    els.storeStatus.classList.remove("hidden");
    els.storeStatus.className = "store-status " + (kind || "");
    els.storeStatus.textContent = text;
  }

  function renderStore() {
    const cat = filteredStore();
    if (storeFocus >= cat.length) storeFocus = 0;
    els.storeGrid.innerHTML = "";
    cat.forEach(function (item, i) {
      const installed = ArcadeStore.isInstalled(item.id);
      const card = document.createElement("button");
      card.type = "button";
      card.className = "store-card" + (i === storeFocus ? " focus" : "");
      card.innerHTML =
        "<div class=\"tile\"></div>" +
        "<strong>" + item.title + "</strong>" +
        "<span class=\"genre\">" + item.genre + "</span>" +
        "<p>" + item.blurb + "</p>" +
        "<code>apt install " + item.package + " → " + item.command + "</code>" +
        "<span class=\"badge\">" + (installed ? "Installé · Jouer" : "Télécharger & lancer") + "</span>";
      card.addEventListener("click", function () {
        storeFocus = i;
        renderStore();
        onStoreActivate(item);
      });
      card.addEventListener("mouseenter", function () {
        storeFocus = i;
        renderStore();
      });
      els.storeGrid.appendChild(card);
    });
  }

  function onStoreActivate(item) {
    if (ArcadeStore.isBusy()) return;
    if (ArcadeStore.isInstalled(item.id)) {
      ArcadeStore.launch(item);
      setStoreStatus("Lancement de " + item.title + "…", "ok");
      return;
    }
    setStoreStatus("Téléchargement de " + item.title + " (paquet " + item.package + ")… puis lancement auto.", "busy");
    ArcadeStore.installAndRun(item);
    renderStore();
  }

  window.__storeDone = function (result) {
    ArcadeStore.setBusy(false);
    if (!result) return;
    if (result.ok) {
      var list = ArcadeStore.CATALOG.filter(function (c) {
        return ArcadeStore.isInstalled(c.id) || c.id === result.id;
      }).map(function (c) {
        return c.id;
      });
      if (list.indexOf(result.id) < 0) list.push(result.id);
      ArcadeStore.refreshInstalled(list);
      setStoreStatus(result.message || "Installé et lancé.", "ok");
    } else {
      setStoreStatus(result.error || "Échec de l'installation.", "err");
    }
    renderStore();
    renderFeature();
    ArcadeStore.requestStatus();
  };

  window.__storeStatus = function (payload) {
    if (payload && payload.installed) {
      ArcadeStore.refreshInstalled(payload.installed);
      renderStore();
      renderFeature();
    }
  };

  function show(name) {
    screen = name;
    els.library.classList.toggle("hidden", name !== "library");
    els.store.classList.toggle("hidden", name !== "store");
    els.settings.classList.toggle("hidden", name !== "settings");
    els.game.classList.toggle("hidden", name !== "game");
    var dockEl = document.querySelector(".dock");
    var topEl = document.querySelector(".top");
    if (dockEl) dockEl.classList.toggle("hidden", name === "game");
    if (topEl) topEl.classList.toggle("hidden", name === "game");
    var dockLib = document.getElementById("dock-library");
    var dockStore = document.getElementById("dock-store");
    var dockSet = document.getElementById("dock-settings");
    if (dockLib) dockLib.classList.toggle("active", name === "library");
    if (dockStore) dockStore.classList.toggle("active", name === "store");
    if (dockSet) dockSet.classList.toggle("active", name === "settings");
    els.view.textContent =
      name === "settings" ? "Système" : name === "game" ? "Jeu" : name === "store" ? "Arcade Store" : "Bibliothèque";
    if (name === "store") {
      renderStore();
      ArcadeStore.requestStatus();
    }
    if (name === "library") renderFeature();
  }

  function exitBoot() {
    els.boot.classList.add("hidden");
    show("library");
  }

  function play() {
    const list = libraryGames();
    const g = list[focus];
    if (!g) return;
    if (g.native || g.fromStore) {
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
  document.getElementById("btn-settings").addEventListener("click", function () { show("settings"); });
  document.getElementById("btn-store").addEventListener("click", function () { show("store"); });
  document.getElementById("btn-library").addEventListener("click", function () { show("library"); });
  document.getElementById("btn-back").addEventListener("click", function () { show("library"); });
  var dockLibrary = document.getElementById("dock-library");
  var dockStore = document.getElementById("dock-store");
  var dockSettings = document.getElementById("dock-settings");
  if (dockLibrary) dockLibrary.addEventListener("click", function () { show("library"); });
  if (dockStore) dockStore.addEventListener("click", function () { show("store"); });
  if (dockSettings) dockSettings.addEventListener("click", function () { show("settings"); });
  if (els.storeSearch) {
    els.storeSearch.addEventListener("input", function (e) {
      query = e.target.value;
      storeFocus = 0;
      renderStore();
    });
  }
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
    if (e.target && e.target.id === "store-search") {
      if (e.key === "Escape") show("library");
      return;
    }
    if (screen === "library") {
      const list = libraryGames();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        focus = (focus + 1) % list.length;
        renderFeature();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        focus = (focus - 1 + list.length) % list.length;
        renderFeature();
      } else if (e.key === "Enter") play();
      else if (e.key === "s" || e.key === "S") show("store");
    } else if (screen === "store") {
      const cat = filteredStore();
      const n = cat.length;
      if (!n) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        storeFocus = (storeFocus + 1) % n;
        renderStore();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        storeFocus = (storeFocus - 1 + n) % n;
        renderStore();
      } else if (e.key === "Enter") {
        onStoreActivate(cat[storeFocus]);
      } else if (e.key === "Escape") show("library");
    } else if (screen === "settings" && e.key === "Escape") {
      show("library");
    }
  });

  renderFeature();
  if (native) ArcadeStore.requestStatus();
})();
