import { useState, useRef, useEffect } from 'react'

interface TimelineProps {
  duration: number
  currentTime: number
  zoomSegments: Array<{
    id: string
    startTime: number
    endTime: number
    scale: number
  }>
  onTimeChange: (time: number) => void
  onAddZoom: (startTime: number, endTime: number) => void
}

export default function Timeline({
  duration,
  currentTime,
  zoomSegments,
  onTimeChange,
  onAddZoom,
}: TimelineProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectionStart, setSelectionStart] = useState<number | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 10)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`
  }

  const getTimeFromEvent = (e: React.MouseEvent) => {
    if (!timelineRef.current || duration === 0) return 0
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, x / rect.width))
    return percent * duration
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const time = getTimeFromEvent(e)
    setIsDragging(true)
    setSelectionStart(time)
    setSelectionEnd(time)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const time = getTimeFromEvent(e)
    setSelectionEnd(time)
  }

  const handleMouseUp = () => {
    if (isDragging && selectionStart !== null && selectionEnd !== null) {
      const start = Math.min(selectionStart, selectionEnd)
      const end = Math.max(selectionStart, selectionEnd)
      if (end - start > 0.5) {
        onAddZoom(start, end)
      }
    }
    setIsDragging(false)
    setSelectionStart(null)
    setSelectionEnd(null)
  }

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [isDragging, selectionStart, selectionEnd])

  // Generate timeline markers
  const markers = []
  const interval = duration > 60 ? 10 : duration > 30 ? 5 : 1
  for (let i = 0; i <= duration; i += interval) {
    markers.push(i)
  }

  return (
    <div className="flex flex-col bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      {/* Time display */}
      <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Timeline track */}
      <div
        ref={timelineRef}
        className="relative h-12 bg-slate-900/50 rounded-lg cursor-crosshair overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {/* Time markers */}
        <div className="absolute inset-0 flex items-end">
          {markers.map((time) => (
            <div
              key={time}
              className="absolute bottom-0 flex flex-col items-center"
              style={{ left: `${(time / duration) * 100}%` }}
            >
              <div className="w-px h-2 bg-slate-600" />
              {duration <= 30 && (
                <span className="text-[10px] text-slate-500 mt-0.5">{formatTime(time)}</span>
              )}
            </div>
          ))}
        </div>

        {/* Zoom segments */}
        {zoomSegments.map((segment) => (
          <div
            key={segment.id}
            className="absolute top-1 bottom-1 bg-violet-500/30 border border-violet-500/50 rounded"
            style={{
              left: `${(segment.startTime / duration) * 100}%`,
              width: `${((segment.endTime - segment.startTime) / duration) * 100}%`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] text-violet-300 font-medium">
                {segment.scale}x
              </span>
            </div>
          </div>
        ))}

        {/* Selection area */}
        {isDragging && selectionStart !== null && selectionEnd !== null && (
          <div
            className="absolute top-0 bottom-0 bg-fuchsia-500/20 border-l border-r border-fuchsia-500"
            style={{
              left: `${(Math.min(selectionStart, selectionEnd) / duration) * 100}%`,
              width: `${(Math.abs(selectionEnd - selectionStart) / duration) * 100}%`,
            }}
          />
        )}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg shadow-white/50 transition-all"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
        </div>
      </div>

      {/* Instructions */}
      <p className="text-[10px] text-slate-500 mt-2 text-center">
        Click and drag to create zoom effect
      </p>
    </div>
  )
}
