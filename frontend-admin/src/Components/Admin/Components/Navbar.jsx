"use client"

import { Bell, User, ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"

const Navbar = ({ profileDropdownOpen, setProfileDropdownOpen, setCurrentPage, setIsAuthenticated }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userRole")

    // Update authentication state
    if (setIsAuthenticated) {
      setIsAuthenticated(false)
    }

    // Close dropdown
    setProfileDropdownOpen(false)

    // Navigate to login page
    navigate("/")
  }

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">Welcome, Admin 👋</h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
            >
              <User className="h-5 w-5" />
              <ChevronDown className="h-4 w-4" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setCurrentPage("settings")
                      setProfileDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage("profile")
                      setProfileDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Profile
                  </button>
                  <hr className="border-gray-700 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
