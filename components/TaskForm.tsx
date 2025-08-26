'use client'

import { useState } from 'react'
import { Plus, Clock } from 'lucide-react'

interface TaskFormProps {
  onSubmit: (task: { title: string; description: string; estimatedPomodoros: number }) => void
  isLoading?: boolean
}

export default function TaskForm({ onSubmit, isLoading = false }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      estimatedPomodoros
    })

    // Reset form
    setTitle('')
    setDescription('')
    setEstimatedPomodoros(1)
  }

  return (
    <div className="card mb-6">
      <h2 className="text-lg font-semibold text-text mb-4">Add a new task</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            What are you working on?
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="Enter task title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field resize-none"
            rows={3}
            placeholder="Add more details about your task..."
          />
        </div>

        <div>
          <label htmlFor="pomodoros" className="block text-sm font-medium text-gray-700 mb-1">
            <Clock className="inline w-4 h-4 mr-1" />
            Estimate Pomodoros
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="pomodoros"
              type="number"
              min="1"
              max="10"
              value={estimatedPomodoros}
              onChange={(e) => setEstimatedPomodoros(parseInt(e.target.value) || 1)}
              className="input-field w-20"
            />
            <span className="text-sm text-gray-600">
              pomodoro{estimatedPomodoros !== 1 ? 's' : ''} (25 min each)
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </form>
    </div>
  )
}
