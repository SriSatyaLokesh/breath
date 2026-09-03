# 🪷 Swaasa Midha Dhyasa

> **Audio-Visual Mindfulness Sanctuary & Guided Pulmonary Experience**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Live Web App](https://img.shields.io/badge/Live%20App-is--a.dev-brightgreen)](https://srisatyalokesh.is-a.dev/breath/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20Capable-orange)](https://srisatyalokesh.is-a.dev/breath/)
[![Vite](https://img.shields.io/badge/Vite-5.4.x-646CFF.svg)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-orange)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

**Swaasa Midha Dhyasa** (Telugu/Sanskrit: *"Mindfulness & Awareness on the Breath"*) is an open-source, haute-luxury digital sanctuary engineered for guided breathing exercises, deep meditation, anxiety relief, and inner tranquility.

🌐 **Live Web Application**: [https://srisatyalokesh.is-a.dev/breath/](https://srisatyalokesh.is-a.dev/breath/)

---

## 🎨 Creative Attribution

This project is inspired by the artistic CodePen concept by **Visaint**:  
🔗 **[Visaint's CodePen — JobLQJb](https://codepen.io/visaint/pen/JobLQJb)**

We honor the original creative vision for inspiring the aesthetic approach to interactive digital tranquility.

---

## ✨ Core Features

### 🎛️ 1. Unified Control Hub
Access all mindfulness settings through a single, elegant floating control hub (`Controls`) featuring a 4-tab control center:
- 🫁 **Breath Rhythms**: Science-backed patterns (Box, 4-7-8, Stanford Sigh, HRV Coherence) + Custom Breath Builder.
- 🎵 **Soundscapes & Audio**: YouTube Music streaming, procedural Web Audio synths, and master/ambient volume balance sliders.
- 🗓️ **Mindfulness Journeys**: One-tap guided programs.
- ⏱️ **Session Duration Timer**: Target duration pills (`1m`, `3m`, `5m`, `10m`, `15m`, `20m`, `30m`, or `Open`).

---

### 📳 2. Pulmonary Mobile Haptic Engine
Dynamic tactile vibration guidance via the Web Vibration API (`navigator.vibrate`):
- **Inhale**: Accelerating soft pulses matching breath expansion depth ($0 \to 100\%$).
- **Hold**: Rhythmic, steady subtle ticks marking stillness.
- **Exhale**: De-escalating soft pulses releasing tension.
- **Phase Transition**: Subtle tactile pulses signal phase shifts for eyes-closed practice.

---

### 🗓️ 3. Curated Mindfulness Journeys
Pre-configured 7-day programs that automatically set space, breath rhythm, duration timer, and audio soundscapes in a single tap:
- 🌿 **7 Days to Deep Calm**: Box Breathing + Nature soundscape (10m target).
- 🛡️ **Anxiety & Panic Reset**: Stanford Physiological Sigh + Forest stream (5m target).
- 🌙 **Deep Sleep Preparation**: 4-7-8 Relaxation breath + Ambient Piano (30m target).
- 🪕 **Carnatic Swara Serenity**: Raga Mohanam + Real-time Tanpura Shruti Box drone (20m target).

---

### 🎛️ 4. Dual-Engine Audio Layering
- **YouTube Music Streaming**: Stream ambient tracks or custom YouTube URLs (`https://music.youtube.com/...`).
- **Concurrent Procedural Layering**: Layer real-time procedural soundscapes (Tanpura drone, rain, ocean waves) underneath YouTube Music playback.
- **Ambient Balance Slider**: Independent volume slider for blending procedural background textures.

---

### 🧘 5. 6 Immersive Sanctuary Spaces
Custom visual atmosphere, color palettes, and soundscapes for every mood:
- **Breathe** (*Solar Amber*): Equalized focus & energy balancing (`Box Breathing 4-4-4-4`).
- **Meditate** (*Cosmic Violet*): Deep theta-state stillness (`4–7–8 Breath`).
- **Anxiety** (*Emerald Forest*): Rapid panic reduction (`Physiological Sigh 2-1-4`).
- **Nature** (*Lake Mist & Rain*): Heart Rate Variability rain coherence (`Coherence Breath 5.5s`).
- **Classical** (*Parchment & Crimson*): Indian Carnatic Classical Raga contemplation (`Calm Breath 4-4-6`).
- **Jazz** (*Mid-Century Amber*): Creative rhythm & cognitive flow (`Deep Focus 7-11`).

---

### 📱 6. Full PWA & Offline Sanctuary
- Installed as a native standalone app on iOS, Android, and Desktop.
- Service Worker caching (`sw.js`) enables instant offline access.
- Multi-resolution adaptive icon suite (`favicon.ico`, SVG, Apple Touch, Android Maskable).

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| **`Space`** | Toggle Breathing Session (Begin / Stop) |
| **`C`** / **`S`** | Open Unified Controls Hub |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher)
- `npm`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SriSatyaLokesh/breath.git
   cd breath
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a Pull Request.

---

## 📄 License

Licensed under the **[MIT License](LICENSE)**.
