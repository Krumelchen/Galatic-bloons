var SCRIPT_OK = "NO";
// Mobile detection – BTD6 side-by-side layout on phones
if (window.innerWidth < 900 || ('ontouchstart' in window && window.innerWidth < 1100)) {
  document.body.classList.add('mobile-layout');
}
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
SCRIPT_OK = "CANVAS_OK";

const creditsEl = document.getElementById("credits");
const scoreEl = document.getElementById("score");
const coreEl = document.getElementById("core");
const waveEl = document.getElementById("wave");
const hintEl = document.getElementById("hint");
const startWaveBtn = document.getElementById("startWave");
const autoWaveBtn = document.getElementById("autoWaveBtn");
const speedBtn = document.getElementById("speedBtn");
const shopBtn = document.getElementById("shopBtn");
const mapBtn = document.getElementById("mapBtn");
const pauseBtn = document.getElementById("pauseBtn");
const soundBtn = document.getElementById("soundBtn");
const clearSelectionBtn = document.getElementById("clearSelection");
const towerButtonsEl = document.getElementById("towerButtons");
const upgradePopup = document.getElementById("upgradePopup");
const shopPopup = document.getElementById("shopPopup");
const mapPopup = document.getElementById("mapPopup");
const upgradeTitle = document.getElementById("upgradeTitle");
const upgradeStats = document.getElementById("upgradeStats");
const upgradeStats2 = document.getElementById("upgradeStats2");
const upgradeBtn = document.getElementById("upgradeBtn");
const sellBtn = document.getElementById("sellBtn");
const targetSelect = document.getElementById("targetSelect");
const closePopupBtn = document.getElementById("closePopupBtn");
const closeShopBtn = document.getElementById("closeShopBtn");
const closeMapBtn = document.getElementById("closeMapBtn");
const shopItemsEl = document.getElementById("shopItems");
const mapListEl = document.getElementById("mapList");
const abilitiesEl = document.getElementById("abilities");
const abilSlow = document.getElementById("abilSlow");
const abilCredits = document.getElementById("abilCredits");
const abilBoost = document.getElementById("abilBoost");
const statsOverlay = document.getElementById("statsOverlay");
const statsContent = document.getElementById("statsContent");
const closeStatsBtn = document.getElementById("closeStatsBtn");

const GRID = { cols: 16, rows: 9, tile: 60, ox: 32, oy: 18 };

// Placeholder – will be set after MAPS definition
let PATH, BUILD_SPOTS;

// ── BTD5/6-inspired Tower Data ─────────────────────────────────
const TOWERS = {
  laserCannon:      { name: "Laser-Affe",  cost: 120, range: 2.5, rate: 0.8, dmg: 10, color:"#45d4ff", body:"#1a7ad5", icon:"🐵", desc:"Schießt Nüsse!", upgCost:100, upgMult:1.35, maxLvl:4 },
  plasmaAoE:        { name: "Plasma-Hund", cost: 200, range: 2.2, rate: 0.5, dmg: 12, splash:1.1, color:"#c07aff", body:"#7a2bc4", icon:"🐶", desc:"Bellt Feuerbälle!", upgCost:160, upgMult:1.35, maxLvl:4 },
  ionSlow:          { name: "Eis-Katze",   cost: 160, range: 2.5, rate: 0.85, dmg: 4, slow:{factor:0.5,dur:2.0}, color:"#6af0ff", body:"#2098b0", icon:"🐱", desc:"Eis-Atem❄️", upgCost:130, upgMult:1.35, maxLvl:4 },
  empPulse:         { name: "EMP-Hase",    cost: 220, range: 2.5, rate: 0.35, dmg: 2, stun:1.2, color:"#ffe37a", body:"#b8962a", icon:"🐰", desc:"Springt & betäubt!", upgCost:180, upgMult:1.35, maxLvl:4 },
  missileSilo:      { name: "Fuchs-Bogen", cost: 350, range: 3.5, rate: 0.35, dmg: 22, color:"#ff8d66", body:"#c04520", icon:"🦊", desc:"Scharfe Pfeile!", upgCost:280, upgMult:1.35, maxLvl:4 },
  nanobotRepair:    { name: "Panda-Doc",   cost: 200, range: 0, rate: 0.25, heal: 2, color:"#76f0a0", body:"#2a9a4e", icon:"🐼", desc:"Heilt mit Bambus!", upgCost:160, upgMult:1.35, maxLvl:4 },
  quantumDisruptor: { name: "Einhorn-Mag", cost: 500, range: 7, rate: 1.0, dmg: 80, teleport:true, color:"#db7dff", body:"#9a2abf", icon:"🦄", desc:"Magischer Teleport!", upgCost:400, upgMult:1.35, maxLvl:4 },
  solarCollector:   { name: "Bienen-Korb", cost: 250, range: 0, rate: 0.15, income: 8, color:"#ffd54a", body:"#c89020", icon:"🐝", desc:"Sammelt Credits!", upgCost:200, upgMult:1.35, maxLvl:4 }
};

// ── BTD5/6-inspired Bloon Enemies ──────────────────────────────
const ENEMIES = {
  xarrScout:   { name:"Red Bloon",    hp: 70,  speed: 1.3,  reward: 8, coreDmg: 5,  color:"#e85050", bloon:true },
  xarrSwarm:   { name:"Blue Bloon",   hp: 45,  speed: 1.65, reward: 6, coreDmg: 3,  color:"#5090e8", bloon:true },
  xarrTank:    { name:"Green Bloon",  hp: 280, speed: 0.68, reward: 22, coreDmg: 20, color:"#50b060", armor:0.12, bloon:true },
  xarrStealth: { name:"Pink Bloon",   hp: 110, speed: 1.15, reward: 15, coreDmg: 8,  color:"#e870b0", stealth:true, bloon:true },
  xarrArmored: { name:"Ceramic",      hp: 260, speed: 0.88, reward: 20, coreDmg: 16, color:"#c0a060", armor:0.35, bloon:true },
  xarrLead:    { name:"Lead Bloon",   hp: 380, speed: 0.62, reward: 28, coreDmg: 20, color:"#808890", armor:0.5, immune:["laserCannon"], bloon:true },
  xarrRainbow: { name:"Rainbow",      hp: 90,  speed: 1.25, reward: 12, coreDmg: 7,  color:"#ff6080", splits:true, bloon:true },
  xarrZebra:   { name:"Zebra Bloon",  hp: 70,  speed: 1.75, reward: 9, coreDmg: 5,  color:"#2a2a2a", bloon:true },
  xarrDDT:     { name:"D.D.T.",       hp: 700, speed: 2.4,  reward: 45, coreDmg: 30, color:"#1a1a2a", stealth:true, armor:0.32, boss:true },
  xarrBlack:   { name:"Black Bloon",  hp: 120, speed: 1.5,  reward: 14, coreDmg: 6,  color:"#1a1a1a", immune:["plasmaAoE","empPulse","missileSilo"], bloon:true },
  xarrWhite:   { name:"White Bloon",  hp: 100, speed: 1.4,  reward: 13, coreDmg: 6,  color:"#f0f0f0", immune:["ionSlow"], bloon:true },
  xarrPurple:  { name:"Purple Bloon", hp: 130, speed: 1.35, reward: 16, coreDmg: 7,  color:"#b070d0", immune:["quantumDisruptor"], bloon:true },
  xarrGold:    { name:"Gold Bloon",   hp: 60,  speed: 2.0,  reward: 40, coreDmg: 3,  color:"#ffd700", bloon:true },
  xarrGhost:   { name:"Ghost Bloon",  hp: 80,  speed: 1.1,  reward: 18, coreDmg: 10, color:"#a0d0ff", stealth:true, bloon:true },
  xarrBoss:    { name:"M.O.A.B.",     hp: 2000,speed: 0.55, reward: 180, coreDmg: 80, color:"#ff4ec5", armor:0.25, boss:true },
  xarrBFB:     { name:"B.F.B.",       hp: 3500,speed: 0.42, reward: 350, coreDmg: 140,color:"#ff3030", armor:0.30, boss:true },
  xarrZOMG:    { name:"Z.O.M.G.",     hp: 7000,speed: 0.32, reward: 700, coreDmg: 250,color:"#30ff30", armor:0.38, immune:["ionSlow"], boss:true },
  xarrBAD:     { name:"B.A.D.",       hp:15000,speed: 0.22, reward: 2500, coreDmg: 400,color:"#ff00ff", armor:0.45, immune:["ionSlow","empPulse","quantumDisruptor"], boss:true }
};

const WAVES = (function(){
  var w=[],S="xarrScout",B="xarrSwarm",T="xarrTank",P="xarrStealth",C="xarrArmored",L="xarrLead",R="xarrRainbow",Z="xarrZebra",D="xarrDDT",K="xarrBlack",H="xarrWhite",U="xarrPurple",G="xarrGold",O="xarrGhost",M="xarrBoss",F="xarrBFB",XM="xarrZOMG",BA="xarrBAD";
  var n=function(t,c){return{type:t,count:c}};
  for(var i=0;i<100;i++){
    var s=i+1,h=function(v){return Math.max(1,Math.round(v*(1+i*0.08)))};if(s===100)w.push([n(BA,1),n(F,3),n(XM,2),n(D,8),n(C,20),n(L,15)]);
    else if(s===90)w.push([n(XM,3),n(F,4),n(D,6),n(BA,1),n(K,12),n(H,12)]);
    else if(s===80)w.push([n(XM,2),n(F,3),n(D,8),n(C,15),n(U,12)]);
    else if(s===70)w.push([n(F,4),n(D,6),n(K,12),n(H,12),n(U,12)]);
    else if(s===60)w.push([n(M,4),n(F,2),n(D,5),n(C,12),n(L,10)]);
    else if(s===50)w.push([n(XM,1),n(F,2),n(M,3),n(D,4)]);
    else if(s===40)w.push([n(F,2),n(D,3),n(K,8),n(H,8),n(C,10)]);
    else if(s===30)w.push([n(M,2),n(F,1),n(D,2),n(L,6)]);
    else if(s===20)w.push([n(F,1),n(D,2),n(C,10),n(L,5)]);
    else if(s===10)w.push([n(M,1),n(L,3),n(C,5)]);
    else if(s%10===9)w.push([n(BA,s>89?1:0),n(XM,s>79?1:0),n(F,s>49?2:1),n(D,h(3+s/10)),n(C,h(5+s/5))]);
    else if(s%5===0)w.push([n(G,h(8)),n(R,h(6)),n(Z,h(4+s/5)),n(O,s>25?h(4):0)]);
    else if(s<5)w.push([n(S,h(6+i*2)),n(B,i>1?h(3+i):0)]);
    else if(s<10)w.push([n(S,h(5+i)),n(B,h(3+i)),n(T,i>6?h(1):0)]);
    else if(s<15)w.push([n(T,h(1+i/3)),n(C,h(1+i/4)),n(P,h(2)),n(R,h(2))]);
    else if(s<20)w.push([n(T,h(2+i/4)),n(C,h(2+i/5)),n(P,h(3)),n(L,h(1+i/8))]);
    else if(s<25)w.push([n(T,h(3+i/4)),n(C,h(3+i/4)),n(L,h(2)),n(K,h(2)),n(H,h(2))]);
    else if(s<35)w.push([n(C,h(4+i/5)),n(L,h(3+i/6)),n(K,h(3)),n(H,h(3)),n(U,h(3)),n(D,s>29?h(1):0)]);
    else if(s<45)w.push([n(C,h(5+i/4)),n(L,h(4+i/5)),n(K,h(4)),n(H,h(4)),n(U,h(4)),n(D,h(1+i/10)),n(Z,h(5))]);
    else if(s<55)w.push([n(C,h(6+i/3)),n(L,h(5+i/4)),n(K,h(5)),n(H,h(5)),n(U,h(5)),n(D,h(2+i/8)),n(Z,h(6)),n(O,h(4))]);
    else if(s<65)w.push([n(C,h(8+i/3)),n(L,h(6+i/3)),n(K,h(6)),n(H,h(6)),n(U,h(6)),n(D,h(3+i/6)),n(Z,h(8)),n(O,h(5)),n(G,h(3))]);
    else if(s<75)w.push([n(C,h(10+i/3)),n(L,h(8+i/3)),n(K,h(8)),n(H,h(8)),n(U,h(8)),n(D,h(4+i/5)),n(Z,h(10)),n(O,h(6)),n(G,h(4))]);
    else if(s<85)w.push([n(C,h(12+i/3)),n(L,h(10+i/3)),n(K,h(10)),n(H,h(10)),n(U,h(10)),n(D,h(5+i/4)),n(Z,h(12)),n(O,h(8)),n(G,h(5))]);
    else if(s<95)w.push([n(C,h(14+i/4)),n(L,h(12+i/4)),n(K,h(12)),n(H,h(12)),n(U,h(12)),n(D,h(6+i/3)),n(Z,h(14)),n(O,h(10)),n(G,h(6))]);
    else w.push([n(C,h(16+i/5)),n(L,h(14+i/5)),n(K,h(14)),n(H,h(14)),n(U,h(14)),n(D,h(7+i/3)),n(Z,h(16)),n(O,h(12)),n(G,h(8))]);
    w[s-1]=w[s-1].filter(function(r){return r.count>0});
  }
  return w;
})();

// ── Maps ────────────────────────────────────────────────────────
const MAPS = {
  grass: {
    name:"🌿 Wiesen", path:[[0,4],[1,4],[2,4],[2,3],[3,3],[4,3],[5,3],[5,4],[5,5],[6,5],[7,5],[8,5],[8,4],[8,3],[9,3],[10,3],[11,3],[11,4],[11,5],[12,5],[13,5],[13,4],[14,4],[15,4]],
    spots:["2,5","3,5","4,5","3,4","3,2","4,2","5,2","6,2","6,3","6,4","7,3","7,4","9,4","9,5","10,5","10,4","12,4","12,3","13,3","1,3","1,5"],
    theme:{bg1:"#2d7a30",bg2:"#1d5a20",path1:"#e8d4a8",path2:"#c8ac78",deco1:"#2a8a30",deco2:"#3a9a40",name:"Wiesen"}
  },
  desert: {
    name:"🏜️ Wüste", path:[[0,2],[1,2],[2,2],[3,2],[3,3],[3,4],[4,4],[5,4],[6,4],[6,3],[6,2],[7,2],[8,2],[9,2],[9,3],[9,4],[10,4],[11,4],[11,3],[11,2],[12,2],[13,2],[14,2],[15,2]],
    spots:["1,3","2,3","4,3","5,3","5,2","5,5","6,5","7,3","7,4","7,5","8,3","8,4","8,5","9,5","10,3","10,5","11,5","12,3","13,3","14,3","2,1"],
    theme:{bg1:"#c4a050",bg2:"#8a7030",path1:"#d4b87a",path2:"#b89858",deco1:"#5a7a2a",deco2:"#7a9a3a",name:"Wüste"}
  },
  frozen: {
    name:"❄️ Eis", path:[[0,5],[1,5],[2,5],[2,4],[3,4],[4,4],[4,3],[5,3],[6,3],[7,3],[7,4],[8,4],[9,4],[9,3],[10,3],[11,3],[11,4],[12,4],[12,5],[13,5],[14,5],[15,5]],
    spots:["2,3","2,6","3,3","3,5","4,5","4,2","5,2","5,4","6,2","6,4","7,2","7,5","8,3","8,5","9,2","9,5","10,2","10,4","11,2","11,5","13,4"],
    theme:{bg1:"#8ab4d4",bg2:"#5a84a4",path1:"#c8dce8",path2:"#a0bcc8",deco1:"#d0e8f0",deco2:"#b0d0e0",name:"Eis"}
  },
  space: {
    name:"🚀 All", path:[[0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[5,4],[6,4],[7,4],[8,4],[8,3],[9,3],[10,3],[11,3],[11,4],[12,4],[13,4],[14,4],[14,3],[15,3]],
    spots:["2,2","2,4","3,2","3,4","4,2","4,4","5,2","5,5","6,3","6,5","7,3","7,5","8,2","9,2","9,4","10,2","10,4","11,2","12,3","12,5","13,3"],
    theme:{bg1:"#1a1a3a",bg2:"#0a0a1a",path1:"#3a3a5a",path2:"#2a2a4a",deco1:"#4a2a6a",deco2:"#6a3a8a",name:"All"}
  }
};
let currentMap = "grass";
// Initialize PATH and BUILD_SPOTS from default map
PATH = MAPS.grass.path;
BUILD_SPOTS = new Set(MAPS.grass.spots);

function makeTowerButtons() {
  for (const [key, t] of Object.entries(TOWERS)) {
    const btn = document.createElement("button");
    btn.dataset.key = key;
    btn.innerHTML = `<span class="tower-icon">${t.icon}</span><span class="tower-label">${t.name}</span><span class="tower-cost">${t.cost}⭐</span>`;
    btn.title = `${t.desc} (${t.cost} Credits)`;
    btn.addEventListener("click", () => {
      state.selectedTowerType = key;
      [...towerButtonsEl.children].forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      hintEl.textContent = `${t.icon} ${t.name} gewählt – auf freies Feld tippen.`;
    });
    towerButtonsEl.appendChild(btn);
  }
}

function toPx(c, r) { return { x: GRID.ox + c * GRID.tile + GRID.tile * 0.5, y: GRID.oy + r * GRID.tile + GRID.tile * 0.5 }; }
function dist(a,b) { const dx=a.x-b.x, dy=a.y-b.y; return Math.hypot(dx,dy); }

// ── Sound System (Web Audio API) ────────────────────────────────
let audioCtx = null;
let soundEnabled = true;
function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
function ensureSound() { if (!soundEnabled) return false; initAudio(); return true; }
function playPop() {
  if (!ensureSound()) return;
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  o.type = "sine"; o.frequency.setValueAtTime(600, audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.08);
  g.gain.setValueAtTime(0.3, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
  o.start(); o.stop(audioCtx.currentTime + 0.12);
}
function playLaser() {
  if (!ensureSound()) return;
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  o.type = "square"; o.frequency.setValueAtTime(800, audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
  g.gain.setValueAtTime(0.15, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
  o.start(); o.stop(audioCtx.currentTime + 0.08);
}
function playExplosion() {
  if (!ensureSound()) return;
  const b = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.3, audioCtx.sampleRate);
  const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const n = audioCtx.createBufferSource(); n.buffer = b;
  const g = audioCtx.createGain(), f = audioCtx.createBiquadFilter();
  n.connect(f); f.connect(g); g.connect(audioCtx.destination);
  f.type = "lowpass"; f.frequency.setValueAtTime(400, audioCtx.currentTime);
  f.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
  g.gain.setValueAtTime(0.2, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  n.start(); n.stop(audioCtx.currentTime + 0.3);
}
function playWaveStart() {
  if (!ensureSound()) return;
  [523, 659, 784].forEach((f, i) => {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination); o.type = "sine";
    o.frequency.setValueAtTime(f, audioCtx.currentTime + i * 0.1);
    g.gain.setValueAtTime(0, audioCtx.currentTime + i * 0.1);
    g.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + i * 0.1 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.1 + 0.25);
    o.start(audioCtx.currentTime + i * 0.1); o.stop(audioCtx.currentTime + i * 0.1 + 0.25);
  });
}
function playUpgrade() {
  if (!ensureSound()) return;
  [400, 600, 800].forEach((f, i) => {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination); o.type = "sine";
    o.frequency.setValueAtTime(f, audioCtx.currentTime + i * 0.06);
    g.gain.setValueAtTime(0.2, audioCtx.currentTime + i * 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.06 + 0.15);
    o.start(audioCtx.currentTime + i * 0.06); o.stop(audioCtx.currentTime + i * 0.06 + 0.15);
  });
}
function playGameOver() {
  if (!ensureSound()) return;
  [400, 300, 200].forEach((f, i) => {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination); o.type = "sawtooth";
    o.frequency.setValueAtTime(f, audioCtx.currentTime + i * 0.2);
    g.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.2);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.2 + 0.3);
    o.start(audioCtx.currentTime + i * 0.2); o.stop(audioCtx.currentTime + i * 0.2 + 0.3);
  });
}

// ── Score System ────────────────────────────────────────────────
let ls = { getItem(){return null}, setItem(){} };
try { ls = localStorage; } catch(e) { /* file:// mode */ }
let highScore = 0;
try { highScore = parseInt(ls.getItem("galacticBloons_highScore")) || 0; } catch(e) {}
function getWaveBonus(waveNum) {
  return waveNum * 100 + (waveNum > 5 ? 200 : 0) + (waveNum > 10 ? 500 : 0) + (waveNum > 15 ? 1000 : 0);
}

// ── Global Upgrades ─────────────────────────────────────────────
const UPGRADES = {
  startingCredits: { name: "Start-Credits +", baseCost: 300, costMult: 1.8, maxLvl: 4, desc: "Mehr Credits zu Beginn", perLvl: 50 },
  towerDamage:     { name: "Turm Schaden +", baseCost: 400, costMult: 2.0, maxLvl: 3, desc: "+15% Turm-Schaden", perLvl: 15 },
  towerRange:      { name: "Turm Reichweite +", baseCost: 350, costMult: 1.9, maxLvl: 3, desc: "+10% Reichweite", perLvl: 10 },
  fireRate:        { name: "Feuerrate +", baseCost: 500, costMult: 2.2, maxLvl: 2, desc: "+12% Feuerrate", perLvl: 12 },
  coreBoost:       { name: "Kern-Leben +", baseCost: 250, costMult: 1.6, maxLvl: 4, desc: "+25 Kern-Leben", perLvl: 25 }
};
const globalUpgrades = { startingCredits:0, towerDamage:0, towerRange:0, fireRate:0, coreBoost:0 };
function getUpgradeCost(key) {
  const u = UPGRADES[key];
  return Math.floor(u.baseCost * Math.pow(u.costMult, globalUpgrades[key]));
}

// ── Expanded State ──────────────────────────────────────────────
function applyGlobalUpgrades() {
  const extraCredits = globalUpgrades.startingCredits * UPGRADES.startingCredits.perLvl;
  const extraCore = globalUpgrades.coreBoost * UPGRADES.coreBoost.perLvl;
  return { credits: 400 + extraCredits, core: 120 + extraCore, maxCore: 120 + extraCore };
}
function getTowerStats(towerDef, level) {
  const dmgMult = 1 + globalUpgrades.towerDamage * 0.10;
  const rangeMult = 1 + globalUpgrades.towerRange * 0.08;
  const rateMult = 1 + globalUpgrades.fireRate * 0.08;
  const lvlBonus = 1 + (level - 1) * 0.18;
  return {
    damage: Math.round(towerDef.dmg * dmgMult * lvlBonus),
    range: towerDef.range * rangeMult * (1 + (level - 1) * 0.1),
    rate: towerDef.rate * rateMult * (1 + (level - 1) * 0.1)
  };
}

function resetState() {
  const initSt = applyGlobalUpgrades();
  state.credits = initSt.credits; state.core = initSt.core; state.maxCore = initSt.maxCore;
  state.wave = 0; state.score = 0; state.speed = 1; state.paused = false; state.autoWave = false;
  state.towers = []; state.enemies = []; state.projectiles = [];
  state.selectedTowerType = null; state.selectedTowerIdx = -1;
  state.waveQueue = []; state.waveSpawning = false; state.spawnTimer = 0;
  state._waveBonusGiven = false; state._soundPlayed = false;
  state.gameOver = false; state.victory = false;
  state.stats = { kills:0, moneyEarned:0, moneySpent:0, towersPlaced:0, wavesCompleted:0 };
  state.shakeTimer = 0; state.shakeIntensity = 0; state._autoWaveTimer = 0;
  state.abilityCD = { slow:0, credits:0, boost:0 };
  state._nextTowerId = 1;
  particles = [];
}

const state = {};
let particles = [];
resetState();

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
  return {r,g,b};
}
function lerpColor(hex, factor) {
  const c = hexToRgb(hex);
  const f = Math.max(-1, Math.min(1, factor));
  if (f < 0) { // darken
    const t = 1 + f;
    return `rgb(${c.r*t|0},${c.g*t|0},${c.b*t|0})`;
  } else { // lighten
    return `rgb(${(c.r+(255-c.r)*f)|0},${(c.g+(255-c.g)*f)|0},${(c.b+(255-c.b)*f)|0})`;
  }
}

// ── 2.5D Drawing Primitives ─────────────────────────────────────
function drawShadow(x, y, rx, ry) {
  const grad = ctx.createRadialGradient(x, y + 4, 0, x, y + 4, rx);
  grad.addColorStop(0, "rgba(0,0,0,0.45)");
  grad.addColorStop(0.6, "rgba(0,0,0,0.2)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, y + 4, rx, ry * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function draw3DTile(x, y, w, h, topColor, sideColor, height) {
  height = height || 6;
  // Bottom wall (front face)
  ctx.fillStyle = lerpColor(sideColor, -0.5);
  ctx.beginPath();
  ctx.moveTo(x + 1, y + h - 1);
  ctx.lineTo(x + w - 1, y + h - 1);
  ctx.lineTo(x + w - 3, y + h + height - 1);
  ctx.lineTo(x + 3, y + h + height - 1);
  ctx.closePath();
  ctx.fill();
  // Right wall
  ctx.fillStyle = lerpColor(sideColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(x + w - 1, y + 1);
  ctx.lineTo(x + w - 1, y + h - 1);
  ctx.lineTo(x + w - 3, y + h + height - 1);
  ctx.lineTo(x + w - 3, y + height + 1);
  ctx.closePath();
  ctx.fill();
  // Top face with subtle gradient
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, lerpColor(topColor, 0.12));
  grad.addColorStop(1, topColor);
  ctx.fillStyle = grad;
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  // Top edge highlight
  ctx.fillStyle = lerpColor(topColor, 0.25);
  ctx.fillRect(x + 1, y + 1, w - 2, 1);
  ctx.fillRect(x + 1, y + 1, 1, h - 2);
}

function updateHud() {
  creditsEl.textContent = `💰 ${state.credits}`;
  scoreEl.textContent = `🏆 ${state.score}`;
  coreEl.textContent = `❤️ ${state.core}/${state.maxCore}`;
  waveEl.textContent = `🌊 ${state.wave}/${WAVES.length}`;
  speedBtn.textContent = state.speed === 1 ? "⏩ 1×" : state.speed === 2 ? "⏩ 2×" : "⏩ 3×";
  speedBtn.className = state.speed > 1 ? "active" : "";
}

function buildWave(index) {
  const q = [];
  for (const part of WAVES[index]) for (let i=0;i<part.count;i++) q.push(part.type);
  return q;
}

function startWave() {
  if (state.waveSpawning || state.gameOver || state.wave >= WAVES.length) return;
  state.waveQueue = buildWave(state.wave);
  state.waveSpawning = true;
  state.spawnTimer = 0;
  state.wave += 1;
  state._waveBonusGiven = false;
  playWaveStart();
  updateHud();
}

function spawnEnemy(typeKey) {
  const e = ENEMIES[typeKey];
  const start = toPx(PATH[0][0], PATH[0][1]);
  state.enemies.push({
    typeKey, hp: e.hp, maxHp: e.hp, speedMul: 1, stun: 0, slow: 0,
    idx: 0, prog: 0, x: start.x, y: start.y, revealed: !e.stealth
  });
}

function tryPlaceTower(c, r) {
  const key = `${c},${r}`;
  if (!state.selectedTowerType) return;
  if (!BUILD_SPOTS.has(key)) return;
  if (state.towers.some(t => t.c===c && t.r===r)) return;
  const def = TOWERS[state.selectedTowerType];
  if (state.credits < def.cost) { hintEl.textContent = "Nicht genug Credits."; return; }
  state.credits -= def.cost;
  state.stats.moneySpent += def.cost;
  state.stats.towersPlaced++;
  const id = state._nextTowerId++;
  state.towers.push({ id, c, r, type: state.selectedTowerType, cd: 0, lvl: 1, targetMode: "first" });
  playLaser();
  updateHud();
}

function updateEnemies(dt) {
  const pathPx = PATH.map(([c,r]) => toPx(c,r));
  for (const e of state.enemies) {
    if (e.hp<=0) continue;
    if (e.stun > 0) { e.stun -= dt; continue; }
    if (e.slow > 0) { e.slow -= dt; if (e.slow<=0) e.speedMul = 1; }

    const from = pathPx[e.idx];
    const to = pathPx[e.idx+1];
    if (!to) {
      e.hp = -999;
      state.core -= ENEMIES[e.typeKey].coreDmg;
      if (state.core <= 0) { state.core = 0; state.gameOver = true; state.victory = false; }
      updateHud();
      continue;
    }

    const seg = dist(from,to);
    const spd = ENEMIES[e.typeKey].speed * GRID.tile * e.speedMul;
    e.prog += (spd * dt) / seg;
    if (e.prog >= 1) { e.idx += 1; e.prog = 0; }
    const a = pathPx[e.idx], b = pathPx[e.idx+1] || a;
    e.x = a.x + (b.x - a.x) * e.prog;
    e.y = a.y + (b.y - a.y) * e.prog;
  }
  state.enemies = state.enemies.filter(e => e.hp > 0);
}

function applyTowerEffects(t, target) {
  const def = TOWERS[t.type];
  if (def.slow) { target.speedMul = Math.min(target.speedMul, def.slow.factor); target.slow = Math.max(target.slow, def.slow.dur); }
  if (def.stun) { target.stun = Math.max(target.stun, def.stun); }
  if (def.teleport) { target.idx = 0; target.prog = 0; const p = toPx(PATH[0][0], PATH[0][1]); target.x = p.x; target.y = p.y; }
}

function updateTowers(dt) {
  for (const t of state.towers) {
    const def = TOWERS[t.type];
    t.cd -= dt;
    const pos = toPx(t.c,t.r);

    if (def.income && t.cd <= 0) {
      state.credits += def.income;
      updateHud();
      t.cd = 1/def.rate;
      continue;
    }
    if (def.heal && t.cd <= 0) {
      state.core = Math.min(state.maxCore, state.core + def.heal);
      updateHud();
      t.cd = 1/def.rate;
      continue;
    }
    if (t.cd > 0) continue;

    const inRange = state.enemies.filter(e => e.hp>0 && dist(pos,e) <= def.range * GRID.tile);
    if (!inRange.length) continue;
    // Filter out immune targets
    const validTargets = inRange.filter(e => {
      const ed = ENEMIES[e.typeKey];
      return !ed.immune || !ed.immune.includes(t.type);
    });
    if (!validTargets.length) continue;

    if (t.type === "empPulse") {
      for (const e of validTargets) { e.hp -= def.dmg; applyTowerEffects(t,e); if (e.hp<=0) state.credits += ENEMIES[e.typeKey].reward; }
      updateHud();
      t.cd = 1/def.rate;
      continue;
    }

    const target = validTargets.reduce((a,b)=> (a.idx > b.idx ? a : b));
    const dx = target.x - pos.x, dy = target.y - pos.y;
    const d = Math.hypot(dx, dy);
    state.projectiles.push({ x: pos.x, y: pos.y, tx: target.x, ty: target.y, vx: dx/d*420, vy: dy/d*420, dmg: def.dmg, splash: def.splash || 0, color: def.color, towerType: t.type, target });
    t.cd = 1/def.rate;
  }
}

function updateProjectiles(dt) {
  for (const p of state.projectiles) {
    const dx = p.tx - p.x, dy = p.ty - p.y;
    const d = Math.hypot(dx,dy);
    if (d < 8) {
      if (p.target && p.target.hp > 0) {
        const ed = ENEMIES[p.target.typeKey];
        const armor = ed.armor || 0;
        const real = p.dmg * (1 - armor);
        p.target.hp -= real;
        p.target.revealed = true;

        // Hit effect
        spawnParticles(p.x, p.y, p.color, 5, 2, 0.3);

        const fakeTower = { type: p.towerType };
        applyTowerEffects(fakeTower, p.target);
        if (p.splash > 0) {
          spawnExplosion(p.x, p.y, p.color);
          for (const e of state.enemies) {
            if (e===p.target || e.hp<=0) continue;
            if (dist(e,p.target) <= p.splash * GRID.tile) e.hp -= p.dmg * 0.5;
          }
        }
        if (p.target.hp <= 0) {
          state.credits += ed.reward;
          // Bloon pop effect!
          if (ed.bloon) spawnBloonPop(p.target.x, p.target.y, ed.color);
          else spawnExplosion(p.target.x, p.target.y, ed.color);
        }
      }
      p.done = true;
      updateHud();
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
  state.projectiles = state.projectiles.filter(p => !p.done);
}

function updateWaveSpawner(dt) {
  if (!state.waveSpawning) return;
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0 && state.waveQueue.length) {
    spawnEnemy(state.waveQueue.shift());
    state.spawnTimer = 0.85;
  }
  if (!state.waveQueue.length) state.waveSpawning = false;
}

function checkWinLose() {
  if (state.gameOver) return;
  // Wave completion bonus
  if (!state.waveSpawning && state.enemies.length === 0 && state.wave > 0 && !state._waveBonusGiven) {
    const bonus = getWaveBonus(state.wave);
    state.score += bonus;
    state._waveBonusGiven = true;
    showScorePopup(`+${bonus} 🏆 Welle ${state.wave}`, state.wave);
    updateHud();
    ls.setItem("galacticBloons_highScore", Math.max(highScore, state.score));
    // Auto next wave (timer-based, synced with game loop)
    if (state.autoWave && state.wave < WAVES.length) {
      state._autoWaveTimer = 0.8;
    }
  }
  if (state.wave >= WAVES.length && !state.waveSpawning && state.enemies.length===0) {
    state.gameOver = true;
    state.victory = true;
  }
}

// ── Score Popup ──
function showScorePopup(text) {
  const el = document.createElement("div");
  el.className = "score-popup";
  el.textContent = text;
  el.style.left = "50%";
  el.style.top = "30%";
  el.style.transform = "translateX(-50%)";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

// ── BTD5-style Map Drawing ─────────────────────────────────────
window._gameErrors = [];
window.onerror = (msg, url, line) => { window._gameErrors.push(`${msg} (${line})`); };
console.log = function(...args) { window._gameErrors.push(args.join(' ')); };

function drawGrid() {
  const map = MAPS[currentMap];
  const t = map.theme;
  const pad = 20;
  const bx = GRID.ox - pad, by = GRID.oy - pad;
  const bw = GRID.cols * GRID.tile + pad*2, bh = GRID.rows * GRID.tile + pad*2;

  // Outer shadow
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 30;
  ctx.fillStyle = "#3d2b1a"; ctx.beginPath(); ctx.roundRect(bx-4,by-4,bw+8,bh+8,16); ctx.fill();
  ctx.shadowBlur = 0;

  // Board surface – themed gradient
  const bgGrad = ctx.createRadialGradient(bx+bw/2,by+bh/2,0,bx+bw/2,by+bh/2,bw*0.7);
  bgGrad.addColorStop(0,t.bg1); bgGrad.addColorStop(0.6,t.bg1); bgGrad.addColorStop(1,t.bg2);
  ctx.fillStyle = bgGrad; ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,14); ctx.fill();

  // Texture dots (themed color)
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.04 + Math.sin(i)*0.02})`;
    const gx = bx + ((i*137+53)%1000)/1000*bw, gy = by + ((i*251+79)%1000)/1000*bh;
    ctx.beginPath(); ctx.arc(gx,gy,1+((i*31)%3),0,Math.PI*2); ctx.fill();
  }

  // Draw tiles
  for (let r = 0; r < GRID.rows; r++) {
    for (let c = 0; c < GRID.cols; c++) {
      const x = GRID.ox + c * GRID.tile, y = GRID.oy + r * GRID.tile;
      const key = `${c},${r}`;
      const isPath = PATH.some(p => p[0] === c && p[1] === r);
      const isBuild = BUILD_SPOTS.has(key);

      if (isPath) {
        const pg = ctx.createLinearGradient(x,y,x,y+GRID.tile);
        pg.addColorStop(0,t.path1); pg.addColorStop(1,t.path2);
        ctx.fillStyle = pg; ctx.fillRect(x+2,y+2,GRID.tile-4,GRID.tile-4);
        ctx.strokeStyle = `rgba(0,0,0,0.15)`; ctx.lineWidth=1;
        ctx.strokeRect(x+2,y+2,GRID.tile-4,GRID.tile-4);
      } else if (isBuild) {
        const sg = ctx.createLinearGradient(x,y,x,y+GRID.tile);
        sg.addColorStop(0,lerpColor(t.path1,0.15)); sg.addColorStop(1,lerpColor(t.path1,-0.15));
        ctx.fillStyle = sg; ctx.beginPath(); ctx.roundRect(x+4,y+4,GRID.tile-8,GRID.tile-8,6); ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,0.12)`; ctx.lineWidth=1; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.roundRect(x+6,y+6,GRID.tile-12,GRID.tile-12,4); ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = `rgba(255,255,255,${0.03+((c*7+r*13)%6)*0.008})`;
        ctx.fillRect(x+2,y+2,GRID.tile-4,GRID.tile-4);
      }
    }
  }
}

// ── Static decorations (themed per map) ──
const DECOR_TREES = (() => {
  const pos = [[-1,-1],[-1,3],[-1,8],[0,-1],[7,-1],[15,-1],[16,0],[16,4],[16,8],[15,9],[10,9],[4,9],[0,9]];
  return pos.map(([c,r]) => ({x:GRID.ox+c*GRID.tile+GRID.tile/2,y:GRID.oy+r*GRID.tile+GRID.tile/2}));
})();

function drawDecorTrees() {
  const t = MAPS[currentMap].theme;
  for (const p of DECOR_TREES) {
    if (currentMap === "grass") {
      ctx.fillStyle = "#5a3a1a"; ctx.fillRect(p.x-3,p.y-2,6,12);
      ctx.fillStyle = "#2a8a30"; ctx.beginPath(); ctx.arc(p.x,p.y-6,14,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "#3a9a40"; ctx.beginPath(); ctx.arc(p.x-5,p.y-8,8,0,Math.PI*2); ctx.fill();
    } else if (currentMap === "desert") {
      ctx.fillStyle = "#6a4a2a"; ctx.fillRect(p.x-4,p.y-2,8,14);
      ctx.fillStyle = "#5a7a2a"; ctx.beginPath(); ctx.arc(p.x,p.y-4,10,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "#4a6a1a"; ctx.beginPath(); ctx.arc(p.x-3,p.y-6,7,0,Math.PI*2); ctx.fill();
    } else if (currentMap === "frozen") {
      ctx.fillStyle = "#a0ccdd"; ctx.beginPath(); ctx.arc(p.x,p.y-2,12,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.arc(p.x-4,p.y-4,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.beginPath(); ctx.arc(p.x+3,p.y-6,4,0,Math.PI*2); ctx.fill();
    } else {
      ctx.fillStyle = "#2a1a3a"; ctx.beginPath(); ctx.arc(p.x,p.y-3,10,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "#3a2a5a"; ctx.beginPath(); ctx.arc(p.x-4,p.y-5,6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(180,120,255,0.2)"; ctx.beginPath(); ctx.arc(p.x,p.y-3,12,0,Math.PI*2); ctx.fill();
    }
  }
}

// ── BTD5-style Bloon Drawing ───────────────────────────────────
function drawBloon(x, y, radius, color, isBoss, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  drawShadow(x, y + 3, radius * 2, radius * 0.9);

  // Body with BTD6-style 3-layer gradient
  const g = ctx.createRadialGradient(x-radius*0.3, y-radius*0.35, radius*0.05, x, y, radius);
  g.addColorStop(0, "#fff");
  g.addColorStop(0.15, lerpColor(color,0.5));
  g.addColorStop(0.5, color);
  g.addColorStop(0.85, lerpColor(color,-0.2));
  g.addColorStop(1, lerpColor(color,-0.4));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI*2); ctx.fill();

  // Rim
  ctx.strokeStyle = lerpColor(color,-0.25); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(x, y, radius-0.5, 0, Math.PI*2); ctx.stroke();

  // Big crescent shine (BTD6 style)
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath(); ctx.ellipse(x-radius*0.3, y-radius*0.35, radius*0.4, radius*0.25, -0.4, 0, Math.PI*2); ctx.fill();
  // Small shine
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath(); ctx.ellipse(x-radius*0.15, y-radius*0.15, radius*0.15, radius*0.1, 0, 0, Math.PI*2); ctx.fill();

  // Knot
  ctx.fillStyle = lerpColor(color,-0.5);
  ctx.beginPath(); ctx.moveTo(x-3,y+radius-2); ctx.lineTo(x+3,y+radius-2); ctx.lineTo(x,y+radius+3); ctx.closePath(); ctx.fill();
  // String
  ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(x,y+radius+3); ctx.quadraticCurveTo(x+4,y+radius+10,x-2,y+radius+16); ctx.stroke();

  ctx.restore();
}

// ── Universal Boss Drawing (MOAB/BFB/ZOMG/BAD/DDT) ──
function drawBoss(x, y, enemy) {
  const ed = ENEMIES[enemy.typeKey];
  const hpPct = enemy.hp / enemy.maxHp;
  const sizes = {"xarrDDT":16,"xarrBoss":22,"xarrBFB":28,"xarrZOMG":34,"xarrBAD":40};
  const r = sizes[enemy.typeKey] || 22;
  const pulse = Math.sin(Date.now()/400)*0.15+0.85;

  drawShadow(x, y+6, r*2.5, r*1.2);

  // Outer glow
  ctx.shadowColor = ed.color; ctx.shadowBlur = 15*pulse + (enemy.typeKey==="xarrBAD"?15:enemy.typeKey==="xarrZOMG"?10:0);
  ctx.fillStyle = "#2a2a3a";
  ctx.beginPath(); ctx.ellipse(x,y,r+2,r*0.7,0,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;

  // Main body
  const bg = ctx.createRadialGradient(x-r*0.2,y-r*0.2,r*0.1,x,y,r);
  bg.addColorStop(0,"#7a7a8a"); bg.addColorStop(0.4,ed.color); bg.addColorStop(0.8,"#2a2a3a"); bg.addColorStop(1,"#1a1a2a");
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.ellipse(x,y,r,r*0.7,0,0,Math.PI*2); ctx.fill();

  // Eyes
  ctx.shadowColor = ed.color; ctx.shadowBlur = 12*pulse;
  ctx.fillStyle = ed.color;
  ctx.beginPath(); ctx.arc(x-r*0.4,y-2,5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+r*0.4,y-2,5,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(x-r*0.4,y-3,2.5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+r*0.4,y-3,2.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath(); ctx.arc(x-r*0.4-1,y-3,1.3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+r*0.4-1,y-3,1.3,0,Math.PI*2); ctx.fill();

  // Label
  ctx.fillStyle = "#fff"; ctx.font = `bold ${enemy.typeKey==="xarrBAD"?9:7}px sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText(ed.name, x, y+r*0.35);

  // Special markers for ZOMG/BAD
  if (enemy.typeKey === "xarrBAD") {
    // Skull icon
    ctx.font = "16px sans-serif"; ctx.fillText("☠️", x, y-r*0.2);
  } else if (enemy.typeKey === "xarrZOMG") {
    ctx.font = "14px sans-serif"; ctx.fillText("🛡️", x, y-r*0.2);
  }

  // Health bar
  const barW=r*2, barH=6, barX=x-barW/2, barY=y-r-12;
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.beginPath(); ctx.roundRect(barX-1,barY-1,barW+2,barH+2,3); ctx.fill();
  const hpC = hpPct>0.5?ed.color:hpPct>0.25?"#ffd166":"#ff5b6e";
  ctx.fillStyle = hpC;
  ctx.beginPath(); ctx.roundRect(barX,barY,barW*hpPct,barH,2); ctx.fill();
}

// ── BTD5-style Tower Drawing ───────────────────────────────────
function drawTower3D(x, y, towerDef, level) {
  const { color, body, icon, name } = towerDef;
  const h = 32;
  const pulse = Math.sin(Date.now()/600)*0.05+0.95;

  drawShadow(x, y + 18, 32 * pulse, 16 * pulse);

  // Base platform
  ctx.fillStyle = "#3a3a4a";
  ctx.beginPath(); ctx.ellipse(x, y+15, 22, 9, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = "#2a2a3a"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(x, y+15, 22, 9, 0, 0, Math.PI*2); ctx.stroke();

    // Tower body – distinct character per type
  if (name === "Laser-Affe") {
    // Monkey head (circle + ears)
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(x, y+6, 11, 0, Math.PI*2); ctx.fill();
    // Ears
    ctx.fillStyle = lerpColor(body,0.2);
    ctx.beginPath(); ctx.arc(x-10,y+2,5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+10,y+2,5,0,Math.PI*2); ctx.fill();
    // Eyes
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x-4,y+3,3.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+4,y+3,3.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(x-4,y+3,2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+4,y+3,2,0,Math.PI*2); ctx.fill();
    // Mouth (smile)
    ctx.strokeStyle = "#222"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(x,y+8,4,0.1,Math.PI-0.1); ctx.stroke();
    // Laser beam
    ctx.shadowColor = color; ctx.shadowBlur = 8;
    ctx.strokeStyle = color; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y-12); ctx.stroke();
    ctx.shadowBlur = 0;
    // Icon above
    ctx.font = "14px sans-serif"; ctx.fillText(icon, x, y-12);
  } else if (name === "Plasma-Hund") {
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(x, y+8, 12, 0, Math.PI*2); ctx.fill();
    // Ears (floppy)
    ctx.fillStyle = lerpColor(body,0.15);
    ctx.beginPath(); ctx.ellipse(x-10,y+2,5,8,-0.2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+10,y+2,5,8,0.2,0,Math.PI*2); ctx.fill();
    // Eyes
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x-4,y+5,3.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+4,y+5,3.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(x-4,y+5,2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+4,y+5,2,0,Math.PI*2); ctx.fill();
    // Nose
    ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(x,y+9,2.5,0,Math.PI*2); ctx.fill();
    // Fire ball
    ctx.shadowColor = color; ctx.shadowBlur = 12;
    const fg = ctx.createRadialGradient(x,y-6,0,x,y-6,6);
    fg.addColorStop(0,"#fff"); fg.addColorStop(0.4,color); fg.addColorStop(1,lerpColor(color,-0.3));
    ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(x,y-6,6,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = "14px sans-serif"; ctx.fillText(icon, x, y-14);
  } else if (name === "Eis-Katze") {
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(x, y+8, 11, 0, Math.PI*2); ctx.fill();
    // Ears (pointy)
    ctx.fillStyle = lerpColor(body,0.2);
    ctx.beginPath(); ctx.moveTo(x-10,y-2); ctx.lineTo(x-7,y+5); ctx.lineTo(x-13,y+5); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+10,y-2); ctx.lineTo(x+7,y+5); ctx.lineTo(x+13,y+5); ctx.closePath(); ctx.fill();
    // Eyes
    ctx.fillStyle = "#6af0ff"; ctx.beginPath(); ctx.arc(x-4,y+5,3.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+4,y+5,3.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x-5,y+4,1.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+3,y+4,1.5,0,Math.PI*2); ctx.fill();
    // Whiskers
    ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(x-12,y+8); ctx.lineTo(x-5,y+8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+12,y+8); ctx.lineTo(x+5,y+8); ctx.stroke();
    ctx.font = "14px sans-serif"; ctx.fillText(icon, x, y-10);
  } else if (name === "EMP-Hase") {
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(x, y+10, 10, 0, Math.PI*2); ctx.fill();
    // Ears (long)
    ctx.fillStyle = lerpColor(body,0.2);
    ctx.beginPath(); ctx.ellipse(x-6,y-6,4,10,-0.1,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+6,y-6,4,10,0.1,0,Math.PI*2); ctx.fill();
    // Inner ear
    ctx.fillStyle = "#ffb0b0";
    ctx.beginPath(); ctx.ellipse(x-6,y-6,2,7,-0.1,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+6,y-6,2,7,0.1,0,Math.PI*2); ctx.fill();
    // Face
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x-4,y+8,2.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+4,y+8,2.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(x-4,y+8,1.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+4,y+8,1.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "#ffb0b0"; ctx.beginPath(); ctx.arc(x,y+12,2,0,Math.PI*2); ctx.fill();
    // Sparks
    ctx.fillStyle = color; for(let i=0;i<4;i++){const a=i*1.57+t/300;ctx.beginPath();ctx.arc(x+Math.cos(a)*14,y+4+Math.sin(a)*8,2.5,0,Math.PI*2);ctx.fill();}
    ctx.font = "14px sans-serif"; ctx.fillText(icon, x, y-12);
  } else if (name === "Fuchs-Bogen") {
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(x, y+8, 11, 0, Math.PI*2); ctx.fill();
    // Ears (pointy)
    ctx.fillStyle = lerpColor(body,0.2);
    ctx.beginPath(); ctx.moveTo(x-10,y-2); ctx.lineTo(x-6,y+6); ctx.lineTo(x-14,y+4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+10,y-2); ctx.lineTo(x+6,y+6); ctx.lineTo(x+14,y+4); ctx.closePath(); ctx.fill();
    // Eyes
    ctx.fillStyle = "#ff8"; ctx.beginPath(); ctx.arc(x-4,y+5,3,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+4,y+5,3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(x-4,y+5,1.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+4,y+5,1.5,0,Math.PI*2); ctx.fill();
    // Arrow
    ctx.strokeStyle = color; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(x,y-6); ctx.lineTo(x,y-16); ctx.stroke();
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x,y-18); ctx.lineTo(x-3,y-14); ctx.lineTo(x+3,y-14); ctx.closePath(); ctx.fill();
    ctx.font = "14px sans-serif"; ctx.fillText(icon, x, y-16);
  } else if (name === "Panda-Doc") {
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(x, y+8, 11, 0, Math.PI*2); ctx.fill();
    // Ears (black)
    ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(x-8,y+1,5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+8,y+1,5,0,Math.PI*2); ctx.fill();
    // Eyes
    ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(x-4,y+5,3.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+4,y+5,3.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x-5,y+4,1.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+3,y+4,1.5,0,Math.PI*2); ctx.fill();
    // Nose
    ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(x,y+10,2.5,0,Math.PI*2); ctx.fill();
    // Green cross (heal symbol)
    ctx.fillStyle = color; ctx.font = "bold 12px sans-serif"; ctx.fillText("+", x, y-6);
    ctx.font = "14px sans-serif"; ctx.fillText(icon, x, y-14);
  } else if (name === "Einhorn-Mag") {
    ctx.fillStyle = "#f0e8ff";
    ctx.beginPath(); ctx.arc(x, y+8, 11, 0, Math.PI*2); ctx.fill();
    // Horn
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x,y-8); ctx.lineTo(x-3,y-3); ctx.lineTo(x+3,y-3); ctx.closePath(); ctx.fill();
    ctx.shadowColor = color; ctx.shadowBlur = 10;
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x,y-6,3,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    // Eyes
    ctx.fillStyle = "#6a4aaa"; ctx.beginPath(); ctx.arc(x-4,y+5,3,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+4,y+5,3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x-5,y+4,1.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+3,y+4,1.5,0,Math.PI*2); ctx.fill();
    // Magic swirl
    ctx.strokeStyle = `rgba(219,125,255,${0.3+0.2*Math.sin(Date.now()/400)})`; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(x,y+4,14,0,Math.PI*2); ctx.stroke();
    ctx.font = "14px sans-serif"; ctx.fillText(icon, x, y-10);
  } else {
    // Biene
    ctx.fillStyle = "#ffd54a";
    ctx.beginPath(); ctx.arc(x, y+8, 11, 0, Math.PI*2); ctx.fill();
    // Stripes
    ctx.fillStyle = "#333";
    ctx.fillRect(x-10,y+5,20,3); ctx.fillRect(x-9,y+10,18,3);
    // Wings
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath(); ctx.ellipse(x-10,y+2,6,4,-0.2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+10,y+2,6,4,0.2,0,Math.PI*2); ctx.fill();
    // Eyes
    ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(x-4,y+6,2.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+4,y+6,2.5,0,Math.PI*2); ctx.fill();
    // Antennae
    ctx.strokeStyle = "#333"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(x-4,y-2); ctx.lineTo(x-6,y-8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+4,y-2); ctx.lineTo(x+6,y-8); ctx.stroke();
    // Honey drop
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x,y-5,3,0,Math.PI*2); ctx.fill();
    ctx.font = "14px sans-serif"; ctx.fillText(icon, x, y-12);
  }

  // Level badge
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.beginPath(); ctx.roundRect(x-12, y+18, 24, 12, 4); ctx.fill();
  ctx.fillStyle = "#ffd700"; ctx.font = "bold 9px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText(`★${level}`, x, y+24);

  // Upgrade glow
  if (level > 1) {
    ctx.shadowColor = color; ctx.shadowBlur = 8+level*2;
    ctx.strokeStyle = `rgba(255,255,255,${0.05+level*0.03})`;
    ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x,y+4,18,9,0,0,Math.PI*2); ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

// ── Particle System (pop effects, explosions) ──────────────────
function spawnParticles(x, y, color, count, speed, life) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = (0.5 + Math.random()) * speed;
    particles.push({
      x, y, color,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 1,
      life: life * (0.3 + Math.random() * 0.7),
      maxLife: life,
      size: 2 + Math.random() * 4
    });
  }
}
function spawnBloonPop(x, y, color) {
  // Main pop burst
  spawnParticles(x, y, color, 12, 3, 0.6);
  spawnParticles(x, y, "#fff", 6, 2, 0.4);
  // Ring of small particles
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    particles.push({
      x, y, color: lerpColor(color, 0.5),
      vx: Math.cos(a) * 4,
      vy: Math.sin(a) * 4 - 0.5,
      life: 0.5, maxLife: 0.5, size: 2
    });
  }
}
function spawnExplosion(x, y, color) {
  spawnParticles(x, y, color, 20, 5, 0.8);
  spawnParticles(x, y, "#ff8", 10, 3, 0.6);
  spawnParticles(x, y, "#fff", 8, 2, 0.4);
}

function updateParticles(dt) {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 4 * dt; // gravity
    p.life -= dt;
  }
  particles = particles.filter(p => p.life > 0);
}

function drawParticles() {
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (0.3 + 0.7 * alpha), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ── Main Entity Drawing ────────────────────────────────────────
function drawEntities() {
  // Towers
  for (const t of state.towers) {
    const d = TOWERS[t.type];
    const p = toPx(t.c, t.r);
    drawTower3D(p.x, p.y, d, t.lvl);
  }

  // Enemies (Bloons!)
  for (const e of state.enemies) {
    if (e.hp <= 0) continue;
    const ed = ENEMIES[e.typeKey];
    const alpha = ed.stealth && !e.revealed ? 0.45 : 1;

    // Determine draw radius & boss status
    let isBoss = ed.boss || e.typeKey === "xarrBFB" || e.typeKey === "xarrZOMG" || e.typeKey === "xarrBAD";
    // All bosses use drawBoss
    if (isBoss) {
      drawBoss(e.x, e.y, e);
    } else {
      const radius = e.typeKey === "xarrTank" || e.typeKey === "xarrZebra" ? 11 : e.typeKey === "xarrArmored" || e.typeKey === "xarrLead" ? 10 : 8;
      drawBloon(e.x, e.y, radius, ed.color, false, alpha);

      const hp = Math.max(0, e.hp / e.maxHp);
      if (hp < 1) {
        const bw = radius*3, bh = 4, bx = e.x-bw/2, by = e.y-radius-10;
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath(); ctx.roundRect(bx-1,by-1,bw+2,bh+2,2); ctx.fill();
        ctx.fillStyle = hp>0.5?"#62d96b":hp>0.25?"#ffd166":"#ff6b6b";
        ctx.beginPath(); ctx.roundRect(bx,by,bw*hp,bh,1.5); ctx.fill();
      }
    }

    // Stealth shimmer
    if (ed.stealth && e.typeKey !== "xarrDDT") {
      const sh = 0.3+0.3*Math.sin(Date.now()/200+e.x);
      ctx.strokeStyle = `rgba(200,200,255,${sh})`; ctx.lineWidth=1.5; ctx.setLineDash([3,4]);
      ctx.beginPath(); ctx.arc(e.x,e.y,ed.boss?24:12,0,Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Projectiles
  for (const p of state.projectiles) {
    ctx.fillStyle = lerpColor(p.color,0.3); ctx.globalAlpha=0.25;
    ctx.beginPath(); ctx.arc(p.x-p.vx*0.5,p.y-p.vy*0.5,3,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowColor = p.color; ctx.shadowBlur = 15;
    const g = ctx.createRadialGradient(p.x-1,p.y-1,0,p.x,p.y,5);
    g.addColorStop(0,"#fff"); g.addColorStop(0.4,p.color); g.addColorStop(1,lerpColor(p.color,-0.3));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x,p.y,4,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Particles
  drawParticles();
}

function drawOverlay() {
  if (!state.gameOver) return;
  if (!state._soundPlayed) { onGameOver(); state._soundPlayed = true; }
  // Darken background
  const overGrad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/2);
  overGrad.addColorStop(0, "rgba(0,0,0,0.4)");
  overGrad.addColorStop(1, "rgba(0,0,0,0.75)");
  ctx.fillStyle = overGrad;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Victory/Defeat banner
  const bannerColor = state.victory ? "#66ff99" : "#ff5b6e";
  const bannerShadow = state.victory ? "rgba(102,255,153,0.3)" : "rgba(255,91,110,0.3)";

  ctx.shadowColor = bannerShadow;
  ctx.shadowBlur = 40;
  ctx.fillStyle = bannerColor;
  ctx.font = "bold 56px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(state.victory ? "⭐ VICTORY ⭐" : "💀 DEFEAT", canvas.width/2, canvas.height/2 - 20);
  ctx.shadowBlur = 0;

  // Subtitle
  ctx.fillStyle = "#dbe7ff";
  ctx.font = "18px sans-serif";
  ctx.fillText("Neu laden für Neustart", canvas.width/2, canvas.height/2 + 36);

  // Stats
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#8899bb";
  ctx.fillText(`Welle ${state.wave}/${WAVES.length}  •  Score: ${state.score}`, canvas.width/2, canvas.height/2 + 64);
  if (highScore > 0) {
    ctx.font = "12px sans-serif";
    ctx.fillStyle = state.score >= highScore ? "#ffd700" : "#8899bb";
    ctx.fillText(`🏆 High Score: ${highScore}`, canvas.width/2, canvas.height/2 + 84);
  }
}

// ── Tower Selection / Upgrade ──
canvas.addEventListener("pointerdown", ev => {
  if (state.gameOver) return;
  const rect = canvas.getBoundingClientRect();
  const x = (ev.clientX - rect.left) * (canvas.width / rect.width);
  const y = (ev.clientY - rect.top) * (canvas.height / rect.height);
  const c = Math.floor((x - GRID.ox) / GRID.tile);
  const r = Math.floor((y - GRID.oy) / GRID.tile);
  if (c<0 || r<0 || c>=GRID.cols || r>=GRID.rows) return;

  // Check if clicking on existing tower
  const towerIdx = state.towers.findIndex(t => t.c === c && t.r === r);
  if (towerIdx >= 0) {
    state.selectedTowerIdx = towerIdx;
    showTowerUpgrade(towerIdx);
    return;
  }
  tryPlaceTower(c,r);
});

// ── Upgrade Popup ──
function showTowerUpgrade(idx) {
  const t = state.towers[idx];
  const def = TOWERS[t.type];
  const stats = getTowerStats(def, t.lvl);
  const nextStats = getTowerStats(def, t.lvl + 1);
  const maxed = t.lvl >= def.maxLvl;

  upgradeTitle.textContent = `${def.icon} ${def.name} ★${t.lvl}`;
  upgradeStats.textContent = maxed
    ? `Schaden: ${stats.damage} • Reichweite: ${stats.range.toFixed(1)} • ⚡ MAX`
    : `Schaden: ${stats.damage} → ${nextStats.damage}`;
  upgradeStats2.textContent = maxed
    ? `Feuerrate: ${stats.rate.toFixed(2)}/s`
    : `Reichweite: ${stats.range.toFixed(1)} → ${nextStats.range.toFixed(1)}`;

  const upgCost = Math.floor(def.upgCost * Math.pow(def.upgMult, t.lvl - 1));
  upgradeBtn.textContent = maxed ? "⭐ MAX LEVEL" : `⬆ Upgraden (${upgCost}💰)`;
  upgradeBtn.disabled = maxed || state.credits < upgCost;
  upgradeBtn.onclick = () => {
    if (maxed || state.credits < upgCost) return;
    state.credits -= upgCost;
    t.lvl++;
    playUpgrade();
    updateHud();
    hideUpgrade();
  };

  const sellValue = Math.floor(def.cost * 0.5 + (t.lvl - 1) * def.upgCost * 0.4);
  sellBtn.textContent = `💰 Verkaufen (+${sellValue})`;
  sellBtn.onclick = () => {
    state.credits += sellValue;
    state.towers.splice(idx, 1);
    playExplosion();
    updateHud();
    hideUpgrade();
  };

  upgradePopup.classList.remove("hidden");
}

function hideUpgrade() {
  upgradePopup.classList.add("hidden");
  state.selectedTowerIdx = -1;
}
closePopupBtn.addEventListener("click", hideUpgrade);
clearSelectionBtn.addEventListener("click", () => {
  state.selectedTowerType = null;
  [...towerButtonsEl.children].forEach(b => b.classList.remove("selected"));
  hintEl.textContent = "Auswahl gelöscht.";
});

// ── Shop Popup ──
function showShop() {
  shopItemsEl.innerHTML = "";
  for (const [key, u] of Object.entries(UPGRADES)) {
    const lvl = globalUpgrades[key];
    const maxed = lvl >= u.maxLvl;
    const cost = getUpgradeCost(key);
    const item = document.createElement("div");
    item.className = "shop-item";
    item.innerHTML = `
      <div class="shop-item-info">
        <div class="name">${u.name}</div>
        <div class="desc">${u.desc}</div>
        <div class="lvl">★${lvl}/${u.maxLvl}</div>
      </div>
      <button ${maxed || state.credits < cost ? "disabled" : ""}>
        ${maxed ? "MAX" : `${cost}💰`}
      </button>
    `;
    item.querySelector("button").onclick = () => {
      if (maxed || state.credits < cost) return;
      state.credits -= cost;
      globalUpgrades[key]++;
      playUpgrade();
      // Re-apply upgrades
      const newState = applyGlobalUpgrades();
      state.maxCore = newState.maxCore;
      if (state.core > state.maxCore) state.core = state.maxCore;
      updateHud();
      showShop(); // Refresh shop
    };
    shopItemsEl.appendChild(item);
  }
  shopPopup.classList.remove("hidden");
}
shopBtn.addEventListener("click", showShop);
closeShopBtn.addEventListener("click", () => shopPopup.classList.add("hidden"));

// ── Missing Button Handlers ──
startWaveBtn.addEventListener("click", startWave);
autoWaveBtn.addEventListener("click", () => {
  state.autoWave = !state.autoWave;
  autoWaveBtn.textContent = state.autoWave ? "🔄 Auto:ON" : "🔄 Auto";
  autoWaveBtn.className = state.autoWave ? "active" : "";
});
speedBtn.addEventListener("click", () => {
  state.speed = state.speed >= 3 ? 1 : state.speed + 1;
  updateHud();
});
pauseBtn.addEventListener("click", () => { state.paused = !state.paused; });
soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundBtn.textContent = soundEnabled ? "🔊" : "🔇";
});
mapBtn.addEventListener("click", showMapSelect);
closeMapBtn.addEventListener("click", () => mapPopup.classList.add("hidden"));
abilSlow.addEventListener("click", () => useAbility("slow"));
abilCredits.addEventListener("click", () => useAbility("credits"));
abilBoost.addEventListener("click", () => useAbility("boost"));

// ── Map Switching ──
function showMapSelect() {
  mapListEl.innerHTML = "";
  for (const [key, map] of Object.entries(MAPS)) {
    const div = document.createElement("div");
    div.className = "map-option";
    div.innerHTML = `<div class="map-icon">${map.name.slice(0,2)}</div><div><div class="map-name">${map.name}</div><div class="map-desc">${map.spots.length} spots</div></div>`;
    div.onclick = () => { switchMap(key); mapPopup.classList.add("hidden"); };
    mapListEl.appendChild(div);
  }
  mapPopup.classList.remove("hidden");
}
function switchMap(key) {
  currentMap = key; const map = MAPS[key];
  PATH = map.path; BUILD_SPOTS = new Set(map.spots);
  resetState(); updateHud();
  hintEl.textContent = `🗺️ ${map.name}`;
}

// ── Abilities ──
function useAbility(type) {
  const costs = { slow:20, credits:50, boost:30 };
  if (state.credits < costs[type] || state.abilityCD[type] > 0) return;
  state.credits -= costs[type]; state.abilityCD[type] = 15;
  if (type==="slow") state.enemies.forEach(e => { e.speedMul=0.3; e.slow=3; });
  if (type==="credits") { state.credits+=80; showScorePopup("+80💰"); }
  if (type==="boost") state.towers.forEach(t => t.cd=-1);
  updateHud();
}

// ── Screen Shake ──
function triggerShake(intensity, duration) {
  state.shakeIntensity = Math.max(state.shakeIntensity, intensity);
  state.shakeTimer = Math.max(state.shakeTimer, duration);
}

// ── Game Over (save score, play sound) ──
// Patched into drawOverlay via the main frame loop
function onGameOver() {
  playGameOver();
  if (state.score > highScore) {
    highScore = state.score;
    try { ls.setItem("galacticBloons_highScore", highScore); } catch(e) {}
  }
}

try { makeTowerButtons(); } catch(e) { document.getElementById('hint').textContent = 'ERR: '+e.message; }
try { updateHud(); } catch(e) { document.getElementById('hint').textContent = 'HUD ERR: '+e.message; }

// Apply speed to game loop
function frame(now) {
  const dt = Math.min(0.033, (now-last)/1000) * state.speed;
  last = now;

  if (!state.gameOver) {
    // Auto-wave timer
    if (state._autoWaveTimer > 0) {
      state._autoWaveTimer -= dt;
      if (state._autoWaveTimer <= 0) { state._autoWaveTimer = 0; startWave(); }
    }
    updateWaveSpawner(dt);
    updateEnemies(dt);
    updateTowers(dt);
    updateProjectiles(dt);
    updateParticles(dt);
    checkWinLose();
  } else {
    updateParticles(dt);
  }

  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawGrid();
  drawDecorTrees();
  drawEntities();
  drawOverlay();

  requestAnimationFrame(frame);
}

let last = performance.now();
requestAnimationFrame(frame);
