import { useState } from 'react'
import { useStore } from '../store'

interface ToolbarProps {
  onRecord: () => void
  onStop: () => void
  onExport: () => void
  isRecording: boolean
}

export default function Toolbar({ onRecord, onStop, onExport, isRecording }: ToolbarProps) {
  const { currentProject } = useStore()
  const [showExportMenu, setShowExportMenu] = useState(false)

  const hasProject = currentProject !== null

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700/50 backdrop-blur-xl">
      {/* Left: Project info */}
      <div className="flex items-center gap-4">
        {hasProject && (
          <>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-sm text-slate-300">
                {currentProject.name}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {currentProject.duration}s • {currentProject.zoomSegments.length} effects
            </div>
          </>
        )}
      </div>

      {/* Center: Record controls */}
      <div className="flex items-center gap-2">
        {!isRecording ? (
          <button
            onClick={onRecord}
            disabled={!hasProject}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium rounded-xl hover:from-red-500 hover:to-orange-500 transition-all shadow-lg shadow-red-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" />
            </svg>
            <span>Record</span>
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-5 py-2 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            <span>Stop</span>
          </button>
        )}
      </div>

      {/* Right: Export */}
      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          disabled={!hasProject || isRecording}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Export</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Export dropdown */}
        {showExportMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
            <button
              onClick={() => {
                onExport()
                setShowExportMenu(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 transition-colors"
            >
              Export as MP4
            </button>
            <button
              onClick={() => {
                onExport()
                setShowExportMenu(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 transition-colors"
            >
              Export as WebM
            </button>
            <button
              onClick={() => {
                onExport()
                setShowExportMenu(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 transition-colors"
            >
              Export as GIF
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
