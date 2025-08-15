import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "../../Components/FoodIncharge/Components/HomePage";
import BookingPage from "../../Components/FoodIncharge/Components/BookingPage";
import FoodManager from "../../Components/FoodIncharge/Components/Foodadder";
import Support from "../../Components/FoodIncharge/Components/Support";
import Navbar from "../../Components/FoodIncharge/Components/Navbar";
import Footer from "../../Components/FoodIncharge/Components/Footer";
import SupplierPage from "../../Components/FoodIncharge/Components/SupplierPage";

export default function FoodRoutes({ setIsAuthenticated }) {
  const location = useLocation();

  return (
    <>
      {/* Common Navbar - Pass setIsAuthenticated prop */}
      <Navbar setIsAuthenticated={setIsAuthenticated} />

      <Routes>
        {/* Default route after login: HomePage + Support together */}
        <Route
          path="/"
          element={
            <>
              <HomePage />
              <Support />
            </>
          }
        />
        <Route
          path="/home"
          element={
            <>
              <HomePage /> 
              <Support />
            </>
          }
        />
        <Route path="/menu" element={<FoodManager />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route
          path="/supplier"
          element={
            <>
              <SupplierPage /> 
            </>
          }
        />
        <Route path="/support" element={<Support />} />
      </Routes>
      <Footer />
    </>
  );
}