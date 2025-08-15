"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Trash2,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Users,
  Calendar,
  Eye,
} from "lucide-react";

const API_BASE =
  "https://online-restaurant-management-system.onrender.com/api/orders";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [filterTable, setFilterTable] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "" && filterTable === "all") {
      setFilteredOrders(orders);
      return;
    }

    let filtered = [...orders];

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.foodName.toLowerCase().includes(query) ||
          order.specialInstructions?.toLowerCase().includes(query) ||
          order.tableNumber.toString().includes(query)
      );
    }

    // Apply table filter
    if (filterTable !== "all") {
      filtered = filtered.filter(
        (order) => order.tableNumber.toString() === filterTable
      );
    }

    setFilteredOrders(filtered);
  }, [searchQuery, orders, filterTable]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/my-orders`);
      const data = Array.isArray(response.data) ? response.data : [];
      setOrders(data);
      setFilteredOrders(data);
      setMessage({ text: "", type: "" });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
      setFilteredOrders([]);
      setMessage({
        text: "Failed to fetch orders. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      setIsLoading(true);
      try {
        await axios.delete(`${API_BASE}/cancel-order/${orderId}`);
        fetchOrders();
        setMessage({
          text: "Order cancelled successfully",
          type: "success",
        });
      } catch (error) {
        setMessage({
          text: "Error cancelling order",
          type: "error",
        });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleMarkTablePaid = async (tableNumber) => {
    if (
      window.confirm(
        `Mark all orders for Table ${tableNumber} as paid and complete?`
      )
    ) {
      setIsLoading(true);
      try {
        await axios.post(`${API_BASE}/mark-paid/${tableNumber}`);
        fetchOrders();
        setMessage({
          text: `Table ${tableNumber} orders marked as paid and completed`,
          type: "success",
        });
      } catch (error) {
        setMessage({
          text: "Error marking orders as paid",
          type: "error",
        });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
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

  const getUniqueTableNumbers = () => {
    const tables = [...new Set(orders.map((order) => order.tableNumber))].sort(
      (a, b) => a - b
    );
    return tables;
  };

  const getOrdersByTable = (tableNumber) => {
    return orders.filter((order) => order.tableNumber === tableNumber);
  };

  const getTotalByTable = (tableNumber) => {
    return getOrdersByTable(tableNumber).reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );
  };

  const showOrderDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetailsModal = () => {
    setSelectedOrder(null);
    setShowOrderDetails(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Orders Management</h2>
        <button
          onClick={fetchOrders}
          disabled={isLoading}
          className={`flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors ${
            isLoading ? "opacity-70" : ""
          }`}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white">{orders.length}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Tables</p>
              <p className="text-2xl font-bold text-white">
                {getUniqueTableNumbers().length}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(
                  orders.reduce((sum, order) => sum + order.totalPrice, 0)
                )}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Order Value</p>
              <p className="text-2xl font-bold text-white">
                {orders.length > 0
                  ? formatCurrency(
                      orders.reduce((sum, order) => sum + order.totalPrice, 0) /
                        orders.length
                    )
                  : "₹0"}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`p-3 rounded-lg flex items-center ${
            message.type === "success"
              ? "bg-green-900 text-green-300 border-l-4 border-green-500"
              : "bg-red-900 text-red-300 border-l-4 border-red-500"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by food name, table number, or instructions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <select
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="pl-10 pr-10 py-2 appearance-none bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Tables</option>
              {getUniqueTableNumbers().map((tableNum) => (
                <option key={tableNum} value={tableNum.toString()}>
                  Table {tableNum}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-gray-700 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <Clock className="w-full h-full" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              {orders.length === 0 ? "No Orders Found" : "No Matching Orders"}
            </h3>
            <p className="text-gray-400 mb-6">
              {orders.length === 0
                ? "There are no active orders at the moment."
                : "Try a different search term or filter."}
            </p>
            {orders.length > 0 && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterTable("all");
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Food Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Add-ons
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Order Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => showOrderDetailsModal(order)}
                        className="flex items-center text-blue-400 hover:text-blue-300"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">
                          #{order._id.slice(-6)}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-900 text-blue-300 rounded-full">
                        Table {order.tableNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {order.foodName}
                        </div>
                        <div className="text-sm text-gray-400">
                          Base: {formatCurrency(order.basePrice)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.addOns && order.addOns.length > 0 ? (
                        <div className="text-sm text-gray-300">
                          {order.addOns.map((addon, index) => (
                            <div key={index}>
                              {addon.name} (x{addon.quantity}) -{" "}
                              {formatCurrency(addon.price)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          No add-ons
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-green-400">
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => showOrderDetailsModal(order)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Table Summary Section */}
      {getUniqueTableNumbers().length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Table Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getUniqueTableNumbers().map((tableNum) => (
              <div
                key={tableNum}
                className="bg-gray-700 p-4 rounded-lg border border-gray-600"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      Table {tableNum}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {getOrdersByTable(tableNum).length} orders
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">
                      {formatCurrency(getTotalByTable(tableNum))}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleMarkTablePaid(tableNum)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Paid
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Order Details</h3>
                <button
                  onClick={closeOrderDetailsModal}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Order ID</p>
                    <p className="text-white font-medium">
                      #{selectedOrder._id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Table Number</p>
                    <p className="text-white font-medium">
                      Table {selectedOrder.tableNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Order Time</p>
                    <p className="text-white font-medium">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Price</p>
                    <p className="text-green-400 font-bold text-lg">
                      {formatCurrency(selectedOrder.totalPrice)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Food Item</p>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-white font-medium">
                      {selectedOrder.foodName}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Base Price: {formatCurrency(selectedOrder.basePrice)}
                    </p>
                  </div>
                </div>

                {selectedOrder.addOns && selectedOrder.addOns.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Add-ons</p>
                    <div className="bg-gray-700 p-3 rounded-lg space-y-2">
                      {selectedOrder.addOns.map((addon, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-white">
                            {addon.name} (x{addon.quantity})
                          </span>
                          <span className="text-gray-400">
                            {formatCurrency(addon.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedOrder.specialInstructions && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">
                      Special Instructions
                    </p>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-white">
                        {selectedOrder.specialInstructions}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => handleCancelOrder(selectedOrder._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel Order
                  </button>
                  <button
                    onClick={closeOrderDetailsModal}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
