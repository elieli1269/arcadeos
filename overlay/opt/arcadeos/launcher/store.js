/* Arcade Store — paquets Ubuntu, apt install, lancement auto */
window.ArcadeStore = (function () {
  const CATALOG = [
    { id: "supertux", title: "SuperTux", genre: "Plateforme", blurb: "Tux saute et glisse dans un monde de glace.", package: "supertux", command: "supertux2" },
    { id: "supertuxkart", title: "SuperTuxKart", genre: "Course", blurb: "Kart arcade, circuits, coupes, local.", package: "supertuxkart", command: "supertuxkart" },
    { id: "teeworlds", title: "Teeworlds", genre: "Multi", blurb: "Shooter 2D arcade, local ou réseau.", package: "teeworlds", command: "teeworlds" },
    { id: "minetest", title: "Minetest", genre: "Sandbox", blurb: "Monde voxel open source, créatif ou survie.", package: "minetest", command: "minetest" },
    { id: "0ad", title: "0 A.D.", genre: "Stratégie", blurb: "RTS historique, civilisations antiques.", package: "0ad", command: "0ad" },
    { id: "wesnoth", title: "Battle for Wesnoth", genre: "Stratégie", blurb: "Fantasy au tour par tour, campagnes.", package: "wesnoth", command: "wesnoth" },
    { id: "warzone2100", title: "Warzone 2100", genre: "Stratégie", blurb: "RTS post-apo, recherche, unités.", package: "warzone2100", command: "warzone2100" },
    { id: "freeciv", title: "Freeciv", genre: "Stratégie", blurb: "Civilisation open source.", package: "freeciv-client-gtk3", command: "freeciv-gtk3" },
    { id: "widelands", title: "Widelands", genre: "Stratégie", blurb: "Colonies, ressources, Settlers-like.", package: "widelands", command: "widelands" },
    { id: "megaglest", title: "MegaGlest", genre: "Stratégie", blurb: "RTS 3D, factions, escarmouches.", package: "megaglest", command: "megaglest" },
    { id: "lincity-ng", title: "Lincity-NG", genre: "Simulation", blurb: "Ville, énergie, pollution.", package: "lincity-ng", command: "lincity-ng" },
    { id: "armagetronad", title: "Armagetron", genre: "Course", blurb: "Light cycles façon Tron.", package: "armagetronad", command: "armagetronad" },
    { id: "extremetuxracer", title: "Extreme Tux Racer", genre: "Course", blurb: "Descente libre sur la glace.", package: "extremetuxracer", command: "etr" },
    { id: "xmoto", title: "X-Moto", genre: "Course", blurb: "Moto 2D, physique, niveaux fous.", package: "xmoto", command: "xmoto" },
    { id: "trigger-rally", title: "Trigger Rally", genre: "Course", blurb: "Rallye 3D, poussière, chrono.", package: "trigger-rally", command: "trigger-rally" },
    { id: "tuxfootball", title: "Tux Football", genre: "Sport", blurb: "Foot arcade vue de dessus.", package: "tuxfootball", command: "tuxfootball" },
    { id: "chromium-bsu", title: "Chromium B.S.U.", genre: "Shoot'em up", blurb: "Vaisseaux, tirs, scores.", package: "chromium-bsu", command: "chromium-bsu" },
    { id: "powermanga", title: "PowerManga", genre: "Shoot'em up", blurb: "Vertical shooter rétro.", package: "powermanga", command: "powermanga" },
    { id: "blobwars", title: "Blob Wars", genre: "Action", blurb: "Plateforme-action, missions.", package: "blobwars", command: "blobwars" },
    { id: "astromenace", title: "AstroMenace", genre: "Shoot'em up", blurb: "Space shooter 3D.", package: "astromenace", command: "astromenace" },
    { id: "openarena", title: "OpenArena", genre: "FPS", blurb: "Arena FPS, style Quake 3.", package: "openarena", command: "openarena" },
    { id: "xonotic", title: "Xonotic", genre: "FPS", blurb: "Arena FPS rapide.", package: "xonotic", command: "xonotic" },
    { id: "redeclipse", title: "Red Eclipse", genre: "FPS", blurb: "FPS parkour, armes, cartes.", package: "redeclipse", command: "redeclipse" },
    { id: "bzflag", title: "BZFlag", genre: "FPS", blurb: "Tanks 3D, drapeaux, multi.", package: "bzflag", command: "bzflag" },
    { id: "naev", title: "Naev", genre: "Espace", blurb: "Commerce, combats, exploration.", package: "naev", command: "naev" },
    { id: "endless-sky", title: "Endless Sky", genre: "Espace", blurb: "Sandbox spatial, flotte.", package: "endless-sky", command: "endless-sky" },
    { id: "pioneer", title: "Pioneer", genre: "Espace", blurb: "Simulateur de vol galactique.", package: "pioneer", command: "pioneer" },
    { id: "hedgewars", title: "Hedgewars", genre: "Artillerie", blurb: "Hérissons, roquettes.", package: "hedgewars", command: "hedgewars" },
    { id: "warmux", title: "WarMUX", genre: "Artillerie", blurb: "Vers de terre, roquettes.", package: "warmux", command: "warmux" },
    { id: "atanks", title: "Atomic Tanks", genre: "Artillerie", blurb: "Tanks, trajectoires, destruction.", package: "atanks", command: "atanks" },
    { id: "enigma", title: "Enigma", genre: "Puzzle", blurb: "Billard-puzzle inspiré d’Oxyd.", package: "enigma", command: "enigma" },
    { id: "frozen-bubble", title: "Frozen Bubble", genre: "Puzzle", blurb: "Bulles de couleur, pingouin.", package: "frozen-bubble", command: "frozen-bubble" },
    { id: "ltris", title: "LTris", genre: "Puzzle", blurb: "Tetris classique.", package: "ltris", command: "ltris" },
    { id: "lmarbles", title: "LMarbles", genre: "Puzzle", blurb: "Billes à ranger.", package: "lmarbles", command: "lmarbles" },
    { id: "atomix", title: "Atomix", genre: "Puzzle", blurb: "Molécules à reconstruire.", package: "atomix", command: "atomix" },
    { id: "berusky", title: "Berusky", genre: "Puzzle", blurb: "Scarabées, caisses, labyrinthes.", package: "berusky", command: "berusky" },
    { id: "mirrormagic", title: "Mirror Magic", genre: "Puzzle", blurb: "Lasers, miroirs.", package: "mirrormagic", command: "mirrormagic" },
    { id: "gweled", title: "Gweled", genre: "Puzzle", blurb: "Match-3, gemmes.", package: "gweled", command: "gweled" },
    { id: "quadrapassel", title: "Quadrapassel", genre: "Puzzle", blurb: "Tetris GNOME.", package: "quadrapassel", command: "quadrapassel" },
    { id: "gnome-mahjongg", title: "Mahjongg", genre: "Puzzle", blurb: "Mahjong solitaire.", package: "gnome-mahjongg", command: "gnome-mahjongg" },
    { id: "aisleriot", title: "AisleRiot", genre: "Cartes", blurb: "Solitaires, dizaines de règles.", package: "aisleriot", command: "sol" },
    { id: "pychess", title: "PyChess", genre: "Plateau", blurb: "Échecs, moteurs, analyse.", package: "pychess", command: "pychess" },
    { id: "vitetris", title: "vitetris", genre: "Puzzle", blurb: "Tetris terminal.", package: "vitetris", command: "vitetris" },
    { id: "moon-buggy", title: "Moon Buggy", genre: "Arcade", blurb: "Sauts de cratères sur la Lune.", package: "moon-buggy", command: "moon-buggy" },
    { id: "nethack-console", title: "NetHack", genre: "Rogue", blurb: "Roguelike en console.", package: "nethack-console", command: "nethack" },
    { id: "flare", title: "Flare", genre: "RPG", blurb: "Action-RPG 2D, quêtes, loot.", package: "flare", command: "flare" },
    { id: "manaplus", title: "ManaPlus", genre: "RPG", blurb: "Client MMORPG 2D.", package: "manaplus", command: "manaplus" },
    { id: "scummvm", title: "ScummVM", genre: "Aventure", blurb: "Moteur point-and-click.", package: "scummvm", command: "scummvm" },
    { id: "chocolate-doom", title: "Chocolate Doom", genre: "FPS", blurb: "Doom vanilla.", package: "chocolate-doom", command: "chocolate-doom" },
    { id: "freedoom", title: "Freedoom", genre: "FPS", blurb: "WAD libre compatible Doom.", package: "freedoom", command: "chocolate-doom" },
    { id: "mame", title: "MAME", genre: "Émulateur", blurb: "Arcade historique.", package: "mame", command: "mame" },
    { id: "retroarch", title: "RetroArch", genre: "Émulateur", blurb: "Front-end multi-cœurs.", package: "retroarch", command: "retroarch" },
    { id: "kobodeluxe", title: "Kobo Deluxe", genre: "Shoot'em up", blurb: "XKobo, vagues, bouclier.", package: "kobodeluxe", command: "kobo-deluxe" },
    { id: "tecnoballz", title: "TecnoballZ", genre: "Arcade", blurb: "Casse-briques arcade.", package: "tecnoballz", command: "tecnoballz" },
    { id: "open-invaders", title: "Open Invaders", genre: "Arcade", blurb: "Space Invaders libre.", package: "open-invaders", command: "open-invaders" },
    { id: "liquidwar", title: "Liquid War", genre: "Arcade", blurb: "Liquide qui mange l’adversaire.", package: "liquidwar", command: "liquidwar" },
  ];

  const installed = {};
  let busy = false;

  function callNative(method, payload) {
    if (window.arcadeos && window.arcadeos.call) {
      window.arcadeos.call(method, payload);
      return true;
    }
    return false;
  }

  function refreshInstalled(list) {
    CATALOG.forEach(function (item) {
      installed[item.id] = false;
    });
    (list || []).forEach(function (id) {
      installed[id] = true;
    });
  }

  function requestStatus() {
    callNative("store_status", {
      items: CATALOG.map(function (c) {
        return { id: c.id, command: c.command, package: c.package };
      }),
    });
  }

  function installAndRun(item) {
    if (busy) return;
    if (!window.arcadeosNative) {
      window.__storeDone &&
        window.__storeDone({
          ok: false,
          id: item.id,
          error: "Store disponible uniquement sur l'ISO ArcadeOS (session native).",
        });
      return;
    }
    busy = true;
    callNative("install", {
      id: item.id,
      package: item.package,
      command: item.command,
    });
  }

  function launch(item) {
    if (!window.arcadeosNative) return;
    callNative("launch", item.command);
  }

  function isInstalled(id) {
    return Boolean(installed[id]);
  }

  function setBusy(v) {
    busy = v;
  }

  function isBusy() {
    return busy;
  }

  function byId(id) {
    for (let i = 0; i < CATALOG.length; i++) {
      if (CATALOG[i].id === id) return CATALOG[i];
    }
    return null;
  }

  return {
    CATALOG: CATALOG,
    installAndRun: installAndRun,
    launch: launch,
    isInstalled: isInstalled,
    refreshInstalled: refreshInstalled,
    requestStatus: requestStatus,
    setBusy: setBusy,
    isBusy: isBusy,
    byId: byId,
  };
})();
