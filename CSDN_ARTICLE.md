# 【开源推荐】StreamStack：AI 原生录屏工具，彻底免费的 Screen Studio 替代品

> **前言：** 最近在 GitHub Trending 上冲榜的一个项目，48 小时内获得了大量关注。它解决了一个痛点：录屏 + 配音的工作流太繁琐。今天就给大家详细介绍这个项目。

---

## 一、项目背景

做技术分享、产品演示的时候，你是不是也遇到过这些问题：

1. **录屏工具太贵** — Screen Studio 要 $29/月，对于个人开发者来说有点肉疼
2. **配音太麻烦** — 写脚本 → 录音 → 对时间轴 → 调整，一圈下来半天没了
3. **编辑门槛高** — 想加个缩放效果，得学 Premiere 或 Final Cut
4. **AI 工具分散** — 录屏用 OBS，配音用 ElevenLabs，字幕用另一个工具，切换来切换去

**StreamStack** 就是为了解决这些问题而生的。

---

## 二、核心功能

### 1. 智能录屏 + 自动缩放

- 支持全屏录制或指定窗口
- **自动缩放效果** — 鼠标点击位置自动聚焦，cinematic 效果
- 运动模糊让画面更流畅
- 支持麦克风 + 系统声音录制

### 2. AI 语音合成（TTS）

集成微软开源的 **VibeVoice**，支持：

- **90 分钟长文本** — 一次生成，不需要分段
- **4 人对话** — 多角色配音，适合教程视频
- **50+ 语言** — 中英日韩法德西葡等

### 3. AI 脚本生成

不会写解说词？没问题：

```
输入：描述你的屏幕内容（如"演示一个登录流程"）
输出：完整的配音脚本
```

支持多种风格：专业、轻松、热情、技术向

### 4. 一键导出

- 格式：MP4 / WebM / GIF
- 分辨率：480p / 720p / 1080p / 4K
- 质量可选

---

## 三、技术架构

项目采用前后端分离架构：

| 层级 | 技术栈 |
|------|--------|
| 前端 | Electron + React + TypeScript |
| UI 框架 | Tailwind CSS |
| 后端 | FastAPI + Python |
| 语音 AI | VibeVoice（微软开源） |
| Agent | deer-flow（字节开源） |
| 视频处理 | ffmpeg |

**GitHub 地址：** https://github.com/PHclaw/streamstack

---

## 四、快速开始

### 方式一：下载安装包

前往 GitHub Releases 页面下载对应平台的安装包：

- macOS: `.dmg`
- Windows: `.exe`
- Linux: `.AppImage`

### 方式二：从源码构建

```bash
# 克隆仓库
git clone https://github.com/PHclaw/streamstack.git
cd streamstack

# 安装前端依赖
npm install

# 启动前端
npm run dev

# 另一个终端，启动后端
pip install -r backend/requirements.txt
npm run backend:dev
```

### 方式三：Docker

```bash
docker compose up -d
# 访问 http://localhost:3000
```

---

## 五、与竞品对比

| 功能 | StreamStack | Screen Studio | Loom | OBS |
|------|-------------|---------------|------|-----|
| 价格 | 免费 | $29/月 | $12.5/月 | 免费 |
| 开源 | ✅ MIT | ❌ | ❌ | ✅ GPL |
| AI 配音 | ✅ 内置 | ❌ | ❌ | ❌ |
| AI 脚本 | ✅ 内置 | ❌ | ❌ | ❌ |
| 自动缩放 | ✅ | ✅ | ❌ | ❌ |
| 多语言 | ✅ 50+ | ❌ | ❌ | ❌ |

---

## 六、开发路线图

**v1.0（当前）**
- [x] 屏幕录制 + 缩放效果
- [x] AI 语音合成
- [x] AI 脚本生成
- [x] 多格式导出

**v1.1（计划中）**
- [ ] 实时缩放预览
- [ ] 多轨道音频编辑
- [ ] 字幕自动生成

**v2.0（未来）**
- [ ] 云端渲染
- [ ] 团队协作
- [ ] 插件市场

---

## 七、开源致谢

StreamStack 站在巨人的肩膀上：

- **openscreen** — 录屏核心架构
- **VibeVoice** — 微软开源的语音 AI
- **deer-flow** — 字节开源的 Agent 框架
- **ffmpeg** — 视频处理基石

---

## 八、项目亮点分析

### 1. 真正的开源精神

不是"开源核心功能，高级功能收费"的套路。完整功能，MIT 协议，商用都行。

### 2. AI 原生设计

不是后期硬塞个 AI 功能，而是从第一天就围绕 AI 工作流设计。

### 3. 社区驱动

欢迎提交 Issue、PR，一起完善这个工具。

---

## 九、总结

如果你是：
- 🎬 内容创作者，需要快速制作教程视频
- 💻 开发者，想展示自己的项目
- 📚 教育工作者，制作在线课程
- 🚀 产品经理，录制产品演示

**StreamStack 值得一试。**

完全免费，无水印，无订阅，开源透明。

---

**GitHub 地址：** https://github.com/PHclaw/streamstack

**如果觉得有用，欢迎 Star ⭐ 支持开源！**

---

## 评论区互动

> 你现在用什么工具录屏？遇到过哪些痛点？欢迎在评论区交流 👇

---

**相关推荐：**
- [GitHub AI 趋势周报](https://github.com/PHclaw/streamstack)
- [VibeVoice：微软开源的 90 分钟语音合成模型]()
- [deer-flow：字节开源的 SuperAgent 框架]()

---

🏷️ **标签：** #GitHub #开源项目 #录屏工具 #AI配音 #ScreenStudio替代 #开发者工具 #效率工具 #StreamStack
