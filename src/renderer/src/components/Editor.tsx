import { useState } from 'react'
import { toast } from 'sonner'
import { useStore } from '../store'

export default function Editor() {
  const { currentProject, addZoomSegment, deleteZoomSegment } = useStore()
  const [zoomScale, setZoomScale] = useState(1.5)
  const [zoomStartTime, setZoomStartTime] = useState(0)
  const [zoomEndTime, setZoomEndTime] = useState(5)

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400">No project selected. Record something first!</p>
      </div>
    )
  }

  const handleAddZoom = () => {
    if (zoomStartTime >= zoomEndTime) {
      toast.error('Start time must be less than end time')
      return
    }
    
    addZoomSegment({
      startTime: zoomStartTime,
      endTime: zoomEndTime,
      scale: zoomScale,
      x: 0.5,
      y: 0.5
    })
    
    toast.success('Zoom segment added')
    setZoomEndTime(zoomEndTime + 5)
    setZoomStartTime(zoomEndTime)
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Video Editor</h1>
        <p className="text-slate-400">Add zoom effects and annotations</p>
      </div>

      {/* Timeline Preview */}
      <div className="aspect-video bg-slate-800 rounded-xl mb-6 flex items-center justify-center border border-slate-700/50">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-slate-500">Video preview will appear here</p>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
        <h2 className="text-lg font-medium text-white mb-4">Add Zoom Effect</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Start Time (s)</label>
            <input
              type="number"
              value={zoomStartTime}
              onChange={(e) => setZoomStartTime(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-violet-500 focus:outline-none"
              min={0}
              step={0.5}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">End Time (s)</label>
            <input
              type="number"
              value={zoomEndTime}
              onChange={(e) => setZoomEndTime(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-violet-500 focus:outline-none"
              min={0}
              step={0.5}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-2">Zoom Scale: {zoomScale}x</label>
          <input
            type="range"
            value={zoomScale}
            onChange={(e) => setZoomScale(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
            min={1}
            max={3}
            step={0.1}
          />
        </div>

        <button
          onClick={handleAddZoom}
          className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all"
        >
          Add Zoom Segment
        </button>
      </div>

      {/* Zoom Segments List */}
      {currentProject.zoomSegments.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-lg font-medium text-white mb-4">Zoom Segments</h2>
          <div className="space-y-2">
            {currentProject.zoomSegments.map((segment, index) => (
              <div
                key={segment.id}
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-violet-500/20 text-violet-400 text-xs font-medium rounded flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="text-sm">
                    <span className="text-white">{segment.startTime}s - {segment.endTime}s</span>
                    <span className="text-slate-400 ml-2">{segment.scale}x zoom</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteZoomSegment(segment.id)}
                  className="text-slate-400 hover:text-red-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
