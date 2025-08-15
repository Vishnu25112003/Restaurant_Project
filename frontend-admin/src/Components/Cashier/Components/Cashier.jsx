"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Clock,
  DollarSign,
  Utensils,
  RefreshCw,
  AlertTriangle,
  Search,
  X,
  Calendar,
  User,
  Hash,
  ChevronDown,
  ChevronUp,
  Eye,
  TrendingUp,
  Package,
  Receipt,
  LogOut,
  Filter,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL =
  "https://online-restaurant-management-system.onrender.com/orderdone/all";

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
};

// Enhanced OrderItem component
const OrderItem = ({ item, index }) => {
  const formatCurrency = (amount) => {
    return `₹${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  return (
    <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
          <Utensils size={16} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{item.foodName}</p>
          {item.specialInstructions && (
            <p className="text-xs text-orange-600 italic bg-orange-100 px-2 py-1 rounded-lg mt-1">
              Note: {item.specialInstructions}
            </p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg text-gray-900">
          {formatCurrency(item.totalPrice)}
        </p>
      </div>
    </div>
  );
};

// Enhanced CompletedOrderCard component
const CompletedOrderCard = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount) => {
    return `₹${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRefund = async (order) => {
    try {
      await loadRazorpayScript();
      const options = {
        key: "rzp_test_hWBnv8Q4dbKuGl",
        amount: Math.round(order.totalAmount * 100),
        currency: "INR",
        name: "Crave Corner",
        description: `Refund for Order #${order.orderId.slice(-6)} - Table ${
          order.tableNumber
        }`,
        image: "/logo.png",
        handler: (response) => {
          console.log("Refund success:", response.razorpay_payment_id);
          window.dispatchEvent(
            new CustomEvent("showNotification", {
              detail: {
                message: `Refund processed for Order #${order.orderId.slice(
                  -6
                )}`,
                type: "success",
              },
            })
          );
          handleRefundSuccess(order._id, response.razorpay_payment_id);
        },
        prefill: {
          name: order.supplierName,
          email: "",
          contact: "",
        },
        notes: {
          orderId: order.orderId,
          tableNumber: order.tableNumber,
          refund: true,
        },
        theme: {
          color: "#ff3131",
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent("showNotification", {
          detail: {
            message: "Failed to load payment gateway for refund.",
            type: "error",
          },
        })
      );
      console.error("Error initializing Razorpay for refund:", error);
    }
  };

  const handleRefundSuccess = async (orderId, paymentId) => {
    try {
      const response = await axios.post(
        `https://online-restaurant-management-system.onrender.com/api/refund`,
        {
          orderId,
          paymentId,
          refundAmount: order.totalAmount,
        }
      );
      if (response.data.success) {
        window.dispatchEvent(
          new CustomEvent("showNotification", {
            detail: {
              message: "Refund processed successfully!",
              type: "success",
            },
          })
        );
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      window.dispatchEvent(
        new CustomEvent("showNotification", {
          detail: {
            message: "Refund payment completed but failed to update records.",
            type: "warning",
          },
        })
      );
    }
  };

  return (
    <div className="group bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl">
              <Receipt size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black">
                #{order.orderId.slice(-6)}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Hash size={12} className="text-white" />
                </div>
                <p className="text-emerald-100 font-semibold">
                  Table {order.tableNumber}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black">
              {formatCurrency(order.totalAmount)}
            </p>
            <div className="flex items-center justify-end gap-1 mt-1">
              <DollarSign size={14} className="text-emerald-200" />
              <p className="text-emerald-200 text-sm font-medium">
                Total Revenue
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="p-6">
        {/* Order Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold">Supplier</p>
                <p className="font-bold text-gray-900">{order.supplierName}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Clock size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-purple-600 font-semibold">
                  Completed
                </p>
                <p className="font-bold text-gray-900">
                  {formatTime(order.completedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Items Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Package size={18} className="text-orange-600" />
              Order Items ({order.items.length})
            </h4>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition-colors font-semibold text-sm bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100"
            >
              <span>{isExpanded ? "Show Less" : "Show All"}</span>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          <div className="space-y-3">
            {isExpanded ? (
              order.items.map((item, index) => (
                <OrderItem key={item._id || index} item={item} index={index} />
              ))
            ) : (
              <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <Utensils size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {order.items[0].foodName}
                    </p>
                    {order.items.length > 1 && (
                      <p className="text-sm text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded-lg mt-1">
                        +{order.items.length - 1} more items
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">
                    {formatCurrency(order.items[0].totalPrice)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t-2 border-gray-100">
          <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
            <Calendar size={14} className="mr-2 text-gray-500" />
            <span className="font-medium">{formatDate(order.completedAt)}</span>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => handleRefund(order)}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <DollarSign size={16} />
              Refund
            </button>
            <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2">
              <Eye size={16} />
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Enhanced Cashier Component
const Cashier = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("completedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    show: false,
  });

  // Listen for global notifications
  useEffect(() => {
    const handleNotification = (event) => {
      const { message, type } = event.detail;
      setNotification({ message, type, show: true });
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 5000);
    };
    window.addEventListener("showNotification", handleNotification);
    return () =>
      window.removeEventListener("showNotification", handleNotification);
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");

    if (setIsAuthenticated) {
      setIsAuthenticated(false);
    }

    navigate("/", { replace: true });
  };

  // Fetch completed orders
  const fetchCompletedOrders = async (page = 1) => {
    try {
      setIsRefreshing(true);
      const response = await axios.get(API_URL, {
        params: {
          page,
          limit: 12,
          sortBy,
          sortOrder,
        },
      });
      if (response.data.success) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(response.data.pagination.currentPage);
        setError(null);
      } else {
        throw new Error(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching completed orders:", error);
      setError("Failed to load completed orders. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filter orders based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOrders(orders);
      return;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = orders.filter((order) => {
      return (
        order.orderId.toLowerCase().includes(lowerCaseQuery) ||
        order.tableNumber.toString().includes(lowerCaseQuery) ||
        order.supplierName.toLowerCase().includes(lowerCaseQuery) ||
        order.items.some((item) =>
          item.foodName.toLowerCase().includes(lowerCaseQuery)
        )
      );
    });
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  // Initial load and periodic refresh
  useEffect(() => {
    fetchCompletedOrders(currentPage);
  }, [sortBy, sortOrder, currentPage]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchCompletedOrders(currentPage);
    }, 30000);
    return () => clearInterval(intervalId);
  }, [currentPage, sortBy, sortOrder]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const totalAmount = filteredOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const formatCurrency = (amount) => {
    return `₹${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Enhanced Notification */}
      {notification.show && (
        <div
          className={`fixed top-6 right-6 px-6 py-4 rounded-2xl shadow-2xl z-50 animate-bounce flex items-center gap-3 ${
            notification.type === "success"
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              : notification.type === "error"
              ? "bg-gradient-to-r from-red-500 to-rose-600 text-white"
              : notification.type === "warning"
              ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white"
              : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
          }`}
        >
          <CheckCircle2 size={20} />
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Enhanced Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-xl shadow-2xl border-b border-white/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            {/* Header Content */}
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Receipt className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Completed Orders
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Manage and track all completed restaurant orders
                </p>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Hash size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600 font-semibold">
                      Total Orders
                    </p>
                    <p className="text-2xl font-black text-emerald-800">
                      {filteredOrders.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-semibold">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-black text-blue-800">
                      {formatCurrency(totalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Controls */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Enhanced Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders, tables, suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 backdrop-blur-sm shadow-inner transition-all duration-200 font-medium"
              />
              {searchQuery && (
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Enhanced Sort Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 backdrop-blur-sm font-medium"
                >
                  <option value="completedAt">Completion Time</option>
                  <option value="totalAmount">Total Amount</option>
                  <option value="tableNumber">Table Number</option>
                </select>
              </div>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 backdrop-blur-sm font-medium"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>

              {/* Enhanced Refresh Button */}
              <button
                onClick={() => fetchCompletedOrders(currentPage)}
                disabled={isRefreshing}
                className={`flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                  isRefreshing ? "opacity-70" : ""
                }`}
              >
                <RefreshCw
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-700 p-6 mb-8 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <AlertTriangle size={24} className="mr-3" />
              <p className="font-semibold text-lg">{error}</p>
            </div>
          </div>
        )}

        {/* Enhanced Loading State */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-96 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-indigo-200 rounded-full animate-spin"></div>
              <div className="w-20 h-20 border-t-4 border-indigo-600 rounded-full animate-spin absolute top-0"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              Loading Orders
            </h3>
            <p className="text-gray-500 animate-pulse">
              Please wait while we fetch your data...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-16 text-center">
            <div className="w-24 h-24 mx-auto mb-8 text-gray-300">
              <Receipt size={96} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {searchQuery
                ? "No Orders Match Your Search"
                : "No Completed Orders"}
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
              {searchQuery
                ? "Try a different search term or clear the search"
                : "Completed orders will appear here once available."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Enhanced Orders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
              {filteredOrders.map((order) => (
                <CompletedOrderCard key={order._id} order={order} />
              ))}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-3 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-6 py-3 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 font-semibold"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-3 border rounded-xl font-semibold transition-all duration-200 ${
                        currentPage === page
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600 shadow-lg"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 font-semibold"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Cashier;
