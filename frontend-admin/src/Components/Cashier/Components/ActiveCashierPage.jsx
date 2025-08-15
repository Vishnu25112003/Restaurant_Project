"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Utensils,
  RefreshCw,
  AlertTriangle,
  Search,
  X,
  DollarSign,
  Table,
  CreditCard,
  Clock,
  Receipt,
  TrendingUp,
  CheckCircle2,
  LogOut,
  Sparkles,
  ArrowRight,
  Package,
  Users,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL_ACTIVE_ORDERS =
  "https://online-restaurant-management-system.onrender.com/api/orders/my-orders";
const API_URL_MARK_PAID =
  "https://online-restaurant-management-system.onrender.com/api/orders/mark-paid";

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

// Global notification function
const showNotification = (message, type = "info") => {
  const event = new CustomEvent("showNotification", {
    detail: { message, type },
  });
  window.dispatchEvent(event);
};

// Enhanced OrderItem component - Fixed for single item display
const OrderItem = ({ item }) => {
  const formatCurrency = (amount) => {
    return `₹${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  return (
    <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
          <Utensils size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {item.foodName}
          </p>
          {item.specialInstructions && (
            <p className="text-xs text-orange-600 italic bg-orange-100 px-2 py-1 rounded-lg mt-1 truncate">
              Note: {item.specialInstructions}
            </p>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-2">
        <p className="font-bold text-lg text-gray-900">
          {formatCurrency(item.totalPrice)}
        </p>
      </div>
    </div>
  );
};

// New TableCard component with improved layout
const TableCard = ({ tableNumber, tableData, onMarkPaid }) => {
  const [showAllItems, setShowAllItems] = useState(false);

  const formatCurrency = (amount) => {
    return `₹${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const orders = tableData.orders;
  const totalAmount = tableData.totalAmount;
  const hasMoreItems = orders.length > 1;

  return (
    <div className="group bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
      {/* Enhanced Table Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl">
              <Table size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Table {tableNumber}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Package size={14} className="text-emerald-200" />
                <p className="text-emerald-200 font-semibold">
                  {orders.length} {orders.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black">{formatCurrency(totalAmount)}</p>
            <div className="flex items-center justify-end gap-1 mt-1">
              <DollarSign size={14} className="text-emerald-200" />
              <p className="text-emerald-200 text-sm font-medium">Total Due</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content with Fixed Layout */}
      <div className="p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Utensils size={18} className="text-orange-600" />
          Order Details
        </h4>

        {/* Fixed height container for items */}
        <div className="mb-6">
          {/* Always show first item */}
          <div className="mb-3">
            <OrderItem item={orders[0]} />
          </div>

          {/* Show more items if expanded */}
          {showAllItems && orders.length > 1 && (
            <div className="space-y-3 mb-3">
              {orders.slice(1).map((order, index) => (
                <OrderItem key={`${order._id}-${index}`} item={order} />
              ))}
            </div>
          )}

          {/* Show More/Less Button */}
          {hasMoreItems && (
            <button
              onClick={() => setShowAllItems(!showAllItems)}
              className="w-full mt-3 py-2 px-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl border border-gray-200 flex items-center justify-center gap-2 transition-all duration-200 text-gray-700 font-medium"
            >
              {showAllItems ? (
                <>
                  <ChevronUp size={16} />
                  Show Less
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Show {orders.length - 1} More{" "}
                  {orders.length - 1 === 1 ? "Item" : "Items"}
                </>
              )}
            </button>
          )}
        </div>

        {/* Enhanced Total Section - Fixed position */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-2xl border border-gray-100 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <DollarSign size={16} className="text-white" />
              </div>
              <span className="font-bold text-gray-700">Grand Total:</span>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>

        {/* Enhanced Payment Button - Fixed position */}
        <button
          onClick={() => onMarkPaid(tableNumber, totalAmount)}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-6 py-4 rounded-2xl flex items-center justify-center space-x-3 font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          <CreditCard size={20} />
          <span>Process Payment</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

// Main Enhanced ActiveCashierPage component
const ActiveCashierPage = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const [activeOrders, setActiveOrders] = useState([]);
  const [groupedOrders, setGroupedOrders] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Fetch active orders
  const fetchActiveOrders = async () => {
    try {
      setIsRefreshing(true);
      const response = await axios.get(API_URL_ACTIVE_ORDERS);
      if (response.data) {
        setActiveOrders(response.data);
        setError(null);
      } else {
        throw new Error("Failed to fetch active orders");
      }
    } catch (error) {
      console.error("Error fetching active orders:", error);
      setError("Failed to load active orders. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Group orders by table number
  useEffect(() => {
    const grouped = activeOrders.reduce((acc, order) => {
      const tableNum = order.tableNumber;
      if (!acc[tableNum]) {
        acc[tableNum] = {
          orders: [],
          totalAmount: 0,
        };
      }
      acc[tableNum].orders.push(order);
      acc[tableNum].totalAmount += order.totalPrice;
      return acc;
    }, {});

    // Filter grouped orders based on search query
    if (searchQuery.trim() !== "") {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filteredGrouped = {};
      for (const tableNum in grouped) {
        if (
          tableNum.toString().includes(lowerCaseQuery) ||
          grouped[tableNum].orders.some((order) =>
            order.foodName.toLowerCase().includes(lowerCaseQuery)
          )
        ) {
          filteredGrouped[tableNum] = grouped[tableNum];
        }
      }
      setGroupedOrders(filteredGrouped);
    } else {
      setGroupedOrders(grouped);
    }
  }, [activeOrders, searchQuery]);

  // Initial load and periodic refresh
  useEffect(() => {
    fetchActiveOrders();
    const intervalId = setInterval(fetchActiveOrders, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const formatCurrency = (amount) => {
    return `₹${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const handleMarkPaid = async (tableNumber, totalAmount) => {
    try {
      await loadRazorpayScript();
      const options = {
        key: "rzp_test_hWBnv8Q4dbKuGl",
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        name: "Crave Corner",
        description: `Payment for Table ${tableNumber}`,
        image: "/logo.png",
        handler: async (response) => {
          console.log("Payment success:", response.razorpay_payment_id);
          showNotification(
            `Payment successful for Table ${tableNumber}! 🎉`,
            "success"
          );
          try {
            const backendResponse = await axios.post(
              `${API_URL_MARK_PAID}/${tableNumber}`
            );
            if (backendResponse.data.message) {
              showNotification(backendResponse.data.message, "success");
              fetchActiveOrders();
            }
          } catch (backendError) {
            console.error(
              "Error marking orders as paid on backend:",
              backendError
            );
            showNotification(
              "Payment successful, but failed to update backend records.",
              "warning"
            );
          }
        },
        prefill: {
          name: "Cashier",
          email: "cashier@cravecorner.com",
          contact: "9999999999",
        },
        notes: {
          tableNumber: tableNumber,
        },
        theme: {
          color: "#10B981",
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      showNotification("Failed to load payment gateway.", "error");
      console.error("Error initializing Razorpay:", error);
    }
  };

  const sortedTableNumbers = Object.keys(groupedOrders).sort(
    (a, b) => Number.parseInt(a) - Number.parseInt(b)
  );
  const totalPendingAmount = Object.values(groupedOrders).reduce(
    (sum, table) => sum + table.totalAmount,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

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
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Receipt className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Active Orders
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Process payments and manage ongoing orders
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500 font-medium">
                    Live updates every 30 seconds
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Table size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600 font-semibold">
                      Active Tables
                    </p>
                    <p className="text-2xl font-black text-emerald-800">
                      {sortedTableNumbers.length}
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
                      Total Pending
                    </p>
                    <p className="text-2xl font-black text-blue-800">
                      {formatCurrency(totalPendingAmount)}
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
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Enhanced Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by table number or food item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm shadow-inner transition-all duration-200 font-medium"
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

            {/* Enhanced Refresh Button */}
            <button
              onClick={fetchActiveOrders}
              disabled={isRefreshing}
              className={`flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                isRefreshing ? "opacity-70" : ""
              }`}
            >
              <RefreshCw
                size={18}
                className={isRefreshing ? "animate-spin" : ""}
              />
              <span>Refresh Orders</span>
            </button>
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
              <div className="w-20 h-20 border-4 border-emerald-200 rounded-full animate-spin"></div>
              <div className="w-20 h-20 border-t-4 border-emerald-600 rounded-full animate-spin absolute top-0"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              Loading Active Orders
            </h3>
            <p className="text-gray-500 animate-pulse">
              Please wait while we fetch the latest data...
            </p>
          </div>
        ) : sortedTableNumbers.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-16 text-center">
            <div className="w-24 h-24 mx-auto mb-8 text-gray-300">
              <Receipt size={96} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {searchQuery ? "No Orders Match Your Search" : "No Active Orders"}
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
              {searchQuery
                ? "Try a different search term or clear the search to see all active orders"
                : "Active orders will appear here when customers place their orders"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Enhanced Orders Grid with Fixed Card Heights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
              {sortedTableNumbers.map((tableNumber) => (
                <TableCard
                  key={tableNumber}
                  tableNumber={tableNumber}
                  tableData={groupedOrders[tableNumber]}
                  onMarkPaid={handleMarkPaid}
                />
              ))}
            </div>

            {/* Enhanced Summary Section */}
            {sortedTableNumbers.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-3">
                    <Sparkles className="text-yellow-500" />
                    Order Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Users size={20} className="text-blue-600" />
                        <span className="font-semibold text-blue-600">
                          Active Tables
                        </span>
                      </div>
                      <p className="text-3xl font-black text-blue-800">
                        {sortedTableNumbers.length}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-200">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Package size={20} className="text-orange-600" />
                        <span className="font-semibold text-orange-600">
                          Total Items
                        </span>
                      </div>
                      <p className="text-3xl font-black text-orange-800">
                        {Object.values(groupedOrders).reduce(
                          (sum, table) => sum + table.orders.length,
                          0
                        )}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <DollarSign size={20} className="text-green-600" />
                        <span className="font-semibold text-green-600">
                          Total Revenue
                        </span>
                      </div>
                      <p className="text-3xl font-black text-green-800">
                        {formatCurrency(totalPendingAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActiveCashierPage;
