# Universal Phone Controller 🎮

Turn your Android phone into a wireless game controller for **any game** on your laptop.
Supports **PlayStation style** and **Arcade/Fighting game** layouts — switchable on the fly.

---

## Supported Games (built-in profiles)

| Profile | Layout | Game |
|---|---|---|
| `tekken` | Arcade | Tekken 7 / Tekken 8 |
| `streetfighter` | Arcade | Street Fighter 6 |
| `minecraft` | PlayStation | Minecraft Java |
| `gta` | PlayStation | GTA V |
| `custom` | PlayStation | Any game (edit keys yourself) |

---

## Setup (one-time)

### 1. Install Node.js
Download LTS from https://nodejs.org

### 2. Install dependencies
```bash
cd universal-phone-controller
npm install
```

### 3. Install robotjs (key simulation engine)
```bash
npm install robotjs
```

**Windows:** If it fails, first run:
```bash
npm install --global windows-build-tools
```
Then retry `npm install robotjs`

**Linux (Ubuntu/Debian):**
```bash
sudo apt install libxtst-dev libpng++-dev
npm install robotjs
```

### 4. Start the server
```bash
node server.js
```

### 5. Connect your phone
1. Phone + laptop must be on **same WiFi**
2. Open `http://localhost:3000/qr` on your laptop
3. Scan the QR code with your Android phone camera
4. Controller UI opens in your phone browser — done!

---

## How to use

- **Switch game profile** → dropdown at the top of the controller
- **Switch layout** → tap "ARCADE" or "PS STYLE" button top-right
- **Combos** → tap pills in the strip at the bottom
- **Profiles panel** → tap ☰ in the middle for full profile list

---

## Button Mappings

### Tekken 7/8 (Arcade)
| Button | Key | Action |
|---|---|---|
| LP | A | Left Punch |
| MP | S | Right Punch |
| HP | D | Heavy Punch / Throw |
| LK | Z | Left Kick |
| MK | F | Rage Art |
| HK | E | Heavy Kick |
| ↑↓←→ | Arrow keys | Movement |

### Street Fighter 6 (Arcade)
| Button | Key | Action |
|---|---|---|
| LP | A | Light Punch |
| MP | S | Medium Punch |
| HP | Z | Heavy Punch |
| LK | X | Light Kick |
| MK | C | Medium Kick |
| HK | V | Heavy Kick |

### Minecraft
| Button | Key | Action |
|---|---|---|
| Cross/X | Space | Jump |
| Circle | Shift | Sneak |
| Square | E | Inventory |
| Triangle | F | Swap hands |
| R1 | Ctrl | Sprint |
| WASD via dpad | W/A/S/D | Move |

---

## Adding a new game profile

Edit `server.js`, find the `PROFILES` object, and add:

```js
yourGame: {
  name: 'Your Game Name',
  layout: 'playstation',   // or 'arcade'
  keys: {
    up: 'w', down: 's', left: 'a', right: 'd',
    square: 'j', triangle: 'k', cross: 'space', circle: 'l',
    l1: 'q', r1: 'e', l2: 'z', r2: 'x',
    start: 'return', select: 'escape',
  }
}
```

Then add combos in `controller.html` → `COMBOS` object:
```js
yourGame: [
  { name: 'My Combo', seq: [
    { button: 'square', holdMs: 60 },
    { button: 'cross',  holdMs: 60 },
  ]},
]
```

Restart the server — your new profile appears in the dropdown!

---

## Troubleshooting

**Phone can't connect:**
- Confirm same WiFi on both devices
- On Windows: allow Node.js through Windows Defender Firewall on port 3000
- Try typing `http://YOUR_LAPTOP_IP:3000` manually in phone browser

**Keys not registering in game:**
- Make sure `robotjs` is installed (`npm install robotjs`)
- Run the server as Administrator (Windows) or with `sudo` (Linux)
- Verify the game's keyboard bindings match your profile's key map

**Latency feels high:**
- Use 5GHz WiFi instead of 2.4GHz
- Close background apps on your phone
- USB tethering instead of WiFi: connect phone via USB, enable USB tethering, server IP becomes `192.168.42.129`
