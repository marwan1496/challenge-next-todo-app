'use client'

import { Task } from '@/lib/supabase'
import TaskItem from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  onUpdate: (id: string, updates: Partial<Task>) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string, completed: boolean) => void
}

export default function TaskList({ tasks, onUpdate, onDelete, onToggleComplete }: TaskListProps) {
  const activeTasks = tasks.filter(task => !task.completed)
  const completedTasks = tasks.filter(task => task.completed)

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
        <p className="text-gray-500">
          Add your first task above to get started with your productivity journey!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text mb-4">
            Today's Tasks ({activeTasks.length})
          </h2>
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-600 mb-4">
            Completed ({completedTasks.length})
          </h2>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
