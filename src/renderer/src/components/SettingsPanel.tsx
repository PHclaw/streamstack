import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Settings {
  defaultFormat: string
  defaultResolution: string
  defaultQuality: string
  outputDirectory: string
  audioDevice: string
  videoDevice: string
}

const defaultSettings: Settings = {
  defaultFormat: 'mp4',
  defaultResolution: '1080p',
  defaultQuality: 'medium',
  outputDirectory: '',
  audioDevice: 'default',
  videoDevice: 'default',
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load settings from electron-store or localStorage
    const saved = localStorage.getItem('streamstack-settings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse settings:', e)
      }
    }
    setLoading(false)
  }, [])

  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings)
    localStorage.setItem('streamstack-settings', JSON.stringify(newSettings))
    toast.success('Settings saved')
  }

  const handleExportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'streamstack-settings.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Settings exported')
  }

  const handleImportSettings = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string)
          saveSettings({ ...defaultSettings, ...imported })
          toast.success('Settings imported')
        } catch (err) {
          toast.error('Invalid settings file')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Video Settings */}
        <section className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h2 className="text-lg font-medium text-white mb-4">Video</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Default Format</label>
              <select
                value={settings.defaultFormat}
                onChange={(e) => saveSettings({ ...settings, defaultFormat: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-violet-500 focus:outline-none"
              >
                <option value="mp4">MP4 (H.264)</option>
                <option value="webm">WebM (VP9)</option>
                <option value="gif">GIF (Animated)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Default Resolution</label>
              <select
                value={settings.defaultResolution}
                onChange={(e) => saveSettings({ ...settings, defaultResolution: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-violet-500 focus:outline-none"
              >
                <option value="4k">4K (2160p)</option>
                <option value="1080p">1080p (Full HD)</option>
                <option value="720p">720p (HD)</option>
                <option value="480p">480p (SD)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Encoding Quality</label>
              <select
                value={settings.defaultQuality}
                onChange={(e) => saveSettings({ ...settings, defaultQuality: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-violet-500 focus:outline-none"
              >
                <option value="ultrafast">Ultra Fast (Larger file)</option>
                <option value="fast">Fast</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="slow">Slow (Smaller file)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Audio Settings */}
        <section className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h2 className="text-lg font-medium text-white mb-4">Audio</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Audio Device</label>
              <select
                value={settings.audioDevice}
                onChange={(e) => saveSettings({ ...settings, audioDevice: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-violet-500 focus:outline-none"
              >
                <option value="default">System Default</option>
                <option value="microphone">Microphone</option>
                <option value="system">System Audio</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        </section>

        {/* Storage Settings */}
        <section className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h2 className="text-lg font-medium text-white mb-4">Storage</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Output Directory</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.outputDirectory}
                  onChange={(e) => saveSettings({ ...settings, outputDirectory: e.target.value })}
                  placeholder="Default: ~/Videos/StreamStack"
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-violet-500 focus:outline-none"
                />
                <button
                  onClick={async () => {
                    const path = await window.streamstack?.openFile?.()
                    if (path) {
                      saveSettings({ ...settings, outputDirectory: path })
                    }
                  }}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 hover:bg-slate-600 transition-colors"
                >
                  Browse
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Import/Export */}
        <section className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h2 className="text-lg font-medium text-white mb-4">Configuration</h2>
          
          <div className="flex gap-3">
            <button
              onClick={handleExportSettings}
              className="flex-1 py-2 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
            >
              Export Settings
            </button>
            <button
              onClick={handleImportSettings}
              className="flex-1 py-2 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
            >
              Import Settings
            </button>
            <button
              onClick={() => {
                saveSettings(defaultSettings)
                toast.success('Settings reset')
              }}
              className="flex-1 py-2 bg-red-600/20 text-red-400 font-medium rounded-lg hover:bg-red-600/30 transition-colors"
            >
              Reset to Default
            </button>
          </div>
        </section>

        {/* About */}
        <section className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h2 className="text-lg font-medium text-white mb-2">About</h2>
          <p className="text-sm text-slate-400 mb-3">
            StreamStack v1.0.0 — AI-Native Screen Recording & Voiceover Studio
          </p>
          <div className="flex gap-3 text-xs">
            <a
              href="https://github.com/PHclaw/streamstack"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300"
            >
              GitHub
            </a>
            <a
              href="https://github.com/PHclaw/streamstack/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300"
            >
              Report Issue
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
