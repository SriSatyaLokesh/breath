# 🪷 Swaasa Midha Dhyasa — Minimalist Digital Sanctuary

> **Swaasa Midha Dhyasa** (Telugu/Sanskrit: *"Mindfulness & Awareness on the Breath"*) is an open-source, haute-luxury audio-visual mindfulness web application designed to guide deep breathing, meditation, anxiety relief, and inner tranquility.

---

## 💡 Inspiration & Attribution

This project is inspired by the artistic CodePen concept by **Visaint**:  
🔗 **[Visaint's CodePen — JobLQJb](https://codepen.io/visaint/pen/JobLQJb)**

We express our gratitude to the original creative exploration for inspiring the visual philosophy of digital tranquility.

---

## ✨ Key Features

- **🧘 6 Immersive Sanctuary Spaces**:
  - **Breathe** (*Solar Amber*): Equalized focus & energy balancing.
  - **Meditate** (*Cosmic Violet*): Deep theta-state stillness.
  - **Anxiety** (*Emerald Forest*): Stanford Neurobiology rapid stress & panic relief.
  - **Nature** (*Lake Mist & Rain*): Heart Rate Variability (HRV) ocean & rain coherence.
  - **Classical** (*Parchment & Crimson*): Indian Carnatic Classical Raga contemplation.
  - **Jazz** (*Saul Bass Mid-Century*): Creative rhythm, swing & cognitive flow.

- **🫁 Space-Specific Science-Backed Breath Techniques**:
  - **Box Breathing** (`4 · 4 · 4 · 4`): Used by Navy SEALs to regain focus and calm under pressure.
  - **4–7–8 Breath** (`4 · 7 · 8`): Natural nervous system tranquilizer for sleep and deep relaxation.
  - **Physiological Sigh** (`2 · 1 · 4`): Stanford double-inhale method for rapid CO₂ offloading.
  - **Coherence Breath** (`5.5 · 5.5`): HRV synchronization matching natural water and tide rhythms.
  - **Calm Breath** (`4 · 4 · 6`): Extended exhale triggering parasympathetic nervous system response.
  - **Deep Focus 7–11** (`4 · 7`): Lowers heart rate and sharpens cognitive clarity.

- **🫁 Natural Pulmonary Airflow Guidance**:
  - Authentic human inhalation air sounds (nasal/throat air flow) and soft exhalation releases.
  - Zero synthetic sine tones, zero alert beeps, zero pitch glides.

- **🎵 YouTube Music Stream Integration**:
  - Stream your favorite meditation, ambient, or classical music directly from **YouTube Music** (`https://music.youtube.com/...`) or YouTube videos.
  - Hidden background YouTube IFrame Player API integration obeying master volume and session timers.

- **🪕 Indian Carnatic Classical Audio Engine**:
  - Continuous sacred **Tanpura Drone (Shruti Box)** tuned to Sa-Pa-Sa' (`136.1 Hz / 204.15 Hz / 272.2 Hz`).
  - **Raga Mohanam / Hamsadhvani / Kalyani** swara synthesis with microtonal **Gamaka** pitch slides (Veena, Flute & Violin).

- **⏱️ Customizable Session Duration Timer**:
  - Tailored default durations for every space (`Meditate: 30m`, `Anxiety: 10m`, `Nature: 15m`, `Classical: 20m`, `Jazz: 15m`, `Breathe: 5m`).
  - Live `MM:SS` countdown timer with gentle session completion routines.

- **🎨 Dynamic Space Color Palette Alignment**:
  - UI modals, tool buttons, active cards, volume sliders, and controls dynamically adapt to the active space's accent colors.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| **`Space`** | Toggle Breathing Session (Begin / Stop) |
| **`B`** | Open Breathing Methods & Custom Pattern Builder |
| **`M`** | Open Audio, YouTube Music & Session Timer |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0 or higher)
- `npm` or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/swaasa-midha-dhyasa.git
   cd swaasa-midha-dhyasa
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

## 📁 Repository Structure

```
swaasa-midha-dhyasa/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── src/
│   ├── js/
│   │   ├── audio/
│   │   │   ├── synths/
│   │   │   │   ├── ambient-synth.js
│   │   │   │   ├── classical-synth.js  # Indian Carnatic Synthesizer
│   │   │   │   ├── jazz-synth.js
│   │   │   │   └── nature-synth.js
│   │   │   ├── audio-engine.js
│   │   │   └── youtube-player.js     # YouTube IFrame API Wrapper
│   │   ├── ui/
│   │   │   ├── breath-modal.js
│   │   │   └── music-modal.js
│   │   ├── visuals/
│   │   │   └── canvas-renderer.js
│   │   ├── app.js
│   │   ├── breath-patterns.js
│   │   ├── state.js
│   │   └── themes.js
│   └── styles/
│       └── main.css
├── index.html
├── CONTRIBUTING.md
├── LICENSE
├── package.json
└── README.md
```

---

## 🤝 Contributing

We welcome open-source contributions from developers, designers, sound artists, and mindfulness enthusiasts!  
Please read our **[CONTRIBUTING.md](CONTRIBUTING.md)** guidelines before submitting a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License** — see the **[LICENSE](LICENSE)** file for details.
