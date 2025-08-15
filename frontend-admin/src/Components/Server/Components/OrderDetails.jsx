"use client";
import { useEffect, useState } from "react";
import {
  FaBell,
  FaClock,
  FaRegCalendarAlt,
  FaUserCircle,
  FaHistory,
  FaCheck,
  FaTimes,
  FaCheckCircle,
  FaEye,
  FaShoppingCart,
  FaTrophy,
  FaChartLine,
  FaStar,
  FaRocket,
  FaHeart,
} from "react-icons/fa";
import axios from "axios";

const OrderDetails = () => {
  const [supplierName, setSupplierName] = useState("Supplier");
  const [supplierId, setSupplierId] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  // Success/Error Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  // Realtime Clock and Greeting
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");
  // Rotating Taglines
  const taglines = [
    "Efficiency meets excellence.",
    "Your orders, our priority.",
    "Deliver smiles with every dish.",
    "Manage orders like a pro.",
    "Keep calm and cook on!",
    "Always on time, always perfect.",
  ];
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);

  useEffect(() => {
    const name = localStorage.getItem("supplierName") || "Supplier";
    let id = localStorage.getItem("supplierId");
    if (!id) {
      id = name.trim().replace(/\s+/g, "").replace(/:/g, "");
    } else {
      id = id.trim().replace(/\s+/g, "").replace(/:/g, "");
    }
    setSupplierName(name);
    setSupplierId(id);
    fetchOrders(id);

    // Update clock every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      updateGreeting();
    }, 1000);

    // Rotate taglines every 5 seconds
    const taglineInterval = setInterval(() => {
      setCurrentTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(taglineInterval);
    };
  }, []);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning,");
    } else if (hour < 17) {
      setGreeting("Good Afternoon,");
    } else {
      setGreeting("Good Evening,");
    }
  };

  const fetchOrders = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://online-restaurant-management-system.onrender.com/deliverystatus/${encodeURIComponent(
          id
        )}`
      );
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching order data:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 4000);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowPopup(true);
  };

  const handleCompleteOrder = async (order) => {
    try {
      const totalAmount = order.items
        ? order.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
        : 0;

      const completedOrderData = {
        orderId: order.orderId,
        tableNumber: order.tableNumber,
        items: order.items || [],
        supplierId: supplierId,
        supplierName: supplierName,
        totalAmount: totalAmount,
        completedAt: new Date().toISOString(),
      };

      await axios.post(
        "https://online-restaurant-management-system.onrender.com/orderdone/complete",
        completedOrderData
      );
      setOrders((prevOrders) => prevOrders.filter((o) => o._id !== order._id));
      setShowPopup(false);
      showToast("Order completed successfully! 🎉", "success");
    } catch (error) {
      console.error("Error completing order:", error);
      showToast("Failed to complete order. Please try again.", "error");
    }
  };

  // Stats Calculation
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status?.toLowerCase() === "pending"
  ).length;
  const completedToday = 0; // You can calculate this based on your data

  // Recent Activities
  const recentActivities = [...orders]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
    )
    .slice(0, 3)
    .map((order) => ({
      message: `Order #${order.orderId} updated to "${order.status}"`,
      time: new Date(order.updatedAt || order.createdAt).toLocaleTimeString(),
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      {/* Enhanced Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-500 transform ${
            toast.type === "success"
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
          } animate-bounce`}
        >
          {toast.type === "success" ? (
            <FaCheckCircle className="text-2xl animate-pulse" />
          ) : (
            <FaTimes className="text-2xl animate-pulse" />
          )}
          <span className="font-semibold text-lg">{toast.message}</span>
        </div>
      )}

      {/* Enhanced Header */}
      <header className="mb-8 animate-fadeIn">
        <div className="bg-gradient-to-r from-white to-blue-50 shadow-2xl rounded-3xl p-8 border border-blue-100">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <FaUserCircle className="text-white text-4xl" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {greeting} {supplierName}!
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600 mt-2">
                    <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                      <FaRegCalendarAlt className="text-indigo-500" />
                      {currentTime.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                      <FaClock className="text-indigo-500" />
                      {currentTime.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-2xl font-semibold text-indigo-700 transition-all duration-1000 animate-pulse flex items-center gap-3">
                  <FaStar className="text-yellow-500" />"
                  {taglines[currentTaglineIndex]}"
                </p>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl animate-pulse">
                  <FaRocket className="text-white text-6xl" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <FaHeart className="text-white text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-white to-blue-50 shadow-xl rounded-2xl p-6 border border-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <FaUserCircle className="text-white text-2xl" />
              </div>
              <h3 className="font-bold text-xl text-gray-800">Your Profile</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                <span className="text-gray-600">Supplier Name:</span>
                <span className="font-semibold text-indigo-700">
                  {supplierName}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                <span className="text-gray-600">Supplier ID:</span>
                <span className="font-semibold text-indigo-700">
                  {supplierId}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-br from-white to-green-50 shadow-xl rounded-2xl p-6 border border-green-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                <FaChartLine className="text-white text-2xl" />
              </div>
              <h3 className="font-bold text-xl text-gray-800">Statistics</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                <span className="text-gray-600 flex items-center gap-2">
                  <FaShoppingCart className="text-blue-500" />
                  Total Orders:
                </span>
                <span className="font-bold text-2xl text-blue-600">
                  {totalOrders}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                <span className="text-gray-600 flex items-center gap-2">
                  <FaClock className="text-orange-500" />
                  Pending:
                </span>
                <span className="font-bold text-2xl text-orange-600">
                  {pendingOrders}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Card */}
          <div className="bg-gradient-to-br from-white to-purple-50 shadow-xl rounded-2xl p-6 border border-purple-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <FaHistory className="text-white text-2xl" />
              </div>
              <h3 className="font-bold text-xl text-gray-800">
                Recent Activity
              </h3>
            </div>
            <div className="space-y-3 max-h-32 overflow-y-auto">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl shadow-sm border-l-4 border-purple-500"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      {activity.message}
                    </p>
                    <span className="text-xs text-gray-500">
                      {activity.time}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-white rounded-xl shadow-sm text-center">
                  <p className="text-gray-500">No activity yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Notification Bell */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <button
            onClick={() => setShowNotificationDetails(!showNotificationDetails)}
            className="relative p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 group"
          >
            <FaBell className="text-3xl text-white group-hover:animate-bounce" />
            {pendingOrders > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm rounded-full h-8 w-8 flex items-center justify-center font-bold shadow-lg animate-pulse">
                {pendingOrders}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-3xl shadow-xl mx-auto max-w-md">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 absolute top-0"></div>
          </div>
          <p className="mt-4 text-lg font-semibold text-gray-600 animate-pulse">
            Loading your orders...
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gradient-to-r from-white to-blue-50 shadow-xl rounded-3xl p-12 max-w-2xl mx-auto text-center border border-blue-100">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaShoppingCart className="text-white text-4xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-700 mb-4">
            No Orders Yet
          </h2>
          <p className="text-gray-500 text-lg">
            Your next delicious order is just around the corner!
          </p>
        </div>
      ) : (
        <>
          {/* Enhanced View All Orders Button */}
          <div className="flex justify-center mb-10">
            <button
              onClick={() => setShowPopup(true)}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl font-bold text-lg flex items-center gap-3"
            >
              <FaEye className="text-xl" />
              View All Orders ({totalOrders})
            </button>
          </div>

          {/* Enhanced Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {orders.map((order, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-2xl text-gray-800 flex items-center gap-2">
                    <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {order.tableNumber}
                    </span>
                    Table {order.tableNumber}
                  </h4>
                  <StatusTag status={order.status} />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-600 bg-white p-3 rounded-xl shadow-sm">
                    <FaClock className="text-indigo-500" />
                    <span className="text-sm">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-xl border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-green-800 flex items-center gap-2">
                          <FaShoppingCart />
                          {order.items.length} Items
                        </span>
                        <span className="font-bold text-2xl text-green-700">
                          ₹
                          {order.items.reduce(
                            (sum, item) => sum + (item.totalPrice || 0),
                            0
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleViewOrder(order)}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <FaEye />
                    View Details
                  </button>
                  <button
                    onClick={() => handleCompleteOrder(order)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <FaCheckCircle />
                    Complete Order
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Notification Dropdown */}
          {showNotificationDetails && (
            <div className="fixed top-24 right-6 z-40 bg-white shadow-2xl rounded-3xl p-6 w-96 max-h-96 overflow-y-auto border border-gray-100 animate-slideIn">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                  <FaBell className="text-white text-sm" />
                </div>
                <h3 className="font-bold text-xl text-gray-800">
                  Pending Orders
                </h3>
              </div>
              {orders.filter((o) => o.status?.toLowerCase() === "pending")
                .length === 0 ? (
                <div className="text-center py-8">
                  <FaTrophy className="text-6xl text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">All caught up! 🎉</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders
                    .filter((o) => o.status?.toLowerCase() === "pending")
                    .map((order, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-2xl"
                      >
                        <p className="font-semibold text-gray-800">
                          <strong>Table:</strong> {order.tableNumber}
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Ordered:</strong>{" "}
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-semibold"
                        >
                          View Order
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Popups */}
          {showPopup && (
            <OrderPopup
              orders={orders}
              onClose={() => setShowPopup(false)}
              onView={handleViewOrder}
            />
          )}
          {selectedOrder && showPopup && (
            <OrderDetailsPopup
              order={selectedOrder}
              onClose={() => setShowPopup(false)}
              onComplete={handleCompleteOrder}
            />
          )}
        </>
      )}

      {/* Add custom styles */}
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

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Enhanced Order List Popup
const OrderPopup = ({ orders, onClose, onView }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <FaShoppingCart />
            Your Orders ({orders.length})
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-3xl transform hover:scale-110 transition-all duration-200"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl">No orders found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-white to-blue-50 border border-blue-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-xl text-gray-800 mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {order.tableNumber}
                      </span>
                      Table {order.tableNumber}
                    </h4>
                    <div className="flex items-center gap-4 text-gray-600 mb-3">
                      <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm">
                        <FaClock className="text-indigo-500" />
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                      <StatusTag status={order.status} />
                    </div>
                  </div>
                  <button
                    onClick={() => onView(order)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Enhanced Order Details Popup
const OrderDetailsPopup = ({ order, onClose, onComplete }) => {
  const calculateTotal = () => {
    if (!order.items || order.items.length === 0) return 0;
    return order.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <FaEye />
              Order Details
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl transform hover:scale-110 transition-all duration-200"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Order Info */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-lg">
            <h3 className="font-bold text-2xl text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <FaShoppingCart className="text-white" />
              </div>
              Order Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-gray-600 text-sm">Order ID</p>
                <p className="font-bold text-lg text-indigo-700">
                  {order.orderId}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-gray-600 text-sm">Table Number</p>
                <p className="font-bold text-lg text-indigo-700">
                  {order.tableNumber}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-gray-600 text-sm">Status</p>
                <StatusTag status={order.status} />
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-gray-600 text-sm">Ordered At</p>
                <p className="font-bold text-lg text-gray-800">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl border border-green-200">
              <p className="text-green-800 text-lg font-semibold">
                Total Amount
              </p>
              <p className="font-black text-4xl text-green-700">
                ₹{calculateTotal()}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h3 className="font-bold text-2xl mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <FaShoppingCart className="text-white" />
              </div>
              Order Items
            </h3>

            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <div className="grid grid-cols-3 bg-gradient-to-r from-gray-50 to-gray-100 font-bold p-4 text-gray-800">
                <div>Item Name</div>
                <div>Price</div>
                <div>Special Instructions</div>
              </div>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-3 p-4 border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold text-gray-800">
                      {item.foodName}
                    </div>
                    <div className="font-bold text-green-600">
                      ₹{item.totalPrice}
                    </div>
                    <div className="text-gray-600">
                      {item.specialInstructions || "None"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <FaShoppingCart className="text-4xl mx-auto mb-2 text-gray-300" />
                  No items available
                </div>
              )}
            </div>
          </div>

          {/* Complete Button */}
          <div className="flex justify-center">
            <button
              onClick={() => onComplete(order)}
              className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-12 py-6 rounded-2xl hover:from-green-700 hover:to-emerald-800 transition-all duration-300 transform hover:scale-105 shadow-2xl font-bold text-xl flex items-center gap-4"
            >
              <FaCheckCircle className="text-3xl" />
              Complete Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Status Tag Component
const StatusTag = ({ status }) => {
  const getStatusStyle = () => {
    const statusLower = status?.toLowerCase() || "";

    if (statusLower.includes("complete")) {
      return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200";
    } else if (statusLower.includes("reject")) {
      return "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200";
    } else if (statusLower.includes("accept")) {
      return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200";
    } else {
      return "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${getStatusStyle()} shadow-sm`}
    >
      {status}
    </span>
  );
};

export default OrderDetails;
