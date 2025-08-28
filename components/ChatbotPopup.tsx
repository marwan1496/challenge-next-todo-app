'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

interface ChatbotPopupProps {
  isOpen: boolean
  onClose: () => void
  onTaskEnhancement: (enhancedTask: { title: string; description: string; estimatedPomodoros: number }) => void
  userEmail?: string
}

export default function ChatbotPopup({ isOpen, onClose, onTaskEnhancement, userEmail }: ChatbotPopupProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm your AI productivity assistant. I can help enhance tasks or add new ones. Say 'add todo' to create a task, and I'll ask for the title and description.",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [flowStep, setFlowStep] = useState<null | 'confirm' | 'title' | 'description'>(null)
  const [tempTitle, setTempTitle] = useState('')
  const [tempDescription, setTempDescription] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // N8N webhook no longer used for creation; N8N can still listen to Supabase inserts

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const pushBot = (text: string) => {
    const botMessage: Message = {
      id: (Date.now() + Math.random()).toString(),
      type: 'bot',
      content: text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, botMessage])
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const text = inputValue.trim()
    setInputValue('')

    // Add-todo guided flow
    if (!flowStep && /\b(add\s*(todo|task))\b/i.test(text)) {
      setFlowStep('confirm')
      pushBot("Great! Do you want to add a new todo now? (yes/no)")
      return
    }

    if (flowStep === 'confirm') {
      if (/^(y|yes|sure|ok|okay)$/i.test(text)) {
        setFlowStep('title')
        pushBot('Awesome. What is the task title?')
      } else if (/^(n|no|not now)$/i.test(text)) {
        setFlowStep(null)
        pushBot('No problem. Say "add todo" anytime to create a task.')
      } else {
        pushBot('Please answer yes or no. Do you want to add a new todo now?')
      }
      return
    }

    if (flowStep === 'title') {
      if (text.length < 2) {
        pushBot('Please provide a concise, action-oriented title.')
        return
      }
      setTempTitle(text)
      setFlowStep('description')
      pushBot('Got it. Add an optional description (or type "skip").')
      return
    }

    if (flowStep === 'description') {
      const description = /^(skip|none|no)$/i.test(text) ? '' : text
      setTempDescription(description)

      if (!userEmail) {
        pushBot('User email not available. Please make sure you are signed in.')
        setFlowStep(null)
        return
      }

      try {
        setIsLoading(true)
        const now = new Date().toISOString()
        const { error } = await supabase
          .from('tasks')
          .insert([{
            title: tempTitle,
            description,
            estimated_pomodoros: 1,
            completed_pomodoros: 0,
            completed: false,
            user_email: userEmail,
            created_at: now,
            updated_at: now
          }])
        if (error) throw error
        pushBot('Your todo has been added. I will enhance it shortly.')
      } catch (e) {
        console.error(e)
        pushBot('Sorry, I could not create the todo. Please try again.')
      } finally {
        setIsLoading(false)
        setFlowStep(null)
        setTempTitle('')
        setTempDescription('')
      }
      return
    }

    // Default: send to chat API
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])

      // If the AI suggests a task enhancement, offer to apply it
      if (data.suggestedTask) {
        const enhancementMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'bot',
          content: `I've enhanced your task! Would you like me to apply these improvements? Click "Apply Enhancement" to use the improved version.`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, enhancementMessage])
      }

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Productivity Assistant</h3>
              <p className="text-sm text-gray-500">Powered by OpenAI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.type === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your task or ask for help..."
              className="flex-1 input-field"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Try: "Help me break down 'Complete project proposal' into smaller tasks"
          </p>
        </div>
      </div>
    </div>
  )
}
