"use client"

import { useState } from "react"
import { Routes, Route } from "react-router-dom"

import ActiveCashierPage from "../Cashier/Components/ActiveCashierPage"
import Cashier from "../Cashier/Components/Cashier"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Example state

  return (
    <Routes>
      {/* Example routes */}
      <Route path="/" element={<ActiveCashierPage setIsAuthenticated={setIsAuthenticated} />} />
      <Route path="/completed-orders" element={<Cashier setIsAuthenticated={setIsAuthenticated} />} />
      {/* Add other routes as needed */}
    </Routes>
  )
}

export default App
