import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface HeaderProps {
  showHomeButton?: boolean
  showProfileButton?: boolean
  showLogoutButton?: boolean
  title?: string
}

const Header: React.FC<HeaderProps> = ({ 
  showHomeButton = true, 
  showProfileButton = true, 
  showLogoutButton = true,
  title = 'ThenaAir'
}) => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm w-full sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center space-x-2">
          <span 
            className="text-2xl font-bold text-blue-700 tracking-tight cursor-pointer hover:text-blue-800 transition-colors" 
            onClick={() => navigate('/home')}
          >
            {title}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {showHomeButton && (
            <button
              onClick={() => navigate('/home')}
              className="bg-white border border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors duration-200"
            >
              Home
            </button>
          )}
          
          {user && showProfileButton && (
            <button
              onClick={() => navigate('/profile')}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors duration-200"
            >
              Profile
            </button>
          )}
          
          {user && showLogoutButton && (
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors duration-200"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header 