'use client'

import { LogOut, User } from 'lucide-react'

interface HeaderProps {
  user: { email: string; name: string }
  onLogout: () => void
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🍅</span>
            </div>
            <h1 className="text-xl font-bold text-text">Pomofocus Todo</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user.name}</span>
              <span className="text-gray-400">({user.email})</span>
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
