# Changelog

All notable changes to StreamStack will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2026-04-03

### Added

- 🎥 Screen recording with auto-zoom effects
  - Full screen or window capture
  - 30fps maximum frame rate
  - Motion blur for smooth transitions
  
- 🔊 AI voice synthesis (TTS) via VibeVoice
  - 90-minute long-form generation
  - Multi-speaker support (up to 4 voices)
  - 50+ language support
  
- ✍️ AI script generation
  - Describe your screen, get a script
  - Multiple tones (professional/casual/enthusiastic/technical)
  - Duration-aware output
  
- 🎬 Video processing
  - FFmpeg-based encoding
  - MP4/WebM/GIF export
  - Customizable resolution (480p to 4K)
  - Quality presets
  
- 📝 Rich UI components
  - Recording panel with source selector
  - Timeline with zoom segment editing
  - Project management sidebar
  - Settings panel
  - Export workflow

- ⚙️ Electron app foundation
  - Cross-platform desktop support (macOS/Windows/Linux)
  - IPC communication layer
  - Native file dialogs
  
- 🐍 Python backend
  - FastAPI REST server
  - Modular TTS/STT engines
  - FFmpeg video processing

- 📦 CI/CD
  - GitHub Actions multi-platform builds
  - Automated release artifacts

### Technical Details

- Frontend: Electron + React + TypeScript + Tailwind CSS
- Backend: FastAPI + Python 3.10+
- Video: ffmpeg
- AI: VibeVoice (Microsoft), deer-flow (ByteDance)

## [0.1.0] - 2026-04-01

### Added

- Initial project structure
- Basic repository setup
- MIT License

---

## Future Plans

See [GitHub Issues](https://github.com/PHclaw/streamstack/issues) for planned features.

### v1.1 (Planned)

- Real-time zoom preview
- Multi-track audio editor
- Automatic caption generation

### v2.0 (Future)

- Cloud rendering
- Team collaboration
- Plugin marketplace
