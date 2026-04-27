<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/WebSocket-Real--Time-4353FF?style=for-the-badge&logo=socketdotio&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
</p>

<h1 align="center">🎮 Universal Phone Controller</h1>

<p align="center">
  <b>Turn your smartphone into a wireless game controller for any PC game — over Wi-Fi, in real-time.</b>
</p>

<p align="center">
  Supports multi-device multiplayer · Xbox-style layout with dual analog sticks · Fullscreen mobile UI<br/>
  Built with Node.js, WebSockets, and zero-latency key simulation via <code>robotjs</code>.
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🕹️ **Xbox Controller Layout** | Diamond XYBA face buttons, D-Pad, LB/RB/LT/RT shoulder buttons |
| 🎯 **Dual Analog Sticks** | Left stick for movement, right stick for camera/mouse control |
| 👥 **Multi-Device Multiplayer** | Connect multiple phones simultaneously — each gets a unique Player ID |
| 📱 **Fullscreen Mobile UI** | Auto-prompts fullscreen + landscape lock on Android for immersive gameplay |
| 🔄 **Switchable Game Profiles** | Swap key mappings on-the-fly from a dropdown — no restart needed |
| 📡 **QR Code Connect** | Scan a QR code from your laptop to instantly connect your phone |
| ⚡ **Ultra-Low Latency** | WebSocket-powered input with `robotjs` zero-delay key simulation |
| 🌐 **Cross-Platform Server** | Works on Windows, macOS, and Linux |

---

## 🏗️ Architecture

```
┌──────────────────────┐         WebSocket (ws://)         ┌──────────────────────┐
│    📱 Phone 1 (P1)    │ ◄──────────────────────────────► │                      │
│   controller.html     │                                   │    🖥️ Node.js Server  │
├──────────────────────┤         WebSocket (ws://)         │    (server.js)        │
│    📱 Phone 2 (P2)    │ ◄──────────────────────────────► │                      │
│   controller.html     │                                   │  ┌────────────────┐  │
├──────────────────────┤         WebSocket (ws://)         │  │   robotjs       │  │
│    📱 Phone N         │ ◄──────────────────────────────► │  │  (key simulate) │  │
│   controller.html     │                                   │  └────────────────┘  │
└──────────────────────┘                                   └──────────────────────┘
                                                                     │
                                                                     ▼
                                                            🎮 PC Game receives
                                                               keyboard input
```

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) v18+ (LTS recommended)
- Phone and laptop on the **same Wi-Fi network**

### Installation

```bash
# Clone the repository
git clone https://github.com/saswatdutta1310/Controller.git
cd Controller

# Install dependencies
npm install

# (Optional) Install robotjs for actual key simulation
npm install robotjs
```

> **Note:** Without `robotjs`, the server will log key events to the console instead of simulating them. This is useful for debugging.

<details>
<summary><b>⚠️ Troubleshooting robotjs installation</b></summary>

**Windows** — if `npm install robotjs` fails:
```bash
npm install --global windows-build-tools
npm install robotjs
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install libxtst-dev libpng++-dev
npm install robotjs
```

**macOS:**
```bash
xcode-select --install
npm install robotjs
```
</details>

### Run the Server

```bash
node server.js
```

You'll see:

```
╔════════════════════════════════════════════════╗
║       🎮 GAMEPAD CONTROLLER SERVER             ║
╠════════════════════════════════════════════════╣
║  Controller:  http://192.168.x.x:3000         ║
║  QR Scan:     http://192.168.x.x:3000/qr      ║
╠════════════════════════════════════════════════╣
║  Multi-device: Connect multiple phones!        ║
║  Joysticks:    L-Stick=movement R-Stick=camera ║
║  Fullscreen:   Auto-prompt on Android          ║
╚════════════════════════════════════════════════╝
```

### Connect Your Phone

1. Open `http://localhost:3000/qr` on your laptop
2. Scan the QR code with your phone camera
3. Tap **"Enter Fullscreen & Play"** on the controller UI
4. Start gaming! 🎮

---

## 🎯 Supported Game Profiles

| Profile | Game | Layout | Key Highlights |
|---|---|---|---|
| `tekken` | Tekken 7 / 8 | Xbox | Arrow keys + ASZX face buttons |
| `streetfighter` | Street Fighter 6 | Xbox | Arrow keys + ASZX + CV kicks |
| `minecraft` | Minecraft Java | Xbox | WASD movement + Space jump |
| `gta` | GTA V | Xbox | Arrow keys + R/F/Space/C |
| `custom` | Any Game | Xbox | Fully configurable key bindings |

---

## 🗺️ Button Mapping Reference

### Xbox Layout (All Profiles)

```
        [LT]  [LB]                              [RB]  [RT]

    ┌─────────────┐    [BACK]  [⊕]  [START]   ┌─────────────┐
    │  L-STICK    │                             │     (Y)     │
    │    ●        │                             │  (X)   (B)  │
    │             │                             │     (A)     │
    ├─────────────┤                             ├─────────────┤
    │     ▲       │                             │  R-STICK    │
    │  ◀  ■  ▶   │                             │    ●        │
    │     ▼       │                             │             │
    └─────────────┘                             └─────────────┘
       D-PAD                                      R-STICK
```

### Key Mappings Per Profile

<details>
<summary><b>Tekken 7 / 8</b></summary>

| Button | Key | Action |
|---|---|---|
| Y | `S` | Right Punch |
| X | `A` | Left Punch |
| B | `X` | Right Kick |
| A | `Z` | Left Kick |
| LB | `F` | Rage Art |
| RB | `D` | Heavy |
| D-Pad | Arrow Keys | Movement |
</details>

<details>
<summary><b>Street Fighter 6</b></summary>

| Button | Key | Action |
|---|---|---|
| Y | `S` | Medium Punch |
| X | `A` | Light Punch |
| B | `X` | Light Kick |
| A | `Z` | Heavy Punch |
| LB | `C` | Medium Kick |
| RB | `V` | Heavy Kick |
| D-Pad | Arrow Keys | Movement |
</details>

<details>
<summary><b>Minecraft</b></summary>

| Button | Key | Action |
|---|---|---|
| Y | `F` | Swap Hands |
| X | `E` | Inventory |
| B | `Shift` | Sneak |
| A | `Space` | Jump |
| RB | `Ctrl` | Sprint |
| L-Stick | `W/A/S/D` | Movement |
</details>

<details>
<summary><b>GTA V</b></summary>

| Button | Key | Action |
|---|---|---|
| Y | `F` | Enter Vehicle |
| X | `R` | Reload |
| B | `C` | Look Behind |
| A | `Space` | Jump / Handbrake |
| RB | `Ctrl` | Sprint |
| D-Pad | Arrow Keys | Navigation |
</details>

---

## ➕ Adding a Custom Game Profile

### 1. Edit `server.js` — add to `PROFILES` object:

```js
yourGame: {
  name: 'Your Game Name',
  layout: 'xbox',
  keys: {
    up: 'w', down: 's', left: 'a', right: 'd',
    square: 'j', triangle: 'k', cross: 'space', circle: 'l',
    l1: 'q', r1: 'e', l2: 'z', r2: 'x',
    start: 'return', select: 'escape', home: 'space',
  }
}
```

### 2. Restart the server

```bash
node server.js
```

Your new profile will automatically appear in the dropdown on all connected devices!

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Server runtime |
| **Express** | HTTP server & static file serving |
| **ws** | WebSocket server for real-time communication |
| **robotjs** | Native keyboard simulation |
| **qrcode** | QR code generation for easy phone connection |

---

## 📁 Project Structure

```
Controller/
├── server.js           # WebSocket server, game profiles, key simulation
├── controller.html     # Phone controller UI (Xbox layout + sticks)
├── package.json        # Node.js dependencies and scripts
└── README.md           # This file
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| **Phone can't connect** | Ensure both devices are on the same Wi-Fi. Allow Node.js through your firewall on port `3000`. |
| **Keys not registering** | Install `robotjs` and run the server as Administrator (Windows) or with `sudo` (Linux). |
| **High latency** | Switch to 5GHz Wi-Fi. Close background apps on your phone. |
| **QR code doesn't work** | Try manually entering `http://YOUR_LAPTOP_IP:3000` in your phone browser. |
| **Wrong IP in QR** | The server may pick a virtual adapter IP. Check `ipconfig` (Windows) or `ifconfig` (Mac/Linux) for your real Wi-Fi IP. |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/saswatdutta1310">Saswat Dutta</a>
</p>
