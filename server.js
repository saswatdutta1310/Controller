const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');
const os = require('os');
const QRCode = require('qrcode');

// ─── robotjs (key simulation) ─────────────────────────────────────────────────
let robot;
try {
  robot = require('robotjs');
  robot.setKeyboardDelay(0);
  console.log('[ok] robotjs loaded — keys will be simulated');
} catch (e) {
  console.warn('[warn] robotjs not installed. Run: npm install robotjs');
  robot = null;
}

// ─── Game profiles: map button IDs → keyboard keys ───────────────────────────
const PROFILES = {
  tekken: {
    name: 'Tekken 7 / 8',
    layout: 'xbox',
    keys: {
      up: 'up', down: 'down', left: 'left', right: 'right',
      square: 'a',    // X button → Left Punch
      triangle: 's',  // Y button → Right Punch
      cross: 'z',     // A button → Left Kick
      circle: 'x',    // B button → Right Kick
      l1: 'f', r1: 'd', l2: 'q', r2: 'e',
      start: 'return', select: 'escape', home: 'space',
    }
  },
  streetfighter: {
    name: 'Street Fighter 6',
    layout: 'xbox',
    keys: {
      up: 'up', down: 'down', left: 'left', right: 'right',
      square: 'a', triangle: 's', cross: 'z', circle: 'x',
      l1: 'c', r1: 'v', l2: 'q', r2: 'e',
      start: 'return', select: 'escape', home: 'space',
    }
  },
  minecraft: {
    name: 'Minecraft',
    layout: 'xbox',
    keys: {
      up: 'w', down: 's', left: 'a', right: 'd',
      square: 'e', triangle: 'f', cross: 'space', circle: 'shift',
      l1: 'q', r1: 'control', l2: '1', r2: '2',
      start: 'escape', select: 'tab', home: 'space',
    }
  },
  gta: {
    name: 'GTA V',
    layout: 'xbox',
    keys: {
      up: 'up', down: 'down', left: 'left', right: 'right',
      square: 'r', triangle: 'f', cross: 'space', circle: 'c',
      l1: 'q', r1: 'control', l2: 'z', r2: 'g',
      start: 'escape', select: 'tab', home: 'space',
    }
  },
  custom: {
    name: 'Custom',
    layout: 'xbox',
    keys: {
      up: 'up', down: 'down', left: 'left', right: 'right',
      square: 'a', triangle: 'b', cross: 'c', circle: 'd',
      l1: 'q', r1: 'e', l2: 'z', r2: 'x',
      start: 'return', select: 'escape', home: 'space',
    }
  }
};

// ─── Active profile ───────────────────────────────────────────────────────────
let activeProfile = 'tekken';

// ─── Key simulation ───────────────────────────────────────────────────────────
const heldKeys = new Set();

function pressKey(button, action) {
  const profile = PROFILES[activeProfile];
  const key = profile?.keys?.[button];
  if (!key) return;

  if (robot) {
    try {
      if (action === 'down') {
        if (!heldKeys.has(key)) {
          robot.keyToggle(key, 'down');
          heldKeys.add(key);
        }
      } else {
        robot.keyToggle(key, 'up');
        heldKeys.delete(key);
      }
    } catch(e) {
      console.error('[robotjs error]', e.message);
    }
  } else {
    console.log(`[${action}] ${button} → ${key}`);
  }
}

function releaseAll() {
  if (robot) {
    heldKeys.forEach(k => {
      try { robot.keyToggle(k, 'up'); } catch(e) {}
    });
  }
  heldKeys.clear();
}

// ─── Stick → key mapping (convert analog to digital keys) ────────────────────
const stickState = { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } };
const stickKeys = { left: new Set(), right: new Set() };

function handleStick(stick, x, y) {
  const threshold = 0.4;
  const profile = PROFILES[activeProfile];
  if (!profile) return;

  const prev = stickKeys[stick];
  const next = new Set();

  // Left stick → WASD/arrows, Right stick → mouse look (or mapped keys)
  if (stick === 'left') {
    if (y < -threshold) next.add(profile.keys.up);
    if (y > threshold) next.add(profile.keys.down);
    if (x < -threshold) next.add(profile.keys.left);
    if (x > threshold) next.add(profile.keys.right);
  } else {
    // Right stick → can be used for camera / mouse movement
    if (robot) {
      // Move mouse relative for camera control
      const sensitivity = 8;
      const mx = Math.round(x * sensitivity);
      const my = Math.round(y * sensitivity);
      if (Math.abs(mx) > 1 || Math.abs(my) > 1) {
        try {
          const pos = robot.getMousePos();
          robot.moveMouse(pos.x + mx, pos.y + my);
        } catch(e) {}
      }
    }
    return; // Right stick uses mouse, skip key simulation
  }

  if (!robot) {
    if (x !== 0 || y !== 0) console.log(`[stick:${stick}] x=${x} y=${y}`);
    stickKeys[stick] = next;
    return;
  }

  // Release keys no longer held
  for (const k of prev) {
    if (!next.has(k)) {
      try { robot.keyToggle(k, 'up'); heldKeys.delete(k); } catch(e) {}
    }
  }
  // Press new keys
  for (const k of next) {
    if (!prev.has(k) && !heldKeys.has(k)) {
      try { robot.keyToggle(k, 'down'); heldKeys.add(k); } catch(e) {}
    }
  }
  stickKeys[stick] = next;
}

// ─── Network helpers ──────────────────────────────────────────────────────────
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('ethernet')) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) return net.address;
      }
    }
  }
  for (const name of Object.keys(nets)) {
    const n = name.toLowerCase();
    if (n.includes('warp') || n.includes('virtual') || n.includes('wsl') || n.includes('tailscale')) continue;
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

// ─── Express + WS server ──────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 3000;
const IP = getLocalIP();
const BASE_URL = `http://${IP}:${PORT}`;

app.use(express.json());

// Serve controller UI
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'controller.html')));

// API endpoint
app.get('/api/profiles', (req, res) => {
  const list = Object.entries(PROFILES).map(([id, p]) => ({
    id, name: p.name, layout: p.layout
  }));
  res.json({ profiles: list, active: activeProfile });
});

// QR code page — shows URL for ALL devices to join
app.get('/qr', async (req, res) => {
  const qr = await QRCode.toDataURL(BASE_URL);
  res.send(`<!DOCTYPE html><html><body style="background:#0a0a0f;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:'Inter',sans-serif;color:#fff">
    <p style="font-size:24px;margin-bottom:8px;font-weight:700">🎮 GamePad Controller</p>
    <p style="font-size:14px;color:#888;margin-bottom:24px">Scan to connect your phone as a controller</p>
    <img src="${qr}" style="width:280px;height:280px;border-radius:16px;border:2px solid #2a2a3a"/>
    <p style="margin-top:20px;color:#888;font-size:14px">Or visit: <b style="color:#6c63ff">${BASE_URL}</b></p>
    <p style="margin-top:8px;color:#555;font-size:13px">All devices must be on the same WiFi network</p>
    <p style="margin-top:16px;color:#6c63ff;font-size:13px;font-weight:600">Connected players: <span id="cc">${clients.size}</span></p>
    <script>
      const ws = new WebSocket('ws://' + location.host);
      ws.onmessage = (e) => {
        try {
          const m = JSON.parse(e.data);
          if (m.type === 'playerCount') document.getElementById('cc').textContent = m.count;
          if (m.type === 'init' && m.connectedCount !== undefined) document.getElementById('cc').textContent = m.connectedCount;
        } catch(e){}
      };
    </script>
  </body></html>`);
});

// ─── Multi-device WebSocket ───────────────────────────────────────────────────
const clients = new Map(); // ws → { playerId }
let playerCounter = 0;

function getConnectedCount() {
  return clients.size;
}

function broadcastAll(data) {
  const msg = JSON.stringify(data);
  for (const [ws] of clients) {
    if (ws.readyState === 1) ws.send(msg);
  }
}

function broadcastPlayerCount() {
  broadcastAll({ type: 'playerCount', count: getConnectedCount() });
}

wss.on('connection', (ws) => {
  playerCounter++;
  const playerId = 'P' + playerCounter;
  clients.set(ws, { playerId });

  console.log(`[+] ${playerId} connected (${getConnectedCount()} total)`);

  // Send init to the new player
  ws.send(JSON.stringify({
    type: 'init',
    profiles: Object.entries(PROFILES).map(([id, p]) => ({ id, name: p.name, layout: p.layout })),
    active: activeProfile,
    playerId: playerId,
    connectedCount: getConnectedCount()
  }));

  // Broadcast updated count to everyone
  broadcastPlayerCount();

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'button':
          pressKey(msg.button, msg.action);
          break;

        case 'stick':
          handleStick(msg.stick, msg.x, msg.y);
          break;

        case 'profile':
          if (PROFILES[msg.id]) {
            releaseAll();
            activeProfile = msg.id;
            console.log(`[profile] ${playerId} switched to: ${PROFILES[msg.id].name}`);
            broadcastAll({ type: 'profile', id: msg.id, layout: PROFILES[msg.id].layout });
          }
          break;

        case 'combo':
          executeCombo(msg.sequence);
          break;

        case 'releaseAll':
          releaseAll();
          break;
      }
    } catch (e) {
      console.error('[ws] parse error:', e.message);
    }
  });

  ws.on('close', () => {
    const info = clients.get(ws);
    clients.delete(ws);
    releaseAll();
    console.log(`[-] ${info?.playerId || '?'} disconnected (${getConnectedCount()} total)`);
    broadcastPlayerCount();
  });
});

// ─── Combo executor ───────────────────────────────────────────────────────────
async function executeCombo(sequence) {
  for (const step of sequence) {
    pressKey(step.button, 'down');
    await sleep(step.holdMs || 60);
    pressKey(step.button, 'up');
    await sleep(step.gapMs || 40);
  }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── Start ────────────────────────────────────────────────────────────────────
server.listen(PORT, '0.0.0.0', () => {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║       🎮 GAMEPAD CONTROLLER SERVER             ║');
  console.log('╠════════════════════════════════════════════════╣');
  console.log(`║  Controller:  ${BASE_URL.padEnd(33)}║`);
  console.log(`║  QR Scan:     ${(BASE_URL+'/qr').padEnd(33)}║`);
  console.log('╠════════════════════════════════════════════════╣');
  console.log('║  Multi-device: Connect multiple phones!        ║');
  console.log('║  Joysticks:    L-Stick=movement R-Stick=camera ║');
  console.log('║  Fullscreen:   Auto-prompt on Android          ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  if (!robot) {
    console.log('⚠️  robotjs not installed → run: npm install robotjs\n');
  }
});
