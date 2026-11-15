var SCRIPT_OK = "NO";
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
const statsBtn = document.getElementById("statsBtn");

const GRID = { cols: 16, rows: 9, tile: 60, ox: 32, oy: 18 };

// Placeholder – will be set after MAPS definition
let PATH, BUILD_SPOTS;

// ── BTD5/6-inspired Tower Data ─────────────────────────────────
const TOWERS = {
  laserCannon:      { name: "Laser-Affe",  cost: 100, range: 2.5, rate: 1.0, dmg: 14, color:"#45d4ff", body:"#1a7ad5", icon:"🐵", desc:"Schießt Nüsse!", upgCost:100, upgMult:1.35, maxLvl:6 },
  plasmaAoE:        { name: "Plasma-Hund", cost: 180, range: 2.2, rate: 0.65, dmg: 20, splash:1.3, color:"#c07aff", body:"#7a2bc4", icon:"🐶", desc:"Bellt Feuerbälle!", upgCost:160, upgMult:1.35, maxLvl:6 },
  ionSlow:          { name: "Eis-Katze",   cost: 160, range: 2.5, rate: 0.85, dmg: 4, slow:{factor:0.5,dur:2.0}, color:"#6af0ff", body:"#2098b0", icon:"🐱", desc:"Eis-Atem❄️", upgCost:130, upgMult:1.35, maxLvl:6 },
  empPulse:         { name: "EMP-Hase",    cost: 220, range: 2.5, rate: 0.45, dmg: 6, stun:1.2, color:"#ffe37a", body:"#b8962a", icon:"🐰", desc:"Springt & betäubt!", upgCost:180, upgMult:1.35, maxLvl:6 },
  missileSilo:      { name: "Fuchs-Bogen", cost: 300, range: 3.5, rate: 0.75, dmg: 60, color:"#ff8d66", body:"#c04520", icon:"🦊", desc:"Scharfe Pfeile!", upgCost:280, upgMult:1.35, maxLvl:6 },
  nanobotRepair:    { name: "Panda-Doc",   cost: 200, range: 0, rate: 0.25, heal: 2, color:"#76f0a0", body:"#2a9a4e", icon:"🐼", desc:"Heilt mit Bambus!", upgCost:160, upgMult:1.35, maxLvl:6 },
  quantumDisruptor: { name: "Einhorn-Mag", cost: 650, range: 5.5, rate: 0.85, dmg: 90, teleport:true, color:"#db7dff", body:"#9a2abf", icon:"🦄", desc:"Magischer Teleport!", upgCost:480, upgMult:1.35, maxLvl:6 },
  solarCollector:   { name: "Bienen-Korb", cost: 250, range: 0, rate: 0.15, income: 14, color:"#ffd54a", body:"#c89020", icon:"🐝", desc:"Sammelt Credits!", upgCost:200, upgMult:1.35, maxLvl:6 }
};

// ── BTD5/6-inspired Bloon Enemies ──────────────────────────────
const ENEMIES = {
  xarrScout:   { name:"Red Bloon",    hp: 70,  speed: 1.3,  reward: 8, coreDmg: 5,  color:"#e85050", bloon:true },
  xarrSwarm:   { name:"Blue Bloon",   hp: 45,  speed: 1.65, reward: 6, coreDmg: 3,  color:"#5090e8", bloon:true },
  xarrTank:    { name:"Green Bloon",  hp: 180, speed: 0.68, reward: 22, coreDmg: 20, color:"#50b060", armor:0.12, bloon:true },
  xarrStealth: { name:"Pink Bloon",   hp: 110, speed: 1.15, reward: 15, coreDmg: 8,  color:"#e870b0", stealth:true, bloon:true },
  xarrArmored: { name:"Ceramic",      hp: 180, speed: 0.88, reward: 20, coreDmg: 16, color:"#c0a060", armor:0.35, bloon:true },
  xarrLead:    { name:"Lead Bloon",   hp: 240, speed: 0.62, reward: 28, coreDmg: 20, color:"#808890", armor:0.3, immune:["laserCannon"], bloon:true },
  xarrRainbow: { name:"Rainbow",      hp: 90,  speed: 1.25, reward: 12, coreDmg: 7,  color:"#ff6080", splits:true, bloon:true },
  xarrZebra:   { name:"Zebra Bloon",  hp: 70,  speed: 1.75, reward: 9, coreDmg: 5,  color:"#2a2a2a", bloon:true },
  xarrDDT:     { name:"D.D.T.",       hp: 420, speed: 1.75, reward: 45, coreDmg: 30, color:"#1a1a2a", stealth:true, armor:0.32, boss:true },
  xarrBlack:   { name:"Black Bloon",  hp: 120, speed: 1.5,  reward: 14, coreDmg: 6,  color:"#1a1a1a", immune:["plasmaAoE","empPulse","missileSilo"], bloon:true },
  xarrWhite:   { name:"White Bloon",  hp: 100, speed: 1.4,  reward: 13, coreDmg: 6,  color:"#f0f0f0", immune:["ionSlow"], bloon:true },
  xarrPurple:  { name:"Purple Bloon", hp: 130, speed: 1.35, reward: 16, coreDmg: 7,  color:"#b070d0", immune:["quantumDisruptor"], bloon:true },
  xarrGold:    { name:"Gold Bloon",   hp: 60,  speed: 2.0,  reward: 40, coreDmg: 3,  color:"#ffd700", bloon:true },
  xarrGhost:   { name:"Ghost Bloon",  hp: 80,  speed: 1.1,  reward: 18, coreDmg: 10, color:"#a0d0ff", stealth:true, bloon:true },
  xarrBoss:    { name:"M.O.A.B.",     hp: 1100,speed: 0.55, reward: 250, coreDmg: 80, color:"#ff4ec5", armor:0.15, boss:true },
  xarrBFB:     { name:"B.F.B.",       hp: 2400,speed: 0.42, reward: 350, coreDmg: 140,color:"#ff3030", armor:0.20, boss:true },
  xarrZOMG:    { name:"Z.O.M.G.",     hp: 4800,speed: 0.32, reward: 700, coreDmg: 250,color:"#30ff30", armor:0.25, immune:["ionSlow"], boss:true },
  xarrBAD:     { name:"B.A.D.",       hp: 7500,speed: 0.22, reward: 2500, coreDmg: 400,color:"#ff00ff", armor:0.28, immune:["ionSlow","empPulse","quantumDisruptor"], boss:true }
};

const WAVES = (function(){
  var w=[],S="xarrScout",B="xarrSwarm",T="xarrTank",P="xarrStealth",C="xarrArmored",L="xarrLead",R="xarrRainbow",Z="xarrZebra",D="xarrDDT",K="xarrBlack",H="xarrWhite",U="xarrPurple",G="xarrGold",O="xarrGhost",M="xarrBoss",F="xarrBFB",XM="xarrZOMG",BA="xarrBAD";
  var n=function(t,c){return{type:t,count:c}};
  for(var i=0;i<100;i++){
    var s=i+1,h=function(v){return Math.max(1,Math.round(v*(1+i*0.05)))};if(s===100)w.push([n(BA,2),n(XM,3),n(F,4),n(D,10),n(C,20),n(L,15)]);
    else if(s===90)w.push([n(XM,3),n(F,4),n(D,6),n(BA,1),n(K,12),n(H,12)]);
    else if(s===80)w.push([n(XM,3),n(F,4),n(D,8),n(C,15),n(U,12)]);
    else if(s===70)w.push([n(F,4),n(D,6),n(K,12),n(H,12),n(U,12)]);
    else if(s===60)w.push([n(M,4),n(F,2),n(D,5),n(C,12),n(L,10)]);
    else if(s===50)w.push([n(XM,2),n(F,3),n(M,3),n(D,4)]);
    else if(s===40)w.push([n(F,2),n(D,3),n(K,8),n(H,8),n(C,10)]);
    else if(s===30)w.push([n(F,1),n(M,2),n(D,2),n(L,6)]);
    else if(s===20)w.push([n(M,2),n(D,1),n(C,6),n(L,4)]);
    else if(s===10)w.push([n(M,1),n(L,2),n(C,3)]);
    else if(s>20&&s%10===9)w.push([n(BA,s>89?1:0),n(XM,s>79?1:0),n(F,s>49?2:1),n(D,Math.min(12,Math.max(1,Math.floor((s-20)/7)))),n(C,h(5+s/5))]);
    else if(s%5===0)w.push([n(G,h(8)),n(R,h(6)),n(Z,h(4+s/5)),n(O,s>25?h(4):0)]);
    else if(s<5)w.push([n(S,h(6+i*2)),n(B,i>1?h(3+i):0)]);
    else if(s<10)w.push([n(S,h(5+i)),n(B,h(3+i)),n(T,i>6?h(1):0)]);
    else if(s<15)w.push([n(T,h(1+i/3)),n(C,h(1+i/4)),n(P,h(2)),n(R,h(2))]);
    else if(s<20)w.push([n(T,h(2+i/4)),n(C,h(2+i/5)),n(P,h(3)),n(L,h(1+i/8))]);
    else if(s<25)w.push([n(T,h(3+i/4)),n(C,h(3+i/4)),n(L,h(2)),n(K,h(2)),n(H,h(2))]);
    else if(s<35)w.push([n(C,h(4+i/5)),n(L,h(3+i/6)),n(K,h(3)),n(H,h(3)),n(U,h(3)),n(D,s>29?h(1):0)]);
    else if(s<45)w.push([n(C,h(5+i/4)),n(L,h(4+i/5)),n(K,h(4)),n(H,h(4)),n(U,h(4)),n(D,Math.min(12,Math.max(1,Math.floor((s-20)/7)))),n(Z,h(5))]);
    else if(s<55)w.push([n(C,h(6+i/3)),n(L,h(5+i/4)),n(K,h(5)),n(H,h(5)),n(U,h(5)),n(D,Math.min(12,Math.max(1,Math.floor((s-20)/7)))),n(Z,h(6)),n(O,h(4))]);
    else if(s<65)w.push([n(C,h(8+i/3)),n(L,h(6+i/3)),n(K,h(6)),n(H,h(6)),n(U,h(6)),n(D,Math.min(12,Math.max(1,Math.floor((s-20)/7)))),n(Z,h(8)),n(O,h(5)),n(G,h(3))]);
    else if(s<75)w.push([n(C,h(10+i/3)),n(L,h(8+i/3)),n(K,h(8)),n(H,h(8)),n(U,h(8)),n(D,Math.min(12,Math.max(1,Math.floor((s-20)/7)))),n(Z,h(10)),n(O,h(6)),n(G,h(4))]);
    else if(s<85)w.push([n(C,h(12+i/3)),n(L,h(10+i/3)),n(K,h(10)),n(H,h(10)),n(U,h(10)),n(D,Math.min(12,Math.max(1,Math.floor((s-20)/7)))),n(Z,h(12)),n(O,h(8)),n(G,h(5))]);
    else if(s<95)w.push([n(C,h(14+i/4)),n(L,h(12+i/4)),n(K,h(12)),n(H,h(12)),n(U,h(12)),n(D,Math.min(12,Math.max(1,Math.floor((s-20)/7)))),n(Z,h(14)),n(O,h(10)),n(G,h(6))]);
    else w.push([n(C,h(16+i/5)),n(L,h(14+i/5)),n(K,h(14)),n(H,h(14)),n(U,h(14)),n(D,Math.min(12,Math.max(1,Math.floor((s-20)/7)))),n(Z,h(16)),n(O,h(12)),n(G,h(8))]);
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
    theme:{bg1:"#b88435",bg2:"#7d551d",path1:"#f5e1ad",path2:"#d8b46a",deco1:"#5a7a2a",deco2:"#7a9a3a",name:"Wüste"}
  },
  frozen: {
    name:"❄️ Eis", path:[[0,5],[1,5],[2,5],[2,4],[3,4],[4,4],[4,3],[5,3],[6,3],[7,3],[7,4],[8,4],[9,4],[9,3],[10,3],[11,3],[11,4],[12,4],[12,5],[13,5],[14,5],[15,5]],
    spots:["2,3","2,6","3,3","3,5","4,5","4,2","5,2","5,4","6,2","6,4","7,2","7,5","8,3","8,5","9,2","9,5","10,2","10,4","11,2","11,5","13,4"],
    theme:{bg1:"#366894",bg2:"#1b3a57",path1:"#eaf6ff",path2:"#bddbf0",deco1:"#d0e8f0",deco2:"#b0d0e0",name:"Eis"}
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
  towerDamage:     { name: "Turm Schaden +", baseCost: 400, costMult: 2.0, maxLvl: 3, desc: "+10% Turm-Schaden", perLvl: 10 },
  towerRange:      { name: "Turm Reichweite +", baseCost: 350, costMult: 1.9, maxLvl: 3, desc: "+8% Reichweite", perLvl: 8 },
  fireRate:        { name: "Feuerrate +", baseCost: 500, costMult: 2.2, maxLvl: 2, desc: "+8% Feuerrate", perLvl: 8 },
  coreBoost:       { name: "Kern-Leben +", baseCost: 250, costMult: 1.6, maxLvl: 4, desc: "+25 Kern-Leben", perLvl: 25 }
};
const globalUpgrades = { startingCredits:0, towerDamage:0, towerRange:0, fireRate:0, coreBoost:0 };
try {
  const savedUpgrades = JSON.parse(ls.getItem("galacticBloons_upgrades"));
  if (savedUpgrades && typeof savedUpgrades === "object") {
    for (const k of Object.keys(globalUpgrades)) {
      if (typeof savedUpgrades[k] === "number") globalUpgrades[k] = savedUpgrades[k];
    }
  }
} catch(e) {}
function getUpgradeCost(key) {
  const u = UPGRADES[key];
  return Math.floor(u.baseCost * Math.pow(u.costMult, globalUpgrades[key]));
}

// ── Expanded State ──────────────────────────────────────────────
function applyGlobalUpgrades() {
  const extraCredits = globalUpgrades.startingCredits * UPGRADES.startingCredits.perLvl;
  const extraCore = globalUpgrades.coreBoost * UPGRADES.coreBoost.perLvl;
  return { credits: 550 + extraCredits, core: 150 + extraCore, maxCore: 150 + extraCore };
}
function getTowerStats(towerDef, level) {
  const dmgMult = 1 + globalUpgrades.towerDamage * (UPGRADES.towerDamage.perLvl / 100);
  const rangeMult = 1 + globalUpgrades.towerRange * (UPGRADES.towerRange.perLvl / 100);
  const rateMult = 1 + globalUpgrades.fireRate * (UPGRADES.fireRate.perLvl / 100);
  const lvlBonus = 1 + (level - 1) * 0.28;
  return {
    damage: towerDef.dmg ? Math.round(towerDef.dmg * dmgMult * lvlBonus) : 0,
    range: towerDef.range * rangeMult * (1 + (level - 1) * 0.1),
    rate: towerDef.rate * rateMult * (1 + (level - 1) * 0.1),
    income: towerDef.income ? Math.round(towerDef.income * lvlBonus) : 0,
    heal: towerDef.heal ? Math.round(towerDef.heal * lvlBonus) : 0
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
  state.floatingTexts = []; state.shockwaves = []; state.hoverTile = null;
  state.abilityCD = { slow:0, credits:0, boost:0 };
  state._nextTowerId = 1;
  particles = [];
  syncButtons();
}

function syncButtons() {
  pauseBtn.textContent = state.paused ? "▶️" : "⏸️";
  pauseBtn.className = state.paused ? "active" : "";
  autoWaveBtn.textContent = state.autoWave ? "🔄 Auto:ON" : "🔄 Auto";
  autoWaveBtn.className = state.autoWave ? "active" : "";
  speedBtn.textContent = state.speed === 3 ? "⏩ 3×" : state.speed === 2 ? "⏩ 2×" : "⏩ 1×";
  speedBtn.className = state.speed > 1 ? "active" : "";
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

const ABILITY_COSTS = { slow: 20, credits: 50, boost: 30 };

function updateAbilitiesUI() {
  if (!abilitiesEl) return;
  abilitiesEl.classList.remove("hidden");
  const btns = [
    { el: abilSlow, key: "slow", label: "🐌 Slow" },
    { el: abilCredits, key: "credits", label: "💰 Bonus" },
    { el: abilBoost, key: "boost", label: "⚡ Boost" }
  ];
  for (const { el, key, label } of btns) {
    const cd = state.abilityCD[key] || 0;
    const cost = ABILITY_COSTS[key];
    el.textContent = cd > 0 ? `${label} (${Math.ceil(cd)}s)` : `${label} (${cost}💰)`;
    el.disabled = cd > 0 || state.credits < cost;
  }
}

function updateHud() {
  creditsEl.textContent = `💰 ${state.credits}`;
  scoreEl.textContent = `🏆 ${state.score}`;
  coreEl.textContent = `❤️ ${state.core}/${state.maxCore}`;
  waveEl.textContent = `🌊 ${state.wave}/${WAVES.length}`;
  speedBtn.textContent = state.speed === 1 ? "⏩ 1×" : state.speed === 2 ? "⏩ 2×" : "⏩ 3×";
  speedBtn.className = state.speed > 1 ? "active" : "";
  updateAbilitiesUI();
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

function spawnFloatingText(x, y, text, color = "#ffffff") {
  state.floatingTexts.push({ x, y, text, color, life: 1.0, maxLife: 1.0 });
}

function spawnShockwave(x, y, maxR, color = "#ffe37a") {
  state.shockwaves.push({ x, y, r: 4, maxR, color, life: 0.35, maxLife: 0.35 });
}

function updateEffects(dt) {
  for (const ft of state.floatingTexts) {
    ft.y -= 28 * dt;
    ft.life -= dt;
  }
  state.floatingTexts = state.floatingTexts.filter(ft => ft.life > 0);
  for (const sw of state.shockwaves) {
    sw.life -= dt;
    const prog = 1 - Math.max(0, sw.life / sw.maxLife);
    sw.r = 4 + (sw.maxR - 4) * prog;
  }
  state.shockwaves = state.shockwaves.filter(sw => sw.life > 0);
}

function spawnEnemy(typeKey, idx = 0, prog = 0) {
  const e = ENEMIES[typeKey];
  const a = toPx(PATH[idx][0], PATH[idx][1]);
  const b = PATH[idx + 1] ? toPx(PATH[idx + 1][0], PATH[idx + 1][1]) : a;
  const start = { x: a.x + (b.x - a.x) * prog, y: a.y + (b.y - a.y) * prog };
  state.enemies.push({
    typeKey, hp: e.hp, maxHp: e.hp, speedMul: 1, stun: 0, slow: 0,
    idx, prog, x: start.x, y: start.y, revealed: !e.stealth
  });
  if (e.boss) {
    triggerShake(6, 0.35);
    spawnFloatingText(start.x + 80, start.y - 24, "⚠️ " + e.name, e.color);
  }
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
      triggerShake(Math.min(10, Math.max(3, ENEMIES[e.typeKey].coreDmg / 8)), 0.3);
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
  if (def.teleport) {
    if (ENEMIES[target.typeKey].boss) {
      target.idx = Math.max(0, target.idx - 2);
      target.prog = 0;
    } else {
      target.idx = 0;
      target.prog = 0;
    }
    const p = toPx(PATH[target.idx][0], PATH[target.idx][1]);
    target.x = p.x;
    target.y = p.y;
  }
}

function selectTarget(validTargets, pos, mode) {
  if (mode === "last") {
    return validTargets.reduce((a, b) => (a.idx + a.prog < b.idx + b.prog ? a : b));
  }
  if (mode === "strong") {
    return validTargets.reduce((a, b) => (a.hp !== b.hp ? (a.hp > b.hp ? a : b) : (a.idx + a.prog > b.idx + b.prog ? a : b)));
  }
  if (mode === "near") {
    return validTargets.reduce((a, b) => (dist(pos, a) < dist(pos, b) ? a : b));
  }
  return validTargets.reduce((a, b) => (a.idx + a.prog > b.idx + b.prog ? a : b));
}

function damageEnemy(e, rawDmg) {
  if (!e || e.hp <= 0) return;
  const ed = ENEMIES[e.typeKey];
  const real = rawDmg * (1 - (ed.armor || 0));
  e.hp -= real;
  e.revealed = true;
  if (e.hp <= 0 && !e._killed) {
    e._killed = true;
    state.credits += ed.reward;
    state.stats.kills++;
    state.stats.moneyEarned += ed.reward;
    state.score += ed.reward;
    if (ed.bloon) spawnBloonPop(e.x, e.y, ed.color);
    else spawnExplosion(e.x, e.y, ed.color);
    if (ed.splits && !e._splitSpawned) {
      e._splitSpawned = true;
      for (const childType of ["xarrScout", "xarrSwarm"]) {
        const ce = ENEMIES[childType];
        state.enemies.push({
          typeKey: childType, hp: ce.hp, maxHp: ce.hp, speedMul: 1, stun: 0, slow: 0,
          idx: e.idx, prog: e.prog, x: e.x, y: e.y, revealed: !ce.stealth
        });
      }
    }
  }
}

function updateTowers(dt) {
  for (const t of state.towers) {
    const def = TOWERS[t.type];
    const stats = getTowerStats(def, t.lvl);
    t.cd -= dt;
    const pos = toPx(t.c,t.r);

    if (def.income && t.cd <= 0) {
      state.credits += stats.income;
      state.stats.moneyEarned += stats.income;
      spawnFloatingText(pos.x, pos.y - 18, "+" + stats.income + "💰", "#ffd84d");
      updateHud();
      t.cd = 1 / stats.rate;
      continue;
    }
    if (def.heal && t.cd <= 0) {
      state.core = Math.min(state.maxCore, state.core + stats.heal);
      spawnFloatingText(pos.x, pos.y - 18, "+" + stats.heal + "❤️", "#4ade80");
      updateHud();
      t.cd = 1 / stats.rate;
      continue;
    }
    if (t.cd > 0) continue;

    const inRange = state.enemies.filter(e => e.hp>0 && dist(pos,e) <= stats.range * GRID.tile);
    if (!inRange.length) continue;
    // Filter out immune targets
    const validTargets = inRange.filter(e => {
      const ed = ENEMIES[e.typeKey];
      return !ed.immune || !ed.immune.includes(t.type);
    });
    if (!validTargets.length) continue;

    if (t.type === "empPulse") {
      spawnShockwave(pos.x, pos.y, stats.range * GRID.tile, "#ffe37a");
      for (const e of validTargets) {
        damageEnemy(e, stats.damage);
        if (e.hp > 0) applyTowerEffects(t, e);
      }
      updateHud();
      t.cd = 1 / stats.rate;
      continue;
    }

    const target = selectTarget(validTargets, pos, t.targetMode || "first");
    const dx = target.x - pos.x, dy = target.y - pos.y;
    const d = Math.hypot(dx, dy) || 1;
    spawnParticles(pos.x, pos.y, def.color, 3, 1.8, 0.2);
    state.projectiles.push({ x: pos.x, y: pos.y, tx: target.x, ty: target.y, vx: dx/d*420, vy: dy/d*420, dmg: stats.damage, splash: def.splash || 0, color: def.color, towerType: t.type, target });
    t.cd = 1 / stats.rate;
  }
}

function updateProjectiles(dt) {
  for (const p of state.projectiles) {
    if (p.target && p.target.hp > 0) {
      p.tx = p.target.x;
      p.ty = p.target.y;
    }
    const dx = p.tx - p.x, dy = p.ty - p.y;
    const d = Math.hypot(dx, dy);
    const step = 420 * dt;
    if (d < Math.max(8, step)) {
      if (p.target && p.target.hp > 0) {
        damageEnemy(p.target, p.dmg);

        // Hit effect
        spawnParticles(p.x, p.y, p.color, 5, 2, 0.3);

        if (p.target.hp > 0) {
          applyTowerEffects({ type: p.towerType }, p.target);
        }
      }
      if (p.splash > 0) {
        const hitPos = { x: p.tx, y: p.ty };
        spawnExplosion(p.tx, p.ty, p.color);
        for (const e of state.enemies) {
          if (e === p.target || e.hp <= 0) continue;
          if (ENEMIES[e.typeKey].immune?.includes(p.towerType)) continue;
          if (dist(e, hitPos) <= p.splash * GRID.tile) damageEnemy(e, p.dmg * 0.5);
        }
      }
      p.done = true;
      updateHud();
      continue;
    }
    p.vx = (dx / d) * 420;
    p.vy = (dy / d) * 420;
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
    state.spawnTimer = Math.max(0.28, 0.85 - state.wave * 0.005);
  }
  if (!state.waveQueue.length) state.waveSpawning = false;
}

function checkWinLose() {
  if (state.gameOver) return;
  // Wave completion bonus
  if (!state.waveSpawning && state.enemies.length === 0 && state.wave > 0 && !state._waveBonusGiven) {
    const bonus = getWaveBonus(state.wave);
    const waveCash = 40 + state.wave * 8;
    state.credits += waveCash;
    state.stats.moneyEarned += waveCash;
    state.score += bonus;
    state.stats.wavesCompleted++;
    state._waveBonusGiven = true;
    showScorePopup(`+${waveCash}💰 • +${bonus}🏆 Welle ${state.wave}`);
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

  // Subtle background grid tiles (non-path, non-build)
  for (let r = 0; r < GRID.rows; r++) {
    for (let c = 0; c < GRID.cols; c++) {
      const x = GRID.ox + c * GRID.tile, y = GRID.oy + r * GRID.tile;
      const key = `${c},${r}`;
      const isPath = PATH.some(p => p[0] === c && p[1] === r);
      const isBuild = BUILD_SPOTS.has(key);
      if (!isPath && !isBuild) {
        ctx.fillStyle = `rgba(255,255,255,${0.025+((c*7+r*13)%6)*0.007})`;
        ctx.fillRect(x+2,y+2,GRID.tile-4,GRID.tile-4);
      }
    }
  }

  // Smoothly connected path ribbon
  if (PATH.length > 0) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // Outer dark road curb
    ctx.beginPath();
    PATH.forEach(([pc, pr], idx) => {
      const px = GRID.ox + pc * GRID.tile + GRID.tile / 2;
      const py = GRID.oy + pr * GRID.tile + GRID.tile / 2;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = lerpColor(t.path2, -0.35);
    ctx.lineWidth = GRID.tile - 4;
    ctx.stroke();

    // Main road fill
    ctx.strokeStyle = t.path2;
    ctx.lineWidth = GRID.tile - 9;
    ctx.stroke();

    // Inner sunlit road center
    ctx.strokeStyle = t.path1;
    ctx.lineWidth = GRID.tile - 16;
    ctx.stroke();
    ctx.restore();

    // Pebbles & subtle road texture per path tile
    for (let i = 0; i < PATH.length; i++) {
      const [pc, pr] = PATH[i];
      const px = GRID.ox + pc * GRID.tile;
      const py = GRID.oy + pr * GRID.tile;
      const seed = pc * 37 + pr * 73;
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.beginPath();
      ctx.ellipse(px + 12 + (seed % 14), py + 14 + ((seed * 3) % 14), 3, 2, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.beginPath();
      ctx.ellipse(px + 26 - (seed % 10), py + 28 - ((seed * 5) % 10), 2.2, 1.5, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Build-spot platform pads (high contrast per map theme)
  const padColors = {
    grass:  { top: "#735334", bot: "#4d351e", rim: "#2a1a0b", inner: "rgba(255, 224, 150, 0.32)" },
    desert: { top: "#8a5229", bot: "#5c3314", rim: "#361b07", inner: "rgba(255, 215, 130, 0.36)" },
    frozen: { top: "#3b5978", bot: "#243b54", rim: "#112030", inner: "rgba(180, 235, 255, 0.42)" },
    space:  { top: "#3b3a6e", bot: "#232247", rim: "#121129", inner: "rgba(120, 210, 255, 0.42)" }
  }[currentMap] || { top: "#6b4c2e", bot: "#48321c", rim: "#26180c", inner: "rgba(255,255,255,0.28)" };

  for (const key of BUILD_SPOTS) {
    const [c, r] = key.split(",").map(Number);
    const x = GRID.ox + c * GRID.tile, y = GRID.oy + r * GRID.tile;
    // Pad drop shadow
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath(); ctx.roundRect(x+4, y+6, GRID.tile-8, GRID.tile-8, 7); ctx.fill();
    // Pad body
    const sg = ctx.createLinearGradient(x, y+4, x, y+GRID.tile-4);
    sg.addColorStop(0, padColors.top);
    sg.addColorStop(1, padColors.bot);
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.roundRect(x+4, y+4, GRID.tile-8, GRID.tile-8, 7); ctx.fill();
    // Pad rim
    ctx.strokeStyle = padColors.rim;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Inner dashed placement frame
    ctx.strokeStyle = padColors.inner;
    ctx.lineWidth = 1.1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.roundRect(x+8, y+8, GRID.tile-16, GRID.tile-16, 4); ctx.stroke();
    ctx.setLineDash([]);
  }
}

// ── Static decorations (themed per map) ──
const DECOR_TREES = (() => {
  const pos = [[-1,-1],[-1,3],[-1,8],[0,-1],[7,-1],[15,-1],[16,0],[16,4],[16,8],[15,9],[10,9],[4,9],[0,9]];
  return pos.map(([c,r]) => ({x:GRID.ox+c*GRID.tile+GRID.tile/2,y:GRID.oy+r*GRID.tile+GRID.tile/2}));
})();

function drawDecorTrees() {
  for (const p of DECOR_TREES) {
    // Soft ground shadow
    ctx.fillStyle = "rgba(0,0,0,0.26)";
    ctx.beginPath(); ctx.ellipse(p.x+2, p.y+10, 12, 5, 0, 0, Math.PI*2); ctx.fill();

    if (currentMap === "grass") {
      // Trunk
      ctx.fillStyle = "#5c3a1a";
      ctx.strokeStyle = "#2b1808"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.roundRect(p.x-3.5, p.y-2, 7, 13, 2); ctx.fill(); ctx.stroke();
      // Layered foliage
      ctx.fillStyle = "#1f6f26";
      ctx.beginPath(); ctx.arc(p.x+3, p.y-5, 11, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#2d9435";
      ctx.beginPath(); ctx.arc(p.x, p.y-7, 13, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = "#144718"; ctx.lineWidth = 1.3; ctx.stroke();
      // Sunlit leaf puff
      ctx.fillStyle = "#48b84f";
      ctx.beginPath(); ctx.arc(p.x-4, p.y-10, 7, 0, Math.PI*2); ctx.fill();
    } else if (currentMap === "desert") {
      // Saguaro cactus with arms & spines
      ctx.fillStyle = "#3e7d32";
      ctx.strokeStyle = "#1c4215"; ctx.lineWidth = 1.3;
      // Left arm
      ctx.beginPath(); ctx.roundRect(p.x-10, p.y-5, 6, 8, 3); ctx.fill(); ctx.stroke();
      // Right arm
      ctx.beginPath(); ctx.roundRect(p.x+4, p.y-8, 6, 9, 3); ctx.fill(); ctx.stroke();
      // Main stem
      ctx.fillStyle = "#4c963e";
      ctx.beginPath(); ctx.roundRect(p.x-4, p.y-13, 8, 24, 4); ctx.fill(); ctx.stroke();
      // Spines
      ctx.strokeStyle = "#e8f5c8"; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x-4, p.y-9); ctx.lineTo(p.x-6.5, p.y-10);
      ctx.moveTo(p.x+4, p.y-4); ctx.lineTo(p.x+6.5, p.y-5);
      ctx.moveTo(p.x-4, p.y+2); ctx.lineTo(p.x-6.5, p.y+1);
      ctx.stroke();
    } else if (currentMap === "frozen") {
      // Ice crystal cluster
      ctx.strokeStyle = "#3a7ca5"; ctx.lineWidth = 1.2;
      ctx.fillStyle = "#7dd3fc";
      ctx.beginPath(); ctx.moveTo(p.x-9, p.y+8); ctx.lineTo(p.x-5, p.y-7); ctx.lineTo(p.x, p.y+8); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#bae6fd";
      ctx.beginPath(); ctx.moveTo(p.x-4, p.y+9); ctx.lineTo(p.x+1, p.y-13); ctx.lineTo(p.x+6, p.y+9); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#e0f2fe";
      ctx.beginPath(); ctx.moveTo(p.x+2, p.y+8); ctx.lineTo(p.x+8, p.y-4); ctx.lineTo(p.x+10, p.y+8); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else {
      // Glowing space asteroid + nebula
      const neb = ctx.createRadialGradient(p.x, p.y-2, 2, p.x, p.y-2, 16);
      neb.addColorStop(0, "rgba(192,132,252,0.45)");
      neb.addColorStop(1, "rgba(192,132,252,0)");
      ctx.fillStyle = neb;
      ctx.beginPath(); ctx.arc(p.x, p.y-2, 16, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#4b3b6b";
      ctx.strokeStyle = "#a855f7"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(p.x, p.y-2, 9, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#2d2145";
      ctx.beginPath(); ctx.arc(p.x-3, p.y-4, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(p.x+3, p.y+1, 2, 0, Math.PI*2); ctx.fill();
    }
  }
}

// ── BTD6-style Bloon Drawing ───────────────────────────────────
function drawBloon(x, y, radius, color, isBoss, alpha = 1, typeKey = null, hpPct = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const rx = radius * 0.92;
  const ry = radius * 1.08;
  drawShadow(x, y + 4, rx * 2.1, radius * 0.9);

  // Base vertical-oval body
  const g = ctx.createRadialGradient(x - rx * 0.3, y - ry * 0.35, radius * 0.05, x, y, ry);
  g.addColorStop(0, "#fff");
  g.addColorStop(0.16, lerpColor(color, 0.45));
  g.addColorStop(0.55, color);
  g.addColorStop(0.88, lerpColor(color, -0.22));
  g.addColorStop(1, lerpColor(color, -0.45));

  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();

  // Clipped special textures per typeKey
  if (typeKey) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.clip();

    if (typeKey === "xarrZebra") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x - rx, y - ry, rx * 2, ry * 2);
      ctx.strokeStyle = "#18181b";
      ctx.lineWidth = Math.max(2.5, radius * 0.34);
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x - rx * 1.4 + i * radius * 0.65, y - ry * 1.2);
        ctx.lineTo(x + rx * 0.6 + i * radius * 0.65, y + ry * 1.2);
        ctx.stroke();
      }
    } else if (typeKey === "xarrRainbow") {
      const bands = ["#ff3b30", "#ff9500", "#ffd60a", "#34c759", "#007aff", "#af52de"];
      const bandH = (ry * 2) / bands.length;
      for (let i = 0; i < bands.length; i++) {
        ctx.fillStyle = bands[i];
        ctx.fillRect(x - rx, y - ry + i * bandH, rx * 2, bandH + 0.8);
      }
    } else if (typeKey === "xarrLead") {
      const lg = ctx.createLinearGradient(x - rx, y - ry, x + rx, y + ry);
      lg.addColorStop(0, "#e2e8f0");
      lg.addColorStop(0.4, "#94a3b8");
      lg.addColorStop(0.75, "#475569");
      lg.addColorStop(1, "#1e293b");
      ctx.fillStyle = lg;
      ctx.fillRect(x - rx, y - ry, rx * 2, ry * 2);
      // Brushed metal sheen
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - rx * 0.8, y - ry * 0.2);
      ctx.lineTo(x + rx * 0.8, y - ry * 0.5);
      ctx.stroke();
      // 4 rivets
      ctx.fillStyle = "#1e293b";
      const ro = radius * 0.42;
      for (const [dx, dy] of [[-ro, -ro], [ro, -ro], [-ro, ro], [ro, ro]]) {
        ctx.beginPath(); ctx.arc(x + dx, y + dy, 1.3, 0, Math.PI * 2); ctx.fill();
      }
    } else if (typeKey === "xarrArmored") {
      const cg = ctx.createRadialGradient(x - rx * 0.25, y - ry * 0.3, 1, x, y, ry);
      cg.addColorStop(0, "#f5d0a9");
      cg.addColorStop(0.55, "#c68642");
      cg.addColorStop(1, "#7c471b");
      ctx.fillStyle = cg;
      ctx.fillRect(x - rx, y - ry, rx * 2, ry * 2);
      // Ceramic crack lines (stronger when hpPct < 0.7)
      ctx.strokeStyle = hpPct < 0.7 ? "#2c1506" : "rgba(44, 21, 6, 0.45)";
      ctx.lineWidth = hpPct < 0.7 ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(x - rx * 0.4, y - ry * 0.5);
      ctx.lineTo(x, y - ry * 0.05);
      ctx.lineTo(x + rx * 0.35, y + ry * 0.35);
      if (hpPct < 0.7) {
        ctx.moveTo(x, y - ry * 0.05);
        ctx.lineTo(x - rx * 0.5, y + ry * 0.4);
        ctx.moveTo(x + rx * 0.2, y - ry * 0.45);
        ctx.lineTo(x + rx * 0.05, y + ry * 0.1);
      }
      ctx.stroke();
    } else if (typeKey === "xarrGold") {
      const gg = ctx.createRadialGradient(x - rx * 0.3, y - ry * 0.3, 1, x, y, ry);
      gg.addColorStop(0, "#fffbeb");
      gg.addColorStop(0.35, "#fde047");
      gg.addColorStop(0.8, "#eab308");
      gg.addColorStop(1, "#a16207");
      ctx.fillStyle = gg;
      ctx.fillRect(x - rx, y - ry, rx * 2, ry * 2);
      // Sparkling 4-point star
      ctx.fillStyle = "#ffffff";
      const sx = x + rx * 0.28, sy = y - ry * 0.28, sr = radius * 0.35;
      ctx.beginPath();
      ctx.moveTo(sx, sy - sr); ctx.lineTo(sx + sr * 0.28, sy - sr * 0.28);
      ctx.lineTo(sx + sr, sy); ctx.lineTo(sx + sr * 0.28, sy + sr * 0.28);
      ctx.lineTo(sx, sy + sr); ctx.lineTo(sx - sr * 0.28, sy + sr * 0.28);
      ctx.lineTo(sx - sr, sy); ctx.lineTo(sx - sr * 0.28, sy - sr * 0.28);
      ctx.closePath(); ctx.fill();
    } else if (typeKey === "xarrStealth" || typeKey === "xarrGhost") {
      // Subtle camo blotches + ghostly shimmer
      ctx.fillStyle = typeKey === "xarrGhost" ? "rgba(200, 235, 255, 0.3)" : "rgba(15, 35, 18, 0.36)";
      ctx.beginPath(); ctx.ellipse(x - rx * 0.35, y - ry * 0.1, rx * 0.42, ry * 0.28, 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + rx * 0.3, y + ry * 0.28, rx * 0.38, ry * 0.25, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + rx * 0.15, y - ry * 0.45, rx * 0.32, ry * 0.2, 0.2, 0, Math.PI * 2); ctx.fill();
    } else if (typeKey === "xarrBlack" || typeKey === "xarrWhite" || typeKey === "xarrPurple") {
      // Characteristic inner emblem / sheen
      ctx.strokeStyle = typeKey === "xarrWhite" ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.32)";
      ctx.lineWidth = 1.2;
      if (typeKey === "xarrPurple") {
        ctx.beginPath();
        ctx.moveTo(x, y - ry * 0.42); ctx.lineTo(x + rx * 0.36, y);
        ctx.lineTo(x, y + ry * 0.42); ctx.lineTo(x - rx * 0.36, y);
        ctx.closePath(); ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y + ry * 0.12, radius * 0.32, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Crisp cartoon outline
  ctx.strokeStyle = typeKey === "xarrLead" ? "#0f172a" : "#1c1208";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Double crescent shine top-left
  ctx.fillStyle = "rgba(255,255,255,0.52)";
  ctx.beginPath(); ctx.ellipse(x - rx * 0.32, y - ry * 0.36, rx * 0.38, ry * 0.22, -0.45, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.beginPath(); ctx.ellipse(x - rx * 0.14, y - ry * 0.16, rx * 0.15, ry * 0.1, -0.3, 0, Math.PI * 2); ctx.fill();

  // Gently swaying knot + string
  const sway = Math.sin(Date.now() / 260 + x * 0.05) * 2.2;
  ctx.fillStyle = lerpColor(color, -0.45);
  ctx.strokeStyle = "#1c1208";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 3, y + ry - 1);
  ctx.lineTo(x + 3, y + ry - 1);
  ctx.lineTo(x + sway * 0.25, y + ry + 3.5);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  ctx.strokeStyle = "rgba(0,0,0,0.28)";
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(x + sway * 0.25, y + ry + 3.5);
  ctx.quadraticCurveTo(x + 4 + sway, y + ry + 9, x - 1 + sway * 0.6, y + ry + 15);
  ctx.stroke();

  ctx.restore();
}

// ── Universal Zeppelin Boss Drawing (DDT/MOAB/BFB/ZOMG/BAD) ──
function drawBoss(x, y, enemy) {
  const ed = ENEMIES[enemy.typeKey];
  const hpPct = Math.max(0, enemy.hp / enemy.maxHp);
  const sizes = { xarrDDT: 17, xarrBoss: 23, xarrBFB: 29, xarrZOMG: 35, xarrBAD: 42 };
  const r = sizes[enemy.typeKey] || 23;
  const rx = r * 1.18;
  const ry = r * 0.66;
  const pulse = Math.sin(Date.now() / 320) * 0.15 + 0.85;

  ctx.save();
  drawShadow(x, y + 7, rx * 2.1, ry * 1.35);

  // BAD energy aura
  if (enemy.typeKey === "xarrBAD") {
    ctx.shadowColor = "#d946ef";
    ctx.shadowBlur = 22 * pulse;
    ctx.fillStyle = "rgba(192, 38, 211, 0.24)";
    ctx.beginPath(); ctx.ellipse(x, y, rx + 5, ry + 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Gondola underneath
  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#090d16";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x - rx * 0.28, y + ry * 0.65, rx * 0.56, ry * 0.32, 3);
  ctx.fill(); ctx.stroke();

  // Tail fins (top & bottom on left/rear)
  const finColor = enemy.typeKey === "xarrDDT" ? "#1e1b2e"
    : enemy.typeKey === "xarrBoss" ? "#2563eb"
    : enemy.typeKey === "xarrBFB" ? "#991b1b"
    : enemy.typeKey === "xarrZOMG" ? "#14532d"
    : "#581c87";

  ctx.fillStyle = finColor;
  ctx.strokeStyle = "#090d16";
  ctx.lineWidth = 1.8;
  // Upper tail fin
  ctx.beginPath();
  ctx.moveTo(x - rx * 0.55, y - ry * 0.45);
  ctx.lineTo(x - rx * 1.05, y - ry * 1.15);
  ctx.lineTo(x - rx * 0.92, y - ry * 0.22);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Lower tail fin
  ctx.beginPath();
  ctx.moveTo(x - rx * 0.55, y + ry * 0.45);
  ctx.lineTo(x - rx * 1.05, y + ry * 1.15);
  ctx.lineTo(x - rx * 0.92, y + ry * 0.22);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // DDT glowing rear thrusters
  if (enemy.typeKey === "xarrDDT") {
    ctx.fillStyle = `rgba(244, 63, 94, ${0.7 + 0.3 * pulse})`;
    ctx.beginPath(); ctx.ellipse(x - rx * 1.04, y - ry * 0.2, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x - rx * 1.04, y + ry * 0.2, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
  }

  // Zeppelin hull gradient
  const hullColors = {
    xarrDDT:  ["#475569", "#1e293b", "#090d16"],
    xarrBoss: ["#7dd3fc", "#2563eb", "#1e3a8a"],
    xarrBFB:  ["#fca5a5", "#dc2626", "#7f1d1d"],
    xarrZOMG: ["#86efac", "#166534", "#052e16"],
    xarrBAD:  ["#e879f9", "#7e22ce", "#2e1065"]
  }[enemy.typeKey] || ["#94a3b8", ed.color, "#0f172a"];

  const hg = ctx.createRadialGradient(x - rx * 0.2, y - ry * 0.35, r * 0.1, x, y, rx);
  hg.addColorStop(0, hullColors[0]);
  hg.addColorStop(0.5, hullColors[1]);
  hg.addColorStop(1, hullColors[2]);

  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = hg;
  ctx.fill();

  // Clipped hull markings / armor stripes / rivets
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();

  if (enemy.typeKey === "xarrBoss") {
    // Blue-pink MOAB with white center stripe
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.fillRect(x - rx, y - ry * 0.18, rx * 2, ry * 0.36);
    ctx.fillStyle = "rgba(236, 72, 153, 0.75)";
    ctx.fillRect(x + rx * 0.35, y - ry, rx * 0.16, ry * 2);
  } else if (enemy.typeKey === "xarrBFB") {
    // Red BFB with bold white/gold stripe & cross mark
    ctx.fillStyle = "rgba(254, 240, 138, 0.85)";
    ctx.fillRect(x - rx * 0.25, y - ry, rx * 0.18, ry * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(x + rx * 0.15, y - ry * 0.14, rx * 0.55, ry * 0.28);
    ctx.fillRect(x + rx * 0.36, y - ry * 0.45, rx * 0.14, ry * 0.9);
  } else if (enemy.typeKey === "xarrZOMG") {
    // Dark green/black armored plates + neon lime stripes
    ctx.fillStyle = "rgba(5, 20, 10, 0.55)";
    ctx.fillRect(x - rx * 0.45, y - ry, rx * 0.25, ry * 2);
    ctx.fillStyle = "#a3e635";
    ctx.fillRect(x - rx, y - ry * 0.16, rx * 2, ry * 0.32);
  } else if (enemy.typeKey === "xarrDDT") {
    // Stealth chevrons
    ctx.strokeStyle = "rgba(244, 63, 94, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - rx * 0.3, y - ry * 0.6); ctx.lineTo(x, y); ctx.lineTo(x - rx * 0.3, y + ry * 0.6);
    ctx.stroke();
  } else if (enemy.typeKey === "xarrBAD") {
    // Riveted purple-black armor band
    ctx.fillStyle = "rgba(15, 5, 28, 0.65)";
    ctx.fillRect(x - rx * 0.35, y - ry, rx * 0.24, ry * 2);
    ctx.fillStyle = "#f0abfc";
    for (let dy = -ry * 0.5; dy <= ry * 0.5; dy += ry * 0.33) {
      ctx.beginPath(); ctx.arc(x - rx * 0.23, y + dy, 1.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Armor panel seam lines + rivets
  ctx.strokeStyle = "rgba(0,0,0,0.38)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - rx * 0.45, y - ry); ctx.lineTo(x - rx * 0.45, y + ry);
  ctx.moveTo(x + rx * 0.45, y - ry); ctx.lineTo(x + rx * 0.45, y + ry);
  ctx.stroke();
  ctx.restore();

  // Crisp hull cartoon outline
  ctx.strokeStyle = "#090d16";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Top gloss highlight
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.beginPath();
  ctx.ellipse(x - rx * 0.1, y - ry * 0.48, rx * 0.55, ry * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // BAD Skull Emblem & Label
  if (enemy.typeKey === "xarrBAD") {
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("☠️", x + rx * 0.08, y - ry * 0.05);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${r > 26 ? 9 : 8}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ed.name, x, y);
  }

  // Health bar above blimp
  const barW = rx * 1.7, barH = 6, barX = x - barW / 2, barY = y - ry - 14;
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.beginPath(); ctx.roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 3); ctx.fill();
  const hpC = hpPct > 0.5 ? ed.color : hpPct > 0.25 ? "#ffd166" : "#ff5b6e";
  ctx.fillStyle = hpC;
  ctx.beginPath(); ctx.roundRect(barX, barY, barW * hpPct, barH, 2); ctx.fill();

  ctx.restore();
}

// ── BTD5-style Tower Drawing ───────────────────────────────────
function drawTower3D(x, y, towerDef, level) {
  ctx.save();
  const { color, body, icon, name } = towerDef;
  const h = 32;
  const pulse = Math.sin(Date.now()/600)*0.05+0.95;

  drawShadow(x, y + 18, 32 * pulse, 16 * pulse);

  // Base platform
  ctx.fillStyle = "#3a3a4a";
  ctx.beginPath(); ctx.ellipse(x, y+15, 22, 9, 0, 0, Math.PI*2); ctx.fill();
  if (level >= 5) {
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = level >= 6 ? 12 : 6;
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 2.5;
  } else {
    ctx.strokeStyle = "#2a2a3a";
    ctx.lineWidth = 1;
  }
  ctx.beginPath(); ctx.ellipse(x, y+15, 22, 9, 0, 0, Math.PI*2); ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

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
    ctx.fillStyle = color; for(let i=0;i<4;i++){const a=i*1.57+Date.now()/300;ctx.beginPath();ctx.arc(x+Math.cos(a)*14,y+4+Math.sin(a)*8,2.5,0,Math.PI*2);ctx.fill();}
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
  ctx.fillStyle = level >= 5 ? "rgba(40,25,0,0.8)" : "rgba(0,0,0,0.6)";
  ctx.beginPath(); ctx.roundRect(x-12, y+18, 24, 12, 4); ctx.fill();
  ctx.fillStyle = level >= 6 ? "#fff2a6" : "#ffd700";
  ctx.font = "bold 9px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText(`★${level}`, x, y+24);

  // Upgrade glow & ★6 rainbow/star aura
  if (level >= 6) {
    const hue = (Date.now() / 12) % 360;
    const auraColor = `hsl(${hue}, 95%, 65%)`;
    ctx.shadowColor = auraColor;
    ctx.shadowBlur = 16;
    ctx.strokeStyle = auraColor;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y+4, 21, 11, 0, 0, Math.PI*2); ctx.stroke();
    ctx.shadowBlur = 0;
    for (let i = 0; i < 4; i++) {
      const a = i * (Math.PI / 2) + Date.now() / 500;
      ctx.fillStyle = `hsl(${(hue + i * 90) % 360}, 100%, 75%)`;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * 20, y + 4 + Math.sin(a) * 10, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (level > 1) {
    ctx.shadowColor = color; ctx.shadowBlur = 8+level*2;
    ctx.strokeStyle = level === 5 ? "rgba(255,215,0,0.55)" : `rgba(255,255,255,${0.05+level*0.03})`;
    ctx.lineWidth = level === 5 ? 1.5 : 1;
    ctx.beginPath(); ctx.ellipse(x,y+4,18,9,0,0,Math.PI*2); ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
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
  // Build spot highlights & build preview when a tower type is selected
  if (state.selectedTowerType) {
    const selDef = TOWERS[state.selectedTowerType];
    const canAfford = state.credits >= selDef.cost;
    const pulseAlpha = 0.25 + 0.2 * Math.sin(Date.now() / 220);
    ctx.save();
    for (const spotKey of BUILD_SPOTS) {
      const [sc, sr] = spotKey.split(",").map(Number);
      if (state.towers.some(t => t.c === sc && t.r === sr)) continue;
      const sx = GRID.ox + sc * GRID.tile, sy = GRID.oy + sr * GRID.tile;
      ctx.strokeStyle = canAfford ? `rgba(102,255,153,${pulseAlpha})` : `rgba(255,91,110,${pulseAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(sx + 5, sy + 5, GRID.tile - 10, GRID.tile - 10, 6);
      ctx.stroke();
    }
    if (state.hoverTile) {
      const { c: hc, r: hr } = state.hoverTile;
      const hKey = `${hc},${hr}`;
      const occupied = state.towers.some(t => t.c === hc && t.r === hr);
      if (BUILD_SPOTS.has(hKey) && !occupied) {
        const hp = toPx(hc, hr);
        const previewRange = getTowerStats(selDef, 1).range * GRID.tile;
        if (previewRange > 0) {
          ctx.fillStyle = canAfford ? "rgba(102,255,153,0.14)" : "rgba(255,91,110,0.14)";
          ctx.beginPath(); ctx.arc(hp.x, hp.y, previewRange, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = canAfford ? "rgba(102,255,153,0.75)" : "rgba(255,91,110,0.75)";
          ctx.lineWidth = 1.8;
          ctx.setLineDash([6, 4]);
          ctx.beginPath(); ctx.arc(hp.x, hp.y, previewRange, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.globalAlpha = 0.75;
        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(selDef.icon, hp.x, hp.y);
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
  }

  // Range circle for selected or hovered placed tower
  let rangeTower = state.selectedTowerIdx >= 0 ? state.towers[state.selectedTowerIdx] : null;
  if (!rangeTower && state.hoverTile) {
    rangeTower = state.towers.find(t => t.c === state.hoverTile.c && t.r === state.hoverTile.r) || null;
  }
  if (rangeTower) {
    const rDef = TOWERS[rangeTower.type];
    const rPx = getTowerStats(rDef, rangeTower.lvl).range * GRID.tile;
    if (rPx > 0) {
      const rp = toPx(rangeTower.c, rangeTower.r);
      ctx.save();
      ctx.fillStyle = "rgba(69,212,255,0.13)";
      ctx.beginPath(); ctx.arc(rp.x, rp.y, rPx, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(69,212,255,0.8)";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.arc(rp.x, rp.y, rPx, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

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
      drawBloon(e.x, e.y, radius, ed.color, false, alpha, e.typeKey, e.hp / e.maxHp);

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

  // Shockwaves
  for (const sw of state.shockwaves) {
    const a = Math.max(0, sw.life / sw.maxLife);
    ctx.save();
    ctx.globalAlpha = a * 0.75;
    ctx.strokeStyle = sw.color;
    ctx.lineWidth = 3 * a + 1;
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Floating Texts
  for (const ft of state.floatingTexts) {
    const a = Math.max(0, ft.life / ft.maxLife);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = "bold 14px 'Fredoka', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
}

function drawOverlay() {
  if (!state.gameOver) return;
  if (!state._soundPlayed) { onGameOver(); state._soundPlayed = true; }
  const cx = canvas.width / 2, cy = canvas.height / 2;

  // Darken background
  const overGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width / 2);
  overGrad.addColorStop(0, "rgba(0,0,0,0.45)");
  overGrad.addColorStop(1, "rgba(0,0,0,0.8)");
  ctx.fillStyle = overGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  // BTD6-style wood/cartoon panel box
  const pw = 420, ph = 260, px = cx - pw / 2, py = cy - ph / 2;
  ctx.shadowColor = "rgba(0,0,0,0.65)";
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "#3a2210";
  ctx.beginPath(); ctx.roundRect(px - 6, py - 6, pw + 12, ph + 12, 22); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  // Golden frame rim
  const rimGrad = ctx.createLinearGradient(px, py, px, py + ph);
  rimGrad.addColorStop(0, "#ffe07d");
  rimGrad.addColorStop(0.5, "#d89228");
  rimGrad.addColorStop(1, "#9a6012");
  ctx.fillStyle = rimGrad;
  ctx.beginPath(); ctx.roundRect(px - 3, py - 3, pw + 6, ph + 6, 19); ctx.fill();

  // Inner wood panel
  const panelGrad = ctx.createLinearGradient(px, py, px, py + ph);
  panelGrad.addColorStop(0, "#6e4427");
  panelGrad.addColorStop(1, "#462916");
  ctx.fillStyle = panelGrad;
  ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 16); ctx.fill();

  // Inner inset highlight
  ctx.strokeStyle = "rgba(255,230,160,0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(px + 6, py + 6, pw - 12, ph - 12, 12); ctx.stroke();

  // Victory/Defeat title
  const bannerColor = state.victory ? "#66ff99" : "#ff5b6e";
  const bannerShadow = state.victory ? "rgba(102,255,153,0.4)" : "rgba(255,91,110,0.4)";
  ctx.shadowColor = bannerShadow;
  ctx.shadowBlur = 24;
  ctx.font = "bold 44px 'Fredoka', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#241308";
  const titleText = state.victory ? "⭐ VICTORY ⭐" : "💀 DEFEAT";
  ctx.strokeText(titleText, cx, py + 52);
  ctx.fillStyle = bannerColor;
  ctx.fillText(titleText, cx, py + 52);
  ctx.shadowBlur = 0;

  // Stats inset box
  ctx.fillStyle = "rgba(20,10,4,0.45)";
  ctx.beginPath(); ctx.roundRect(px + 32, py + 92, pw - 64, 74, 10); ctx.fill();

  ctx.font = "bold 18px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#f5e6c8";
  ctx.fillText(`🌊 Welle ${state.wave}/${WAVES.length}   •   🏆 Score: ${state.score}`, cx, py + 116);

  const bestScore = Math.max(highScore, state.score);
  ctx.font = "bold 15px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = state.score >= highScore && bestScore > 0 ? "#ffd700" : "#cbb494";
  ctx.fillText(`👑 High Score: ${bestScore}`, cx, py + 144);

  // "🔄 Nochmal spielen" button
  const bw = 250, bh = 50, bx = cx - bw / 2, by = py + ph - 72;
  ctx.fillStyle = "#1c6b2b";
  ctx.beginPath(); ctx.roundRect(bx, by + 4, bw, bh, 14); ctx.fill();

  const btnGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
  btnGrad.addColorStop(0, "#65e665");
  btnGrad.addColorStop(1, "#28a438");
  ctx.fillStyle = btnGrad;
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 14); ctx.fill();

  ctx.strokeStyle = "#d8ffd8";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(bx + 1, by + 1, bw - 2, bh - 2, 13); ctx.stroke();

  ctx.font = "bold 20px 'Fredoka', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 4;
  ctx.fillText("🔄 Nochmal spielen", cx, by + bh / 2 + 1);
  ctx.restore();
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

  // Check if clicking on existing tower (with touch tolerance when not placing)
  let towerIdx = state.towers.findIndex(t => t.c === c && t.r === r);
  if (towerIdx < 0 && !state.selectedTowerType) {
    let bestDist = 0.75 * GRID.tile;
    state.towers.forEach((t, i) => {
      const p = toPx(t.c, t.r);
      const d = Math.hypot(x - p.x, y - p.y);
      if (d <= bestDist) {
        bestDist = d;
        towerIdx = i;
      }
    });
  }
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
  if (!t) { hideUpgrade(); return; }
  const def = TOWERS[t.type];
  const stats = getTowerStats(def, t.lvl);
  const nextStats = getTowerStats(def, t.lvl + 1);
  const maxed = t.lvl >= def.maxLvl;

  upgradeTitle.textContent = `${def.icon} ${def.name} ★${t.lvl}`;
  if (def.income) {
    upgradeStats.textContent = maxed
      ? `Einkommen: ${stats.income}💰 • ⚡ MAX`
      : `Einkommen: ${stats.income} → ${nextStats.income}💰`;
    upgradeStats2.textContent = maxed
      ? `Rate: ${stats.rate.toFixed(2)}/s`
      : `Rate: ${stats.rate.toFixed(2)} → ${nextStats.rate.toFixed(2)}/s`;
  } else if (def.heal) {
    upgradeStats.textContent = maxed
      ? `Heilung: ${stats.heal}❤️ • ⚡ MAX`
      : `Heilung: ${stats.heal} → ${nextStats.heal}❤️`;
    upgradeStats2.textContent = maxed
      ? `Rate: ${stats.rate.toFixed(2)}/s`
      : `Rate: ${stats.rate.toFixed(2)} → ${nextStats.rate.toFixed(2)}/s`;
  } else {
    upgradeStats.textContent = maxed
      ? `Schaden: ${stats.damage} • Reichweite: ${stats.range.toFixed(1)} • ⚡ MAX`
      : `Schaden: ${stats.damage} → ${nextStats.damage}`;
    upgradeStats2.textContent = maxed
      ? `Feuerrate: ${stats.rate.toFixed(2)}/s`
      : `Reichweite: ${stats.range.toFixed(1)} → ${nextStats.range.toFixed(1)}`;
  }

  targetSelect.value = t.targetMode || "first";

  const upgCost = Math.floor(def.upgCost * Math.pow(def.upgMult, t.lvl - 1));
  upgradeBtn.textContent = maxed ? "⭐ MAX LEVEL" : `⬆ Upgraden (${upgCost}💰)`;
  upgradeBtn.disabled = maxed || state.credits < upgCost;
  upgradeBtn.onclick = () => {
    const curIdx = state.towers.indexOf(t);
    if (curIdx < 0 || maxed || state.credits < upgCost) return;
    state.credits -= upgCost;
    t.lvl++;
    playUpgrade();
    updateHud();
    hideUpgrade();
  };

  let totalSpent = def.cost;
  for (let l = 1; l < t.lvl; l++) {
    totalSpent += Math.floor(def.upgCost * Math.pow(def.upgMult, l - 1));
  }
  const sellValue = Math.floor(totalSpent * 0.6);
  sellBtn.textContent = `💰 Verkaufen (+${sellValue})`;
  sellBtn.onclick = () => {
    const curIdx = state.towers.indexOf(t);
    if (curIdx < 0) { hideUpgrade(); return; }
    state.credits += sellValue;
    state.towers.splice(curIdx, 1);
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
targetSelect.addEventListener("change", () => {
  const t = state.towers[state.selectedTowerIdx];
  if (t) t.targetMode = targetSelect.value;
});
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
      state.stats.moneySpent += cost;
      globalUpgrades[key]++;
      try { ls.setItem("galacticBloons_upgrades", JSON.stringify(globalUpgrades)); } catch(e) {}
      playUpgrade();
      // Re-apply upgrades
      const newState = applyGlobalUpgrades();
      state.maxCore = newState.maxCore;
      if (key === "coreBoost") state.core += UPGRADES.coreBoost.perLvl;
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
pauseBtn.addEventListener("click", () => {
  state.paused = !state.paused;
  pauseBtn.textContent = state.paused ? "▶️" : "⏸️";
  pauseBtn.className = state.paused ? "active" : "";
});
soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundBtn.textContent = soundEnabled ? "🔊" : "🔇";
});
mapBtn.addEventListener("click", showMapSelect);
closeMapBtn.addEventListener("click", () => mapPopup.classList.add("hidden"));
statsBtn.addEventListener("click", showStats);
closeStatsBtn.addEventListener("click", () => statsOverlay.classList.add("hidden"));
abilSlow.addEventListener("click", () => useAbility("slow"));
abilCredits.addEventListener("click", () => useAbility("credits"));
abilBoost.addEventListener("click", () => useAbility("boost"));

function showStats() {
  statsContent.innerHTML = `
    <p>👾 Besiegte Bloons: <b>${state.stats.kills}</b></p>
    <p>🌊 Wellen abgeschlossen: <b>${state.stats.wavesCompleted}</b></p>
    <p>🗼 Türme gebaut: <b>${state.stats.towersPlaced}</b></p>
    <p>💰 Credits verdient: <b>${state.stats.moneyEarned}</b></p>
    <p>💸 Credits ausgegeben: <b>${state.stats.moneySpent}</b></p>
    <p>🏆 High Score: <b>${Math.max(highScore, state.score)}</b></p>
  `;
  statsOverlay.classList.remove("hidden");
}

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

  if (!state.gameOver && !state.paused) {
    // Ability cooldowns
    let cdChanged = false;
    for (const k of Object.keys(state.abilityCD)) {
      if (state.abilityCD[k] > 0) {
        state.abilityCD[k] = Math.max(0, state.abilityCD[k] - dt);
        cdChanged = true;
      }
    }
    if (cdChanged) updateAbilitiesUI();
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
    updateEffects(dt);
    checkWinLose();
  } else if (!state.gameOver) {
    // Paused: still update particles for visual effect
    updateParticles(dt);
    updateEffects(dt);
  } else {
    updateParticles(dt);
    updateEffects(dt);
  }

  if (state.shakeTimer > 0) {
    state.shakeTimer = Math.max(0, state.shakeTimer - dt);
    if (state.shakeTimer <= 0) state.shakeIntensity = 0;
  }

  ctx.save();
  if (state.shakeTimer > 0) {
    ctx.translate((Math.random() - 0.5) * state.shakeIntensity * 2, (Math.random() - 0.5) * state.shakeIntensity * 2);
  }
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawGrid();
  drawDecorTrees();
  drawEntities();
  drawOverlay();
  ctx.restore();

  requestAnimationFrame(frame);
}

let last = performance.now();
requestAnimationFrame(frame);

canvas.addEventListener("pointerdown", () => {
  if (!state.gameOver) return;
  resetState();
  updateHud();
});

canvas.addEventListener("pointermove", ev => {
  const rect = canvas.getBoundingClientRect();
  const x = (ev.clientX - rect.left) * (canvas.width / rect.width);
  const y = (ev.clientY - rect.top) * (canvas.height / rect.height);
  const c = Math.floor((x - GRID.ox) / GRID.tile);
  const r = Math.floor((y - GRID.oy) / GRID.tile);
  if (c >= 0 && r >= 0 && c < GRID.cols && r < GRID.rows) {
    state.hoverTile = { c, r };
  } else {
    state.hoverTile = null;
  }
});

canvas.addEventListener("pointerleave", () => {
  state.hoverTile = null;
});

window.addEventListener("keydown", ev => {
  if (ev.key >= "1" && ev.key <= "8") {
    const keys = Object.keys(TOWERS);
    const idx = parseInt(ev.key, 10) - 1;
    const key = keys[idx];
    if (key) {
      state.selectedTowerType = key;
      const t = TOWERS[key];
      [...towerButtonsEl.children].forEach((b, i) => b.classList.toggle("selected", i === idx));
      hintEl.textContent = `${t.icon} ${t.name} gewählt – auf freies Feld tippen.`;
    }
  } else if (ev.key === " " || ev.code === "Space") {
    ev.preventDefault();
    if (!state.waveSpawning && state.enemies.length === 0 && !state.gameOver) {
      startWave();
    } else if (!state.gameOver) {
      pauseBtn.click();
    }
  } else if (ev.key === "Escape") {
    state.selectedTowerType = null;
    [...towerButtonsEl.children].forEach(b => b.classList.remove("selected"));
    hideUpgrade();
    shopPopup.classList.add("hidden");
    mapPopup.classList.add("hidden");
    statsOverlay.classList.add("hidden");
    hintEl.textContent = "Auswahl gelöscht.";
  }
});
