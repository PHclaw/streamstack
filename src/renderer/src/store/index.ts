import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ZoomSegment {
  id: string
  startTime: number
  endTime: number
  scale: number
  x: number
  y: number
}

export interface TTSItem {
  id: string
  text: string
  voice: string
  startTime: number
  endTime: number
  audioUrl?: string
}

export interface Project {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  videoPath?: string
  duration: number
  zoomSegments: ZoomSegment[]
  ttsItems: TTSItem[]
  annotations: Annotation[]
}

export interface Annotation {
  id: string
  type: 'text' | 'arrow' | 'highlight' | 'image'
  startTime: number
  endTime: number
  x: number
  y: number
  width?: number
  height?: number
  content?: string
  color: string
}

interface AppState {
  currentProject: Project | null
  projects: Project[]
  isRecording: boolean
  recordingSource: string | null
  
  // Actions
  createProject: (name: string) => Project
  setCurrentProject: (project: Project | null) => void
  updateProject: (updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  
  setRecording: (isRecording: boolean, source?: string | null) => void
  addZoomSegment: (segment: Omit<ZoomSegment, 'id'>) => void
  updateZoomSegment: (id: string, updates: Partial<ZoomSegment>) => void
  deleteZoomSegment: (id: string) => void
  
  addTTSItem: (item: Omit<TTSItem, 'id'>) => void
  updateTTSItem: (id: string, updates: Partial<TTSItem>) => void
  deleteTTSItem: (id: string) => void
  
  addAnnotation: (annotation: Omit<Annotation, 'id'>) => void
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void
  deleteAnnotation: (id: string) => void
}

const generateId = () => Math.random().toString(36).substring(2, 9)

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentProject: null,
      projects: [],
      isRecording: false,
      recordingSource: null,
      
      createProject: (name) => {
        const project: Project = {
          id: generateId(),
          name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          duration: 0,
          zoomSegments: [],
          ttsItems: [],
          annotations: []
        }
        set(state => ({
          projects: [...state.projects, project],
          currentProject: project
        }))
        return project
      },
      
      setCurrentProject: (project) => set({ currentProject: project }),
      
      updateProject: (updates) => set(state => {
        if (!state.currentProject) return state
        const updatedProject = {
          ...state.currentProject,
          ...updates,
          updatedAt: Date.now()
        }
        return {
          currentProject: updatedProject,
          projects: state.projects.map(p => 
            p.id === updatedProject.id ? updatedProject : p
          )
        }
      }),
      
      deleteProject: (id) => set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject
      })),
      
      setRecording: (isRecording, source = null) => set({ 
        isRecording, 
        recordingSource: source 
      }),
      
      addZoomSegment: (segment) => set(state => {
        if (!state.currentProject) return state
        const newSegment: ZoomSegment = { ...segment, id: generateId() }
        return {
          currentProject: {
            ...state.currentProject,
            zoomSegments: [...state.currentProject.zoomSegments, newSegment],
            updatedAt: Date.now()
          }
        }
      }),
      
      updateZoomSegment: (id, updates) => set(state => {
        if (!state.currentProject) return state
        return {
          currentProject: {
            ...state.currentProject,
            zoomSegments: state.currentProject.zoomSegments.map(s =>
              s.id === id ? { ...s, ...updates } : s
            ),
            updatedAt: Date.now()
          }
        }
      }),
      
      deleteZoomSegment: (id) => set(state => {
        if (!state.currentProject) return state
        return {
          currentProject: {
            ...state.currentProject,
            zoomSegments: state.currentProject.zoomSegments.filter(s => s.id !== id),
            updatedAt: Date.now()
          }
        }
      }),
      
      addTTSItem: (item) => set(state => {
        if (!state.currentProject) return state
        const newItem: TTSItem = { ...item, id: generateId() }
        return {
          currentProject: {
            ...state.currentProject,
            ttsItems: [...state.currentProject.ttsItems, newItem],
            updatedAt: Date.now()
          }
        }
      }),
      
      updateTTSItem: (id, updates) => set(state => {
        if (!state.currentProject) return state
        return {
          currentProject: {
            ...state.currentProject,
            ttsItems: state.currentProject.ttsItems.map(t =>
              t.id === id ? { ...t, ...updates } : t
            ),
            updatedAt: Date.now()
          }
        }
      }),
      
      deleteTTSItem: (id) => set(state => {
        if (!state.currentProject) return state
        return {
          currentProject: {
            ...state.currentProject,
            ttsItems: state.currentProject.ttsItems.filter(t => t.id !== id),
            updatedAt: Date.now()
          }
        }
      }),
      
      addAnnotation: (annotation) => set(state => {
        if (!state.currentProject) return state
        const newAnnotation: Annotation = { ...annotation, id: generateId() }
        return {
          currentProject: {
            ...state.currentProject,
            annotations: [...state.currentProject.annotations, newAnnotation],
            updatedAt: Date.now()
          }
        }
      }),
      
      updateAnnotation: (id, updates) => set(state => {
        if (!state.currentProject) return state
        return {
          currentProject: {
            ...state.currentProject,
            annotations: state.currentProject.annotations.map(a =>
              a.id === id ? { ...a, ...updates } : a
            ),
            updatedAt: Date.now()
          }
        }
      }),
      
      deleteAnnotation: (id) => set(state => {
        if (!state.currentProject) return state
        return {
          currentProject: {
            ...state.currentProject,
            annotations: state.currentProject.annotations.filter(a => a.id !== id),
            updatedAt: Date.now()
          }
        }
      })
    }),
    {
      name: 'streamstack-storage',
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject
      })
    }
  )
)
