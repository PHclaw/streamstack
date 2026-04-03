import { useState } from 'react'
import { useStore } from '../store'
import { toast } from 'sonner'

export default function ProjectList() {
  const { projects, currentProject, setCurrentProject, deleteProject, createProject } = useStore()
  const [newProjectName, setNewProjectName] = useState('')
  const [showNewProject, setShowNewProject] = useState(false)

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name')
      return
    }
    createProject(newProjectName.trim())
    setNewProjectName('')
    setShowNewProject(false)
    toast.success('Project created')
  }

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id)
      toast.success('Project deleted')
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-800/30">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <h2 className="text-lg font-medium text-white">Projects</h2>
        <button
          onClick={() => setShowNewProject(true)}
          className="p-2 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* New project input */}
      {showNewProject && (
        <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project name"
            className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-violet-500 focus:outline-none text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateProject()
              if (e.key === 'Escape') setShowNewProject(false)
            }}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCreateProject}
              className="flex-1 py-1.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-500 transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewProject(false)}
              className="flex-1 py-1.5 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Project list */}
      <div className="flex-1 overflow-auto">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-slate-400 mb-1">No projects yet</p>
            <p className="text-xs text-slate-500">Create your first recording project</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setCurrentProject(project)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                  currentProject?.id === project.id
                    ? 'bg-violet-500/20 border border-violet-500/30 text-white'
                    : 'hover:bg-slate-700/50 text-slate-300'
                }`}
              >
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{project.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{project.duration}s</span>
                  <button
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
