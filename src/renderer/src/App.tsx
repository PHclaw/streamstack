import { useState, useCallback } from 'react'
import { Toaster } from 'sonner'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import Recorder from './components/Recorder'
import Editor from './components/Editor'
import TTSPanel from './components/TTSPanel'
import ExportPanel from './components/ExportPanel'
import { useStore } from './store'

type Tab = 'record' | 'edit' | 'tts' | 'export'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('record')
  const { currentProject } = useStore()

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'record':
        return <Recorder />
      case 'edit':
        return <Editor />
      case 'tts':
        return <TTSPanel />
      case 'export':
        return <ExportPanel />
      default:
        return <Recorder />
    }
  }, [activeTab])

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <TitleBar />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 overflow-hidden">
          {currentProject ? (
            renderContent()
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">Welcome to StreamStack</h2>
                <p className="text-slate-400 mb-6">AI-powered screen recording & voiceover studio</p>
                <button 
                  onClick={() => setActiveTab('record')}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 shadow-lg shadow-violet-500/25"
                >
                  Start Recording
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      
      <Toaster position="bottom-right" theme="dark" />
    </div>
  )
}
