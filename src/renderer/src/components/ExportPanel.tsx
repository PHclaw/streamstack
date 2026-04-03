import { useState } from 'react'
import { toast } from 'sonner'
import { useStore } from '../store'

const FORMATS = [
  { id: 'mp4', name: 'MP4 (H.264)', extension: '.mp4' },
  { id: 'webm', name: 'WebM (VP9)', extension: '.webm' },
  { id: 'gif', name: 'GIF (Animated)', extension: '.gif' },
]

const RESOLUTIONS = [
  { id: '4k', name: '4K (2160p)', width: 3840, height: 2160 },
  { id: '1080p', name: '1080p (Full HD)', width: 1920, height: 1080 },
  { id: '720p', name: '720p (HD)', width: 1280, height: 720 },
  { id: '480p', name: '480p (SD)', width: 854, height: 480 },
]

export default function ExportPanel() {
  const { currentProject } = useStore()
  const [format, setFormat] = useState('mp4')
  const [resolution, setResolution] = useState('1080p')
  const [quality, setQuality] = useState('high')
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleExport = async () => {
    if (!currentProject?.videoPath) {
      toast.error('No video to export. Record something first!')
      return
    }

    setExporting(true)
    setProgress(0)

    // Simulate export progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // In real implementation, call backend API
    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setExporting(false)
      toast.success('Export complete!')
    }, 2500)
  }

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400">No project to export</p>
      </div>
    )
  }

  const selectedRes = RESOLUTIONS.find(r => r.id === resolution) || RESOLUTIONS[1]
  const selectedFormat = FORMATS.find(f => f.id === format) || FORMATS[0]

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Export Video</h1>
        <p className="text-slate-400">Configure and export your final video</p>
      </div>

      {/* Format Selection */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
        <h2 className="text-lg font-medium text-white mb-4">Format</h2>
        <div className="grid grid-cols-3 gap-3">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`p-4 rounded-xl border transition-all ${
                format === f.id
                  ? 'border-violet-500 bg-violet-500/10 text-white'
                  : 'border-slate-700 bg-slate-700/30 text-slate-400 hover:border-slate-600'
              }`}
            >
              <p className="font-medium">{f.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Resolution Selection */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
        <h2 className="text-lg font-medium text-white mb-4">Resolution</h2>
        <div className="grid grid-cols-2 gap-3">
          {RESOLUTIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => setResolution(r.id)}
              className={`p-4 rounded-xl border transition-all ${
                resolution === r.id
                  ? 'border-violet-500 bg-violet-500/10 text-white'
                  : 'border-slate-700 bg-slate-700/30 text-slate-400 hover:border-slate-600'
              }`}
            >
              <p className="font-medium">{r.name}</p>
              <p className="text-xs mt-1">{r.width} × {r.height}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quality */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
        <h2 className="text-lg font-medium text-white mb-4">Quality</h2>
        <div className="grid grid-cols-3 gap-3">
          {['low', 'medium', 'high'].map((q) => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              className={`p-4 rounded-xl border transition-all capitalize ${
                quality === q
                  ? 'border-violet-500 bg-violet-500/10 text-white'
                  : 'border-slate-700 bg-slate-700/30 text-slate-400 hover:border-slate-600'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Export Summary */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
        <h2 className="text-lg font-medium text-white mb-4">Export Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Format</p>
            <p className="text-white">{selectedFormat.name}</p>
          </div>
          <div>
            <p className="text-slate-400">Resolution</p>
            <p className="text-white">{selectedRes.width} × {selectedRes.height}</p>
          </div>
          <div>
            <p className="text-slate-400">Quality</p>
            <p className="text-white capitalize">{quality}</p>
          </div>
          <div>
            <p className="text-slate-400">Duration</p>
            <p className="text-white">{currentProject.duration}s</p>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50 shadow-lg shadow-violet-600/25"
      >
        {exporting ? `Exporting... ${progress}%` : 'Export Video'}
      </button>

      {/* Progress Bar */}
      {exporting && (
        <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
