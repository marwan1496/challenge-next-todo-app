'use client'

import { MessageCircle } from 'lucide-react'

interface ChatbotTriggerProps {
  onClick: () => void
}

export default function ChatbotTrigger({ onClick }: ChatbotTriggerProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center group"
      title="Open AI Assistant"
    >
      <MessageCircle className="w-6 h-6" />
      
      {/* Pulse animation */}
      <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20"></div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        AI Productivity Assistant
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </button>
  )
}
