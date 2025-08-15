
import { Routes, Route } from "react-router-dom";
import SupplierList from "../Server/Components/SupplierList"; 
import OrderDetails from "../Server/Components/OrderDetails"; // Adjust path as needed
// Import other supplier components as needed

export default function SupplierRoutes({ setIsAuthenticated }) {
  return (
    <Routes>
      <Route 
        path="/" 
        element={<SupplierList setIsAuthenticated={setIsAuthenticated} />} 
      />
      <Route 
        path="/suppliers" 
        element={<SupplierList setIsAuthenticated={setIsAuthenticated} />} 
      />
      {/* Add other supplier routes here */}
      <Route 
        path="/orderdetails" 
        element={<OrderDetails setIsAuthenticated={setIsAuthenticated} />} 
      />
      {/* Add more routes as needed */}
    </Routes>
  );
}