# Contributing to StreamStack

Thanks for your interest in contributing! 🎉

## Development Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- ffmpeg

### Quick Start

```bash
# Clone the repo
git clone https://github.com/PHclaw/streamstack.git
cd streamstack

# Install frontend dependencies
npm install

# Start the dev server
npm run dev
```

In another terminal:

```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Start the backend
npm run backend:dev
```

## Project Structure

```
streamstack/
├── src/
│   ├── main/           # Electron main process
│   ├── preload/        # Preload scripts
│   └── renderer/       # React frontend
├── backend/            # Python FastAPI backend
│   ├── api/            # REST endpoints
│   ├── tts/            # Text-to-speech
│   ├── stt/            # Speech-to-text
│   └── script/         # AI script generation
└── docs/               # Documentation
```

## Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our code style

3. Run tests:
   ```bash
   npm test
   ```

4. Commit with a descriptive message:
   ```bash
   git commit -m "feat: add your feature description"
   ```

5. Push and create a Pull Request

## Code Style

- **TypeScript**: Use strict mode, avoid `any`
- **React**: Functional components with hooks
- **Python**: Follow PEP 8, use type hints
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/)

## Need Help?

- Open an issue for bugs or feature requests
- Join our Discord (coming soon)
- Check existing issues before opening new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
