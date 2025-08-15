"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ShoppingCart,
  UtensilsCrossed,
  Truck,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Calendar,
  ChefHat,
  Package,
} from "lucide-react";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalMenuItems: 0,
    activeSuppliers: 0,
    totalUsers: 0,
    recentOrders: [],
    supplierStats: { present: 0, absent: 0, total: 0 },
    menuStats: { veg: 0, nonVeg: 0, total: 0 },
    ordersByCategory: [],
    weeklyOrderTrend: [],
    lowStockItems: [],
    recentActivity: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch data from multiple endpoints
      const [ordersRes, suppliersRes, menuRes] = await Promise.allSettled([
        axios.get(
          "https://online-restaurant-management-system.onrender.com/api/orders/my-orders"
        ),
        axios.get(
          "https://online-restaurant-management-system.onrender.com/api/suppliers"
        ),
        axios.get(
          "https://online-restaurant-management-system.onrender.com/api/foods/noodles"
        ), // You can modify this to get all categories
      ]);

      // Process orders data
      const orders =
        ordersRes.status === "fulfilled" ? ordersRes.value.data : [];
      const suppliers =
        suppliersRes.status === "fulfilled" ? suppliersRes.value.data : [];
      const menuItems =
        menuRes.status === "fulfilled" ? menuRes.value.data : [];

      // Calculate supplier statistics
      const supplierStats = {
        total: suppliers.length,
        present: suppliers.filter((s) => s.attendance === "Present").length,
        absent: suppliers.filter((s) => s.attendance === "Absent").length,
      };

      // Calculate menu statistics
      const menuStats = {
        total: menuItems.length,
        veg: menuItems.filter((item) => item.type === "veg").length,
        nonVeg: menuItems.filter((item) => item.type === "non-veg").length,
      };

      // Generate weekly order trend (last 7 days)
      const weeklyTrend = generateWeeklyTrend(orders);

      // Generate orders by category
      const ordersByCategory = generateOrdersByCategory(orders);

      // Get recent orders (last 10)
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      // Generate low stock items (items with quantity < 10)
      const lowStockItems = menuItems.filter((item) => item.quantity < 10);

      // Generate recent activity
      const recentActivity = generateRecentActivity(orders, suppliers);

      setDashboardData({
        totalOrders: orders.length,
        totalMenuItems: menuItems.length,
        activeSuppliers: supplierStats.present,
        totalUsers: suppliers.length, // Using suppliers as users for now
        recentOrders,
        supplierStats,
        menuStats,
        ordersByCategory,
        weeklyOrderTrend: weeklyTrend,
        lowStockItems,
        recentActivity,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate weekly trend data
  const generateWeeklyTrend = (orders) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];

      const dayOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });

      weekData.push({
        name: dayName,
        orders: dayOrders.length,
        totalAmount: dayOrders.reduce(
          (sum, order) => sum + (order.totalPrice || 0),
          0
        ),
      });
    }

    return weekData;
  };

  // Generate orders by category
  const generateOrdersByCategory = (orders) => {
    const categories = {};

    orders.forEach((order) => {
      // Extract category from food name or use a default categorization
      let category = "Others";
      const foodName = order.foodName?.toLowerCase() || "";

      if (foodName.includes("noodles")) category = "Noodles";
      else if (foodName.includes("biryani")) category = "Biryani";
      else if (foodName.includes("rice")) category = "Rice";
      else if (foodName.includes("pizza")) category = "Pizza";
      else if (foodName.includes("burger")) category = "Burger";
      else if (foodName.includes("dosa")) category = "Dosa";

      categories[category] = (categories[category] || 0) + 1;
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  // Generate recent activity
  const generateRecentActivity = (orders, suppliers) => {
    const activities = [];

    // Add recent orders
    orders.slice(0, 3).forEach((order) => {
      activities.push({
        id: `order-${order._id}`,
        type: "order",
        message: `New order #${order._id.slice(-6)} for ${order.foodName}`,
        time: new Date(order.createdAt),
        icon: "order",
        color: "green",
      });
    });

    // Add supplier status changes
    suppliers.slice(0, 2).forEach((supplier) => {
      activities.push({
        id: `supplier-${supplier._id}`,
        type: "supplier",
        message: `Supplier "${supplier.name}" marked as ${supplier.attendance}`,
        time: new Date(supplier.updatedAt || Date.now()),
        icon: "supplier",
        color: supplier.attendance === "Present" ? "blue" : "yellow",
      });
    });

    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);
  };

  // Auto-refresh functionality
  useEffect(() => {
    fetchDashboardData();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Format time ago
  const timeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Colors for pie chart
  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];

  return (
    <div className="space-y-6">
      {/* Header with refresh controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span>Auto-refresh</span>
          </label>
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Total Orders
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.totalOrders}
              </p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-green-500 text-sm mt-2 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            {dashboardData.recentOrders.length} recent orders
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Menu Items
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.totalMenuItems}
              </p>
            </div>
            <UtensilsCrossed className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-blue-500 text-sm mt-2 flex items-center">
            <ChefHat className="h-3 w-3 mr-1" />
            {dashboardData.menuStats.veg} veg, {dashboardData.menuStats.nonVeg}{" "}
            non-veg
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Active Suppliers
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.activeSuppliers}
              </p>
            </div>
            <Truck className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            {dashboardData.supplierStats.absent} absent today
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Low Stock Items
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.lowStockItems.length}
              </p>
            </div>
            <Package className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-red-500 text-sm mt-2 flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Needs attention
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Orders Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Weekly Orders Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.weeklyOrderTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Category */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <UtensilsCrossed className="h-5 w-5 mr-2" />
            Orders by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.ordersByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dashboardData.ordersByCategory.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Orders
          </h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {dashboardData.recentOrders.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No recent orders
              </p>
            ) : (
              dashboardData.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        #{order._id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.foodName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(order.totalPrice)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {timeAgo(order.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            Low Stock Alert
          </h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {dashboardData.lowStockItems.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  All items are well stocked!
                </p>
              </div>
            ) : (
              dashboardData.lowStockItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500"
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {item.quantity} left
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Activity
        </h3>
        <div className="space-y-4">
          {dashboardData.recentActivity.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No recent activity
            </p>
          ) : (
            dashboardData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.color === "green"
                      ? "bg-green-500"
                      : activity.color === "blue"
                      ? "bg-blue-500"
                      : activity.color === "yellow"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white">
                    {activity.message}
                  </p>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {timeAgo(activity.time)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          System Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Database
              </p>
              <p className="text-sm text-green-600">Connected</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                API Server
              </p>
              <p className="text-sm text-green-600">Running</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className={`h-5 w-5 rounded-full ${
                autoRefresh ? "bg-green-500" : "bg-gray-400"
              }`}
            ></div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Auto Refresh
              </p>
              <p
                className={`text-sm ${
                  autoRefresh ? "text-green-600" : "text-gray-500"
                }`}
              >
                {autoRefresh ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
