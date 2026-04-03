# 🎬 StreamStack

> **AI 原生录屏 + 配音工作流**
> 开源版 Screen Studio 替代品，内置 AI 语音解说、智能脚本生成和专业剪辑功能。

---

## ✨ 核心特性

- 🎥 **智能录屏** — 全屏/窗口录制 + 自动缩放效果
- 🔊 **AI 配音** — 使用 VibeVoice 等 TTS 引擎自动生成语音解说
- ✂️ **AI 脚本生成** — 不会写解说词？AI 帮你写
- 🎯 **电影级运镜** — 顺滑的缩放、推拉、动态模糊效果
- 📝 **丰富标注** — 文字、箭头、高亮、截图标注
- 🌐 **多语言支持** — 50+ 语言配音（VibeVoice）
- ⚡ **实时预览** — 导出前随时预览修改效果
- 🎬 **全格式导出** — MP4 / WebM / GIF，自定义分辨率和比例
- 🆓 **100% 免费** — 无水印、无订阅、MIT 开源协议

---

## 🚀 快速开始

### 下载安装包

| 平台 | 下载链接 | 要求 |
|------|---------|------|
| macOS | [StreamStack-Mac.dmg](https://github.com/streamstack/streamstack/releases) | macOS 13+ |
| Windows | [StreamStack-Win.exe](https://github.com/streamstack/streamstack/releases) | Windows 10+ |
| Linux | [StreamStack-Linux.AppImage](https://github.com/streamstack/streamstack/releases) | Ubuntu 22.04+ |

### 从源码构建

```bash
# 环境要求
# - Node.js 18+
# - Python 3.10+ (AI 功能)
# - ffmpeg

git clone https://github.com/streamstack/streamstack.git
cd streamstack
npm install
npm run dev
```

---

## 🏗️ 技术架构

```
streamstack/
├── src/                    # Electron + React 前端
│   ├── components/         # UI 组件
│   ├── hooks/             # React Hooks
│   ├── store/             # 状态管理
│   └── workers/           # 视频处理 Worker
├── backend/               # Python 后端服务
│   ├── api/               # FastAPI 服务
│   ├── tts/               # VibeVoice TTS 集成
│   ├── stt/               # VibeVoice-ASR 语音识别
│   └── script/            # AI 脚本生成
└── shared/                # 共享类型定义
```

---

## 🤖 AI 功能详解

### 语音合成（TTS）
| 引擎 | 质量 | 是否离线 | 费用 |
|------|------|---------|------|
| **VibeVoice** (推荐) | ⭐⭐⭐⭐⭐ | ❌ | 免费 |
| ElevenLabs | ⭐⭐⭐⭐⭐ | ❌ | 按量付费 |
| Bark | ⭐⭐⭐ | ✅ | 免费 |

### 语音识别（ASR）
| 引擎 | 准确率 | 长音频 | 支持语言 |
|------|--------|--------|---------|
| **VibeVoice-ASR** (推荐) | ⭐⭐⭐⭐⭐ | 60分钟 | 50+ |
| Whisper | ⭐⭐⭐⭐ | 30分钟 | 100+ |

---

## 🗺️ 开发路线图

- [ ] v1.0 — 核心录屏 + 缩放 + 标注
- [ ] v1.1 — VibeVoice TTS 配音集成
- [ ] v1.2 — AI 脚本生成（根据屏幕内容）
- [ ] v2.0 — 云端渲染 + 团队协作
- [ ] v2.1 — 企业品牌套件
- [ ] v2.2 — 插件市场

---

## 🌍 开源组件致谢

| 项目 | 开源协议 | 用途 |
|------|---------|------|
| [openscreen](https://github.com/siddharthvaddem/openscreen) | MIT | 录屏核心 |
| [VibeVoice](https://github.com/microsoft/VibeVoice) | MIT | 语音 AI（TTS + ASR）|
| [deer-flow](https://github.com/bytedance/deer-flow) | Apache 2.0 | Agent 编排 |
| [ffmpeg](https://ffmpeg.org/) | LGPL/GPL | 视频处理 |
| [Electron](https://electronjs.org/) | MIT | 跨平台桌面框架 |

---

## 🤝 参与贡献

欢迎提交 Pull Request！

```bash
# Fork → Clone → 创建分支 → 开发 → 提交 PR
git clone https://github.com/YOUR_USERNAME/streamstack.git
cd streamstack
git checkout -b feature/your-feature
npm install && npm run dev
```

---

## 📄 许可协议

MIT License — 详见 [LICENSE](LICENSE)

---

**如果这个项目对你有帮助，请 Star ⭐ 并分享给需要免费录屏工具的开发者！**
