# 🎬 StreamStack

> **AI-Native Screen Recording & Voiceover Studio**
> Open-source alternative to Screen Studio — with built-in AI voice narration, smart editing, and auto-generated demo videos.

[English](README.md) · [中文](README_zh.md) · [日本語](README_ja.md)

---

## ✨ Features

- 🎥 **Smart Screen Recording** — Record full screen or specific windows with automatic zoom effects
- 🔊 **AI Voice Narration** — Auto-generate voiceover using VibeVoice (or any TTS engine)
- ✂️ **AI Script Generation** — Don't know what to say? Let AI write your demo script
- 🎯 **Auto Zoom & Pan** — Cinematic pan-and-zoom effects with motion blur
- 📝 **Rich Annotations** — Add text, arrows, highlights to your recordings
- 🌐 **Multi-language TTS** — 50+ languages supported (powered by VibeVoice-ASR/TTS)
- ⚡ **Real-time Preview** — See your changes before exporting
- 🎬 **Export Anywhere** — MP4, WebM, GIF with custom resolutions and aspect ratios
- 🆓 **100% Free** — No watermarks, no subscriptions, MIT Licensed

---

## 📸 Screenshots

![StreamStack Preview](public/preview.png)

---

## 🚀 Quick Start

### Download (Recommended)

Download the latest release for your platform:

- **macOS** → [OpenScreen-Mac.dmg](https://github.com/streamstack/streamstack/releases) (macOS 13+)
- **Windows** → [OpenScreen-Win.exe](https://github.com/streamstack/streamstack/releases)
- **Linux** → [OpenScreen-Linux.AppImage](https://github.com/streamstack/streamstack/releases)

```bash
# macOS Gatekeeper fix (if blocked)
xattr -rd com.apple.quarantine /Applications/StreamStack.app
```

### Build from Source

```bash
# Prerequisites
# - Node.js 18+
# - Python 3.10+ (for AI features)
# - ffmpeg

# Clone the repo
git clone https://github.com/streamstack/streamstack.git
cd streamstack

# Install dependencies
npm install

# Start the app
npm run dev
```

### Docker

```bash
# Build and run with GPU support (for AI features)
docker compose up -d

# Access at http://localhost:3000
```

---

## 🏗️ Architecture

```
streamstack/
├── src/                    # Frontend (Electron + React)
│   ├── components/         # UI Components
│   ├── hooks/              # Custom React hooks
│   ├── store/              # State management
│   └── utils/              # Utilities
├── backend/               # Backend services
│   ├── api/                # FastAPI server
│   ├── tts/                # TTS integration (VibeVoice)
│   ├── stt/                # STT integration (VibeVoice-ASR)
│   └── script/             # AI script generation
├── shared/                 # Shared types and constants
├── docs/                   # Documentation
└── public/                 # Static assets
```

---

## 🤖 AI Features

StreamStack integrates the best open-source AI models for voice:

### Voice Synthesis (TTS)
- **VibeVoice** (Recommended) — Microsoft open-source, 90-min long-form, multi-speaker
- ElevenLabs API — High quality (optional)
- Bark — Fully offline, open-source

### Speech Recognition (ASR)
- **VibeVoice-ASR** — 60-min long-form, 50+ languages, speaker diarization
- Whisper — OpenAI's industry-standard STT

### Script Generation
- GPT-4 / Claude — AI-powered demo script writer
- Local models via Ollama

---

## 🎯 Roadmap

- [ ] v1.0 — Core recording + zoom + annotations
- [ ] v1.1 — VibeVoice TTS integration
- [ ] v1.2 — AI script generation from screen content
- [ ] v2.0 — Cloud rendering + collaboration
- [ ] v2.1 — Team workspace + brand kits
- [ ] v2.2 — Plugin marketplace

---

## 🌍 Open Source Integration Credits

StreamStack is built on the shoulders of giants:

| Project | License | Usage |
|---------|---------|-------|
| [openscreen](https://github.com/siddharthvaddem/openscreen) | MIT | Screen recording core |
| [VibeVoice](https://github.com/microsoft/VibeVoice) | MIT | Voice AI (TTS + ASR) |
| [deer-flow](https://github.com/bytedance/deer-flow) | Apache 2.0 | Agent orchestration |
| [ffmpeg](https://ffmpeg.org/) | LGPL/GPL | Video processing |
| [Electron](https://electronjs.org/) | MIT | Cross-platform desktop |
| [React](https://react.dev/) | MIT | UI framework |

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Fork → Clone → Create branch → Develop → PR
git clone https://github.com/YOUR_USERNAME/streamstack.git
cd streamstack
git checkout -b feature/your-feature
npm install && npm run dev
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## ⭐ If This Helped You

Star this repo and share it with developers who need free screen recording tools!

Built with ❤️ by the StreamStack Community

---

## 📖 Learn More

Read **[My Story →](ABOUT.md)** — How StreamStack was born and what drives this project.

**My Mission:** Democratize video creation for every developer. No paywalls. No watermarks. Just tools.
