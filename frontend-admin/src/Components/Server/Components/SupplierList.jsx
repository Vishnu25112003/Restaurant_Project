"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  User2,
  Loader,
  Lock,
  X,
  AlertTriangle,
  LogOut,
  CheckCircle2,
  UserCheck,
  UserX,
  Shield,
  ArrowRight,
  Sparkles,
  Users,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in as supplier
  const currentSupplierName = localStorage.getItem("supplierName");
  const currentUserRole = localStorage.getItem("userRole");
  const isSupplierLoggedIn =
    currentUserRole === "supplier" && currentSupplierName;

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(
          "https://online-restaurant-management-system.onrender.com/api/vendors/suppliers"
        );
        console.log("Fetched suppliers:", response.data);
        setSuppliers(response.data);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
        setError("Unable to fetch suppliers");
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("userRole");
      localStorage.removeItem("supplierName");
      localStorage.removeItem("supplierId");
      localStorage.removeItem("newOrderCount");
      localStorage.removeItem("isAuthenticated");

      try {
        await axios.post(
          "https://online-restaurant-management-system.onrender.com/api/login/logout",
          {},
          {
            withCredentials: true,
          }
        );
      } catch (serverError) {
        console.warn(
          "Server logout failed, but continuing with client logout:",
          serverError
        );
      }

      navigate("/", { replace: true });
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      navigate("/", { replace: true });
      window.location.reload();
    }
  };

  const handleSupplierClick = (supplier) => {
    console.log("Selected supplier:", supplier);
    if (supplier.attendance === "Absent" || supplier.status === "Absent") {
      setSelectedSupplier(supplier);
      setShowWarning(true);
    } else {
      openLoginModal(supplier);
    }
  };

  const openLoginModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowLogin(true);
    setUsername("");
    setPassword("");
    setLoginError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      console.log("Attempting login with:", {
        supplierId: username,
        password: password,
      });

      const loginResponse = await axios.post(
        "https://online-restaurant-management-system.onrender.com/api/vendors/suppliers/login",
        {
          supplierId: username,
          password: password,
        }
      );

      console.log("Login response:", loginResponse.data);

      if (loginResponse.data.message === "Login successful") {
        localStorage.setItem("userRole", "supplier");
        localStorage.setItem("supplierName", loginResponse.data.vendor.name);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem(
          "supplierId",
          username.trim().replace(/\s+/g, "").replace(/:/g, "")
        );

        try {
          const orderResponse = await axios.get(
            `https://online-restaurant-management-system.onrender.com/api/ordernotifications/${username}`
          );
          console.log("Order response:", orderResponse.data);

          const orderCount = orderResponse.data.length;
          localStorage.setItem("newOrderCount", orderCount);
        } catch (orderError) {
          console.log("No orders found or error fetching orders:", orderError);
          localStorage.setItem("newOrderCount", "0");
        }

        setShowSuccessPopup(true);

        setTimeout(() => {
          navigate("/dashboard/orderdetails");
        }, 1500);
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        switch (err.response.status) {
          case 404:
            setLoginError("Supplier not found. Please check your Supplier ID.");
            break;
          case 401:
            setLoginError("Invalid Supplier ID or Password.");
            break;
          case 403:
            setLoginError("Supplier is currently absent and cannot login.");
            break;
          default:
            setLoginError(
              err.response.data.message || "Login failed. Please try again."
            );
        }
      } else {
        setLoginError(
          "Network error. Please check your connection and try again."
        );
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Separate suppliers by attendance status
  const presentSuppliers = suppliers.filter(
    (supplier) =>
      supplier.attendance === "Present" || supplier.status === "Present"
  );
  const absentSuppliers = suppliers.filter(
    (supplier) =>
      supplier.attendance === "Absent" || supplier.status === "Absent"
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Enhanced Header Section */}
      <div className="relative z-10">
        {/* Top Navigation Bar */}
        {isSupplierLoggedIn && (
          <div className="absolute top-0 left-0 right-0 z-40 p-6">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl shadow-lg backdrop-blur-sm border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <UserCheck size={16} />
                    </div>
                    <span className="font-semibold">
                      Welcome, {currentSupplierName}!
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm border border-white/20"
              >
                <LogOut size={18} />
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Main Header */}
        <div
          className={`max-w-6xl mx-auto px-6 ${
            isSupplierLoggedIn ? "pt-32 pb-16" : "py-16"
          }`}
        >
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Users className="text-white text-2xl" />
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                <Sparkles className="text-white text-2xl" />
              </div>
            </div>

            <h1 className="text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Our Valued Suppliers
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Connect with our trusted culinary partners and manage your orders
              with excellence
            </p>

            {/* Stats Cards */}
            <div className="flex justify-center gap-6 mt-12">
              <div className="bg-white/80 backdrop-blur-lg border border-white/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <UserCheck className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-600">
                      {presentSuppliers.length}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      Available
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-lg border border-white/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                    <UserX className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-600">
                      {absentSuppliers.length}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">Absent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin"></div>
                <div className="w-16 h-16 border-t-4 border-indigo-600 rounded-full animate-spin absolute top-0"></div>
              </div>
              <p className="text-xl font-semibold text-gray-700 animate-pulse">
                Loading suppliers...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-red-200">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <p className="text-xl font-semibold text-red-600">{error}</p>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-gray-400" size={32} />
              </div>
              <p className="text-xl text-gray-500">No suppliers found.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Present Suppliers Section */}
              {presentSuppliers.length > 0 && (
                <div className="animate-fadeIn">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg"></div>
                      <h2 className="text-3xl font-bold text-gray-800">
                        Available Suppliers
                      </h2>
                    </div>
                    <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full border border-green-200">
                      <span className="font-semibold">
                        {presentSuppliers.length} online
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {presentSuppliers.map((supplier, index) => (
                      <button
                        key={supplier._id || index}
                        onClick={() => handleSupplierClick(supplier)}
                        className="group relative w-full text-left bg-white/80 backdrop-blur-lg border border-white/50 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 overflow-hidden"
                      >
                        {/* Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Status Indicator */}
                        <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg animate-pulse"></div>

                        <div className="relative z-10 flex items-start gap-6">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <User2 className="text-white text-2xl" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-800 capitalize mb-2 group-hover:text-green-700 transition-colors">
                              {supplier.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                              <CheckCircle2
                                className="text-green-600"
                                size={16}
                              />
                              <span className="text-green-600 font-semibold text-sm">
                                Available Now
                              </span>
                            </div>
                            <div className="bg-gray-100 px-3 py-1 rounded-lg inline-block">
                              <p className="text-xs text-gray-600 font-mono">
                                ID: {supplier.supplierId}
                              </p>
                            </div>
                          </div>

                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ArrowRight className="text-green-600" size={20} />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Absent Suppliers Section */}
              {absentSuppliers.length > 0 && (
                <div className="animate-fadeIn">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-full shadow-lg"></div>
                      <h2 className="text-3xl font-bold text-gray-800">
                        Currently Absent
                      </h2>
                    </div>
                    <div className="px-4 py-2 bg-gradient-to-r from-red-100 to-rose-100 text-red-700 rounded-full border border-red-200">
                      <span className="font-semibold">
                        {absentSuppliers.length} offline
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {absentSuppliers.map((supplier, index) => (
                      <button
                        key={supplier._id || index}
                        onClick={() => handleSupplierClick(supplier)}
                        className="group relative w-full text-left bg-white/60 backdrop-blur-lg border border-white/30 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 opacity-75 hover:opacity-90 overflow-hidden"
                      >
                        {/* Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-rose-50/30"></div>

                        {/* Status Indicator */}
                        <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-red-500 to-rose-600 rounded-full shadow-lg"></div>

                        <div className="relative z-10 flex items-start gap-6">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                              <User2 className="text-white text-2xl" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-800 capitalize mb-2">
                              {supplier.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                              <Clock className="text-red-600" size={16} />
                              <span className="text-red-600 font-semibold text-sm">
                                Currently Away
                              </span>
                            </div>
                            <div className="bg-gray-100 px-3 py-1 rounded-lg inline-block">
                              <p className="text-xs text-gray-600 font-mono">
                                ID: {supplier.supplierId}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 px-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/50 relative animate-fadeInUp">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <X size={16} className="text-gray-600 hover:text-red-600" />
            </button>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-rose-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
                <LogOut className="text-white text-2xl" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Confirm Logout
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Are you sure you want to logout,{" "}
                <span className="font-bold text-indigo-600">
                  {currentSupplierName}
                </span>
                ?
                <br />
                <span className="text-sm text-gray-500">
                  You'll need to login again to access your dashboard.
                </span>
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    handleLogout();
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 px-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-red-200 relative animate-fadeInUp">
            <button
              onClick={() => setShowWarning(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <X size={16} className="text-gray-600 hover:text-red-600" />
            </button>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-rose-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl animate-pulse">
                <AlertTriangle className="text-white text-2xl" />
              </div>

              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Supplier Unavailable
              </h2>
              <p className="text-gray-700 mb-8 leading-relaxed">
                <span className="font-bold text-gray-800">
                  {selectedSupplier?.name}
                </span>{" "}
                is currently absent and not available for orders.
                <br />
                <span className="text-sm text-gray-500 mt-2 block">
                  Please check back later or choose from available suppliers.
                </span>
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setShowWarning(false)}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Understood
                </button>
                <button
                  onClick={() => {
                    setShowWarning(false);
                    document
                      .querySelector("h2")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-200"
                >
                  View Available Suppliers
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 px-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/50 relative animate-fadeInUp">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <X size={16} className="text-gray-600 hover:text-red-600" />
            </button>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
                <Shield className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome Back!
              </h2>
              <p className="text-gray-600">
                Login as{" "}
                <span className="font-bold text-indigo-600">
                  {selectedSupplier?.name}
                </span>
              </p>
            </div>

            {loginError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl mb-6 text-center flex items-center gap-2">
                <AlertTriangle size={16} />
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Supplier ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder={`Enter Supplier ID (e.g., ${selectedSupplier?.supplierId})`}
                    className="w-full px-4 py-4 pl-12 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-inner focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                  />
                  <User2
                    className="absolute left-4 top-4 text-gray-400"
                    size={20}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter Password"
                    className="w-full px-4 py-4 pl-12 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-inner focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                  />
                  <Lock
                    className="absolute left-4 top-4 text-gray-400"
                    size={20}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loginLoading ? (
                  <span className="flex justify-center items-center gap-2">
                    <Loader className="animate-spin" size={20} />
                    Logging in...
                  </span>
                ) : (
                  <span className="flex justify-center items-center gap-2">
                    <Shield size={20} />
                    Secure Login
                  </span>
                )}
              </button>
            </form>

            {selectedSupplier && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-500 font-semibold mb-2">
                  Supplier Information:
                </p>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedSupplier.name}
                  </p>
                  <p>
                    <span className="font-medium">ID:</span>{" "}
                    {selectedSupplier.supplierId}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    {selectedSupplier.attendance || selectedSupplier.status}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 px-4">
          <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-md text-center border border-green-200 animate-fadeInUp">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl animate-bounce">
              <CheckCircle2 className="text-white text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Login Successful!
            </h2>
            <p className="text-lg text-gray-700 mb-2">
              Welcome back,{" "}
              <span className="font-bold">{selectedSupplier?.name}</span>!
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to your dashboard...
            </p>

            <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full animate-pulse"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SupplierList;
