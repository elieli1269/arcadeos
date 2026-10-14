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
    { id: "liquidwar", title: "Liquid War", genre: "Arcade", blurb: "Liquide qui mange l’adversaire.", package: "liquidwar", command: "liquidwar", size: "4 Mo" },
    { id: "openttd", title: "OpenTTD", genre: "Transport", blurb: "Réseaux ferroviaires, camions, avions.", package: "openttd", command: "openttd", size: "40 Mo" },
    { id: "simutrans", title: "Simutrans", genre: "Transport", blurb: "Simulation de transport.", package: "simutrans", command: "simutrans", size: "50 Mo" },
    { id: "freecol", title: "FreeCol", genre: "Stratégie", blurb: "Colonisation, tour par tour.", package: "freecol", command: "freecol", size: "60 Mo" },
    { id: "openrct2", title: "OpenRCT2", genre: "Simulation", blurb: "Parcs d’attractions.", package: "openrct2", command: "openrct2", size: "80 Mo" },
    { id: "opencity", title: "OpenCity", genre: "Simulation", blurb: "Ville en 3D.", package: "opencity", command: "opencity", size: "25 Mo" },
    { id: "assaultcube", title: "AssaultCube", genre: "FPS", blurb: "FPS léger, arènes.", package: "assaultcube", command: "assaultcube", size: "50 Mo" },
    { id: "dsda-doom", title: "DSDA-Doom", genre: "FPS", blurb: "Port Doom. Freedoom conseillé.", package: "dsda-doom", command: "dsda-doom", size: "8 Mo" },
    { id: "gltron", title: "GLTron", genre: "Course", blurb: "Murs de lumière, style Tron.", package: "gltron", command: "gltron", size: "3 Mo" },
    { id: "torcs", title: "TORCS", genre: "Course", blurb: "Course automobile.", package: "torcs", command: "torcs", size: "300 Mo" },
    { id: "hex-a-hop", title: "Hex-a-hop", genre: "Puzzle", blurb: "Tuiles hexagonales.", package: "hex-a-hop", command: "hex-a-hop", size: "4 Mo" },
    { id: "kapman", title: "Kapman", genre: "Arcade", blurb: "Labyrinthe, fantômes.", package: "kapman", command: "kapman", size: "3 Mo" },
    { id: "katomic", title: "KAtomic", genre: "Puzzle", blurb: "Atomes, style Sokoban.", package: "katomic", command: "katomic", size: "2 Mo" },
    { id: "kblocks", title: "KBlocks", genre: "Puzzle", blurb: "Tetris KDE.", package: "kblocks", command: "kblocks", size: "2 Mo" },
    { id: "kbreakout", title: "KBreakOut", genre: "Arcade", blurb: "Casse-briques KDE.", package: "kbreakout", command: "kbreakout", size: "2 Mo" },
    { id: "bomber", title: "Bomber", genre: "Arcade", blurb: "Bombes, labyrinthe.", package: "bomber", command: "bomber", size: "3 Mo" },
    { id: "granatier", title: "Granatier", genre: "Arcade", blurb: "Bombes, arènes.", package: "granatier", command: "granatier", size: "3 Mo" },
    { id: "kmines", title: "KMines", genre: "Puzzle", blurb: "Démineur.", package: "kmines", command: "kmines", size: "2 Mo" },
    { id: "ksudoku", title: "KSudoku", genre: "Puzzle", blurb: "Sudoku.", package: "ksudoku", command: "ksudoku", size: "2 Mo" },
    { id: "kpat", title: "KPatience", genre: "Cartes", blurb: "Solitaires KDE.", package: "kpat", command: "kpat", size: "4 Mo" },
    { id: "xboard", title: "XBoard", genre: "Plateau", blurb: "Échecs.", package: "xboard", command: "xboard", size: "3 Mo" },
    { id: "foobillardplus", title: "FooBillard++", genre: "Sport", blurb: "Billard 3D.", package: "foobillardplus", command: "foobillardplus", size: "15 Mo" },
    { id: "billard-gl", title: "BillardGL", genre: "Sport", blurb: "Billard OpenGL.", package: "billard-gl", command: "billard-gl", size: "6 Mo" },
    { id: "abuse", title: "Abuse", genre: "Action", blurb: "Run-and-gun 2D.", package: "abuse", command: "abuse", size: "8 Mo" },
    { id: "ri-li", title: "Ri-li", genre: "Arcade", blurb: "Train de bois.", package: "ri-li", command: "ri-li", size: "6 Mo" },
    { id: "barrage", title: "Barrage", genre: "Shoot'em up", blurb: "Défense, vagues.", package: "barrage", command: "barrage", size: "2 Mo" },
    { id: "alex4", title: "Alex the Allegator 4", genre: "Plateforme", blurb: "Plateforme rétro.", package: "alex4", command: "alex4", size: "2 Mo" },
    { id: "airstrike", title: "Airstrike", genre: "Shoot'em up", blurb: "Avions 2D.", package: "airstrike", command: "airstrike", size: "1 Mo" },
    { id: "bastet", title: "Bastet", genre: "Puzzle", blurb: "Tetris cruel.", package: "bastet", command: "bastet", size: "0,2 Mo" },
    { id: "gtkballs", title: "GtkBalls", genre: "Puzzle", blurb: "Lignes de billes.", package: "gtkballs", command: "gtkballs", size: "1 Mo" },
    { id: "7kaa", title: "Seven Kingdoms", genre: "Stratégie", blurb: "RTS, sept royaumes.", package: "7kaa", command: "7kaa", size: "40 Mo" },
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

  function sizeMb(size) {
    if (!size) return 9999;
    var n = parseFloat(String(size).replace(",", "."));
    if (isNaN(n)) return 9999;
    if (/go/i.test(size)) return n * 1024;
    return n;
  }

  var KNOWN = {
    vitetris: "0,2 Mo",
    "moon-buggy": "0,1 Mo",
    atomix: "1 Mo",
    ltris: "2 Mo",
    lmarbles: "2 Mo",
    gweled: "2 Mo",
    mirrormagic: "4 Mo",
    "chromium-bsu": "6 Mo",
    armagetronad: "8 Mo",
    atanks: "8 Mo",
    tuxfootball: "8 Mo",
    kobodeluxe: "2 Mo",
    tecnoballz: "5 Mo",
    "open-invaders": "3 Mo",
  };

  function sizeOf(item) {
    return item.size || KNOWN[item.id] || "";
  }

  function lightPending() {
    return CATALOG.filter(function (item) {
      return !isInstalled(item.id) && sizeMb(sizeOf(item)) <= 8;
    })
      .sort(function (a, b) {
        return sizeMb(sizeOf(a)) - sizeMb(sizeOf(b));
      })
      .slice(0, 16);
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
    lightPending: lightPending,
    sizeOf: sizeOf,
  };
})();
