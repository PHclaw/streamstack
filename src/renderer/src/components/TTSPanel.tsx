import { useState } from 'react'
import { toast } from 'sonner'
import { useStore } from '../store'

const BACKEND_URL = 'http://localhost:8000'

const VOICES = [
  { id: 'default', name: 'Default', lang: 'en' },
  { id: 'male_1', name: 'Male Professional', lang: 'en' },
  { id: 'female_1', name: 'Female Professional', lang: 'en' },
  { id: 'zh_1', name: 'Chinese Male', lang: 'zh' },
  { id: 'zh_2', name: 'Chinese Female', lang: 'zh' },
]

export default function TTSPanel() {
  const { currentProject, addTTSItem, deleteTTSItem } = useStore()
  const [text, setText] = useState('')
  const [voice, setVoice] = useState('default')
  const [generating, setGenerating] = useState(false)
  const [scriptGenerating, setScriptGenerating] = useState(false)
  const [scriptPrompt, setScriptPrompt] = useState('')

  const generateScript = async () => {
    if (!scriptPrompt.trim()) {
      toast.error('Please describe what your video shows')
      return
    }

    setScriptGenerating(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/script/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screen_description: scriptPrompt,
          tone: 'professional',
          duration_seconds: 60,
          language: 'en'
        })
      })

      const data = await res.json()
      if (data.success) {
        setText(data.data.script)
        toast.success('Script generated!')
      } else {
        toast.error('Failed to generate script')
      }
    } catch (error) {
      console.error('Script generation failed:', error)
      toast.error('Backend not available. Make sure to run: npm run backend:dev')
    } finally {
      setScriptGenerating(false)
    }
  }

  const generateTTS = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text')
      return
    }

    setGenerating(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/tts/vibevoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice,
          language: 'en',
          speed: 1.0
        })
      })

      if (res.ok) {
        const blob = await res.blob()
        const audioUrl = URL.createObjectURL(blob)
        
        // Add TTS item to project
        addTTSItem({
          text,
          voice,
          startTime: 0,
          endTime: text.length / 15, // Rough estimate
          audioUrl
        })

        toast.success('Voice generated!')
      } else {
        toast.error('TTS generation failed')
      }
    } catch (error) {
      console.error('TTS failed:', error)
      toast.error('Backend not available. Run: npm run backend:dev')
    } finally {
      setGenerating(false)
    }
  }

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400">No project selected</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">AI Voice</h1>
        <p className="text-slate-400">Generate voiceover with VibeVoice TTS</p>
      </div>

      {/* AI Script Generator */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
        <h2 className="text-lg font-medium text-white mb-4">AI Script Generator</h2>
        <textarea
          value={scriptPrompt}
          onChange={(e) => setScriptPrompt(e.target.value)}
          placeholder="Describe what's shown in your video (e.g., 'A walkthrough of the StreamStack interface showing the recording controls and timeline editor')"
          className="w-full h-24 px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-violet-500 focus:outline-none resize-none"
        />
        <button
          onClick={generateScript}
          disabled={scriptGenerating}
          className="mt-3 px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {scriptGenerating ? 'Generating...' : 'Generate Script'}
        </button>
      </div>

      {/* TTS Controls */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
        <h2 className="text-lg font-medium text-white mb-4">Text to Speech</h2>
        
        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-2">Voice</label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-violet-500 focus:outline-none"
          >
            {VOICES.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-2">Script</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your voiceover script here..."
            className="w-full h-40 px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-violet-500 focus:outline-none resize-none"
          />
        </div>

        <button
          onClick={generateTTS}
          disabled={generating || !text.trim()}
          className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Generate Voice'}
        </button>
      </div>

      {/* Generated Voices List */}
      {currentProject.ttsItems.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-lg font-medium text-white mb-4">Generated Voices</h2>
          <div className="space-y-3">
            {currentProject.ttsItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm text-white truncate">{item.text}</p>
                  <p className="text-xs text-slate-400 mt-1">Voice: {item.voice}</p>
                </div>
                {item.audioUrl && (
                  <audio controls src={item.audioUrl} className="h-8 ml-4" />
                )}
                <button
                  onClick={() => deleteTTSItem(item.id)}
                  className="ml-4 text-slate-400 hover:text-red-400 transition-colors"
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
