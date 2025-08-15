"use client"

import { useState } from "react"
import Sidebar from "../Admin/Components/Sidebar"
import Navbar from "../Admin/Components/Navbar"
import Dashboard from "../Admin/pages/Dashboard"
import Orders from "../Admin/pages/Orders"
import Menu from "../Admin/pages/Menu"
import Suppliers from "../Admin/pages/Suppliers"
import Support from "../Admin/pages/Supports"
import Registration from "../Admin/pages/Registration"
import Settings from "../Admin/pages/Settings"

const AdminLayout = ({ setIsAuthenticated }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  // Sample suppliers data - shared between components
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: "Fresh Vegetables Co.", contact: "+1 234-567-8901", status: "present" },
    { id: 2, name: "Meat Masters Ltd.", contact: "+1 234-567-8902", status: "absent" },
    { id: 3, name: "Dairy Delights", contact: "+1 234-567-8903", status: "present" },
    { id: 4, name: "Spice World", contact: "+1 234-567-8904", status: "present" },
    { id: 5, name: "Bakery Basics", contact: "+1 234-567-8905", status: "absent" },
  ])

  const toggleSupplierStatus = (id) => {
    setSuppliers(
      suppliers.map((supplier) =>
        supplier.id === id ? { ...supplier, status: supplier.status === "present" ? "absent" : "present" } : supplier,
      ),
    )
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "orders":
        return <Orders />
      case "menu":
        return <Menu />
      case "suppliers":
        return <Suppliers suppliers={suppliers} toggleSupplierStatus={toggleSupplierStatus} />
      case "support":
        return <Support />
      case "registration":
        return <Registration />
      case "settings":
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          profileDropdownOpen={profileDropdownOpen}
          setProfileDropdownOpen={setProfileDropdownOpen}
          setCurrentPage={setCurrentPage}
          setIsAuthenticated={setIsAuthenticated}
        />

        <main className="flex-1 overflow-auto p-6">{renderCurrentPage()}</main>
      </div>
    </div>
  )
}

export default function AdminRoutes({ setIsAuthenticated }) {
  return <AdminLayout setIsAuthenticated={setIsAuthenticated} />
}
