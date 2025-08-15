"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./Components/Login"
import CashierRoutes from "./Components/Routes/CashierRoutes"
import AdminRoutes from "./Components/Routes/AdminRoutes"
import FoodRoutes from "./Components/Routes/FoodRoutes"
import SupplierRoutes from "./Components/Routes/SupplierRoutes"

function DashboardRouter({ setIsAuthenticated }) {
  const role = localStorage.getItem("userRole")

  if (role === "cashier") return <CashierRoutes setIsAuthenticated={setIsAuthenticated} />
  if (role === "admin") return <AdminRoutes setIsAuthenticated={setIsAuthenticated} />
  if (role === "foodincharge") return <FoodRoutes setIsAuthenticated={setIsAuthenticated} />
  if (role === "supplier") return <SupplierRoutes setIsAuthenticated={setIsAuthenticated} />
  return <Navigate to="/" replace />
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const storedAuth = localStorage.getItem("isAuthenticated")
      const userRole = localStorage.getItem("userRole")

      if (storedAuth === "true" && userRole) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        // Clear any remaining localStorage items if authentication is invalid
        localStorage.removeItem("isAuthenticated")
        localStorage.removeItem("userRole")
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        <Route
          path="/dashboard/*"
          element={
            isAuthenticated ? <DashboardRouter setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" replace />
          }
        />
        {/* Catch all other routes and redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
