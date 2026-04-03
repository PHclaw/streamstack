import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { useStore } from '../store'

interface Source {
  id: string
  name: string
  thumbnail: string
  type: 'screen' | 'window'
}

export default function SourceSelector() {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const { setRecording } = useStore()

  useEffect(() => {
    loadSources()
  }, [])

  const loadSources = async () => {
    setLoading(true)
    try {
      const sourceList = await window.streamstack?.getSources?.() || []
      setSources(sourceList)
    } catch (error) {
      console.error('Failed to load sources:', error)
      toast.error('Failed to get screen sources')
    } finally {
      setLoading(false)
    }
  }

  const previewSource = async (sourceId: string) => {
    // Stop previous stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false as any,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
            maxFrameRate: 30
          }
        } as any
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      setSelectedId(sourceId)
    } catch (error) {
      console.error('Preview failed:', error)
      toast.error('Failed to preview source')
    }
  }

  const confirmSelection = () => {
    if (selectedId && streamRef.current) {
      // The parent component will handle the recording
      setRecording(false, selectedId)
      toast.success('Source selected')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <h2 className="text-lg font-medium text-white">Select Source</h2>
        <button
          onClick={loadSources}
          disabled={loading}
          className="text-sm text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Source Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => previewSource(source.id)}
              className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                selectedId === source.id
                  ? 'border-violet-500 shadow-lg shadow-violet-500/20'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <img
                src={source.thumbnail}
                alt={source.name}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    source.type === 'screen' ? 'bg-blue-400' : 'bg-green-400'
                  }`} />
                  <span className="text-xs text-white truncate">{source.name}</span>
                </div>
              </div>
              {selectedId === source.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {sources.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-400">No screen sources found</p>
            <button
              onClick={loadSources}
              className="mt-3 text-sm text-violet-400 hover:text-violet-300"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Preview Area */}
      {selectedId && (
        <div className="border-t border-slate-700/50 p-4">
          <p className="text-xs text-slate-400 mb-2">Preview</p>
          <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
          <button
            onClick={confirmSelection}
            className="mt-3 w-full py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all"
          >
            Use This Source
          </button>
        </div>
      )}
    </div>
  )
}
