'use client'

import { useState, useEffect } from 'react'
import { supabase, Task } from '@/lib/supabase'
import UserSetup from '@/components/UserSetup'
import Header from '@/components/Header'
import TaskForm from '@/components/TaskForm'
import TaskList from '@/components/TaskList'
import ChatbotTrigger from '@/components/ChatbotTrigger'
import ChatbotPopup from '@/components/ChatbotPopup'

interface User {
  email: string
  name: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('pomofocus-user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // Load tasks when user is set
  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [user])

  const loadTasks = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const handleUserSetup = (userData: User) => {
    setUser(userData)
    localStorage.setItem('pomofocus-user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    setTasks([])
    localStorage.removeItem('pomofocus-user')
  }

  const handleAddTask = async (taskData: { title: string; description: string; estimatedPomodoros: number }) => {
    if (!user) return

    setIsLoading(true)
    
    try {
      const newTask = {
        title: taskData.title,
        description: taskData.description,
        estimated_pomodoros: taskData.estimatedPomodoros,
        completed_pomodoros: 0,
        completed: false,
        user_email: user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single()

      if (error) throw error

      setTasks(prev => [data, ...prev])
    } catch (error) {
      console.error('Error adding task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
      ))
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTasks(prev => prev.filter(task => task.id !== id))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, completed, updated_at: new Date().toISOString() } : task
      ))
    } catch (error) {
      console.error('Error toggling task completion:', error)
    }
  }

  const handleTaskEnhancement = (enhancedTask: { title: string; description: string; estimatedPomodoros: number }) => {
    // This will be called when the AI suggests task enhancements
    console.log('Task enhancement suggested:', enhancedTask)
    // You can implement logic here to apply the enhancement
  }

  if (!user) {
    return <UserSetup onUserSetup={handleUserSetup} />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <TaskForm onSubmit={handleAddTask} isLoading={isLoading} />
        <TaskList
          tasks={tasks}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
        />
      </main>

      {/* Chatbot Components */}
      <ChatbotTrigger onClick={() => setIsChatbotOpen(true)} />
      <ChatbotPopup
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onTaskEnhancement={handleTaskEnhancement}
      />
    </div>
  )
}
