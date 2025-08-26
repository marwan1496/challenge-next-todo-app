'use client'

import { useState } from 'react'
import { Task } from '@/lib/supabase'
import { Edit, Trash2, Check, Clock, X } from 'lucide-react'

interface TaskItemProps {
  task: Task
  onUpdate: (id: string, updates: Partial<Task>) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string, completed: boolean) => void
}

export default function TaskItem({ task, onUpdate, onDelete, onToggleComplete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || '')
  const [editEstimatedPomodoros, setEditEstimatedPomodoros] = useState(task.estimated_pomodoros)

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        estimated_pomodoros: editEstimatedPomodoros
      })
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditTitle(task.title)
    setEditDescription(task.description || '')
    setEditEstimatedPomodoros(task.estimated_pomodoros)
    setIsEditing(false)
  }

  const handleToggleComplete = () => {
    onToggleComplete(task.id, !task.completed)
  }

  if (isEditing) {
    return (
      <div className="card mb-3 border-2 border-primary">
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="input-field font-medium"
            placeholder="Task title"
          />
          
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="input-field resize-none"
            rows={2}
            placeholder="Task description (optional)"
          />
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <input
              type="number"
              min="1"
              max="10"
              value={editEstimatedPomodoros}
              onChange={(e) => setEditEstimatedPomodoros(parseInt(e.target.value) || 1)}
              className="input-field w-20"
            />
            <span className="text-sm text-gray-600">
              pomodoro{editEstimatedPomodoros !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="btn-primary flex-1"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`card mb-3 transition-all duration-200 ${
      task.completed ? 'opacity-75 bg-gray-50' : ''
    }`}>
      <div className="flex items-start space-x-3">
        <button
          onClick={handleToggleComplete}
          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-primary border-primary'
              : 'border-gray-300 hover:border-primary'
          }`}
        >
          {task.completed && <Check className="w-3 h-3 text-white" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-text ${
            task.completed ? 'line-through text-gray-500' : ''
          }`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className={`text-sm mt-1 ${
              task.completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>
                {task.completed_pomodoros}/{task.estimated_pomodoros} pomodoros
              </span>
            </div>
            
            <span>
              {task.estimated_pomodoros * 25} min
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-500 hover:text-primary transition-colors"
            title="Edit task"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
