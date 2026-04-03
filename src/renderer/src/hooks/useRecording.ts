import { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

interface UseRecordingOptions {
  onStop?: (blob: Blob) => void
  onError?: (error: Error) => void
}

export function useRecording(options: UseRecordingOptions = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ]

  const getSupportedMimeType = useCallback(() => {
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    return 'video/webm'
  }, [])

  const startRecording = useCallback(async (sourceId: string) => {
    try {
      // Stop previous stream if exists
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      chunksRef.current = []

      // Get display media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId
          }
        } as any,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
            maxFrameRate: 30
          }
        } as any
      })

      streamRef.current = stream

      // Setup media recorder
      const mimeType = getSupportedMimeType()
      const mediaRecorder = new MediaRecorder(stream, { mimeType })

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        options.onStop?.(blob)
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      mediaRecorder.onerror = (e) => {
        const error = new Error('MediaRecorder error')
        options.onError?.(error)
        toast.error('Recording error occurred')
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // Collect data every second
      
      setIsRecording(true)
      setIsPaused(false)
      setRecordTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordTime(prev => prev + 1)
      }, 1000)

      toast.success('Recording started')
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast.error('Failed to start recording')
      options.onError?.(error as Error)
    }
  }, [options, getSupportedMimeType])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      toast.success('Recording stopped')
    }
  }, [isRecording])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      toast.info('Recording paused')
    }
  }, [isRecording])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      
      timerRef.current = setInterval(() => {
        setRecordTime(prev => prev + 1)
      }, 1000)
      
      toast.info('Recording resumed')
    }
  }, [isPaused])

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks()
      audioTracks.forEach(track => {
        track.enabled = isMuted
      })
      setIsMuted(!isMuted)
      toast.info(isMuted ? 'Microphone unmuted' : 'Microphone muted')
    }
  }, [isMuted])

  const saveRecording = useCallback(async (blob: Blob, filename: string) => {
    const buffer = await blob.arrayBuffer()
    const result = await window.streamstack?.saveVideo?.(buffer, filename)
    
    if (result?.success) {
      toast.success(`Saved to ${result.path}`)
      return result.path
    } else {
      toast.error('Failed to save recording')
      return null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }, [])

  return {
    isRecording,
    isPaused,
    recordTime,
    isMuted,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    toggleMute,
    saveRecording,
    formatTime,
  }
}
