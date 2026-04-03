import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { useStore } from '../store'

interface Source {
  id: string
  name: string
  thumbnail: string
  type: 'screen' | 'window'
}

export default function Recorder() {
  const [sources, setSources] = useState<Source[]>([])
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const { createProject, setRecording } = useStore()

  // Load available sources on mount
  useEffect(() => {
    loadSources()
  }, [])

  const loadSources = async () => {
    try {
      const sourceList = await window.streamstack?.getSources?.() || []
      setSources(sourceList)
    } catch (error) {
      console.error('Failed to get sources:', error)
      toast.error('Failed to get screen sources')
    }
  }

  const startRecording = useCallback(async () => {
    if (!selectedSource) {
      toast.error('Please select a screen or window to record')
      return
    }

    try {
      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: selectedSource
          }
        } as any,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: selectedSource,
            maxFrameRate: 30
          }
        } as any
      })

      streamRef.current = stream
      chunksRef.current = []

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      })

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const buffer = await blob.arrayBuffer()
        
        // Save the recording
        const result = await window.streamstack?.saveVideo?.(buffer, `streamstack-${Date.now()}.webm`)
        
        if (result?.success) {
          toast.success(`Saved to ${result.path}`)
          // Create project
          createProject(`Project ${new Date().toLocaleString()}`)
        }

        // Stop tracks
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000)
      setIsRecording(true)
      setRecording(true, selectedSource)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordTime(prev => prev + 1)
      }, 1000)

      toast.success('Recording started')
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast.error('Failed to start recording')
    }
  }, [selectedSource, createProject, setRecording])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      setRecordTime(0)
      toast.success('Recording stopped')
    }
  }, [isRecording, setRecording])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Screen Recording</h1>
        <p className="text-slate-400">Select a screen or window to record</p>
      </div>

      {/* Source Grid */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-slate-300 mb-3">Available Sources</h2>
        <div className="grid grid-cols-3 gap-4">
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => setSelectedSource(source.id)}
              className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
                selectedSource === source.id
                  ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-slate-900'
                  : 'hover:ring-2 hover:ring-slate-600'
              }`}
            >
              <img 
                src={source.thumbnail} 
                alt={source.name}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                <span className="text-xs text-white truncate">{source.name}</span>
              </div>
              {selectedSource === source.id && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-violet-500 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
        
        <button
          onClick={loadSources}
          className="mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          Refresh sources
        </button>
      </div>

      {/* Recording Controls */}
      <div className="flex items-center justify-center gap-4 py-8">
        {isRecording ? (
          <>
            <div className="flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 rounded-xl">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="font-mono text-lg">{formatTime(recordTime)}</span>
            </div>
            <button
              onClick={stopRecording}
              className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-red-600/25"
            >
              Stop Recording
            </button>
          </>
        ) : (
          <button
            onClick={startRecording}
            disabled={!selectedSource}
            className={`px-8 py-3 font-medium rounded-xl transition-all duration-200 ${
              selectedSource
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Start Recording
          </button>
        )}
      </div>

      {/* Tips */}
      <div className="mt-auto p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Tips</h3>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>• Click on a source thumbnail to select it</li>
          <li>• Audio from the selected source will be captured</li>
          <li>• After recording, you can add AI voiceover in the AI Voice tab</li>
        </ul>
      </div>
    </div>
  )
}
