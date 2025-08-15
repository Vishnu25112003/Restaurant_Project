"use client"

import { Menu, X, Home, ShoppingCart, UtensilsCrossed, Truck, HelpCircle, UserPlus, Settings } from "lucide-react"

const Sidebar = ({ sidebarOpen, setSidebarOpen, currentPage, setCurrentPage }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "menu", label: "Menu", icon: UtensilsCrossed },
    { id: "suppliers", label: "Suppliers", icon: Truck },
    { id: "support", label: "Support", icon: HelpCircle },
    { id: "registration", label: "Registration", icon: UserPlus },
  ]

  return (
    <div
      className={`${sidebarOpen ? "w-64" : "w-16"} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold text-white">Restaurant Admin</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Settings at bottom */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => setCurrentPage("settings")}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
            currentPage === "settings" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          <Settings className="h-5 w-5" />
          {sidebarOpen && <span>Settings</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
