"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  Users,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Save,
  Trash2,
} from "lucide-react";

const API_BASE =
  "https://online-restaurant-management-system.onrender.com/api/suppliers";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [filterStatus, setFilterStatus] = useState("all");
  const [lastResetDate, setLastResetDate] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Form state for creating/editing suppliers
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    supplierId: "",
    password: "",
    attendance: "Present",
  });

  useEffect(() => {
    fetchSuppliers();
    checkAndResetDaily();

    // Set up interval to check for daily reset every minute
    const interval = setInterval(checkAndResetDaily, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "" && filterStatus === "all") {
      setFilteredSuppliers(suppliers);
      return;
    }

    let filtered = [...suppliers];

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(query) ||
          supplier.supplierId.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (supplier) => supplier.attendance.toLowerCase() === filterStatus
      );
    }

    setFilteredSuppliers(filtered);
  }, [searchQuery, suppliers, filterStatus]);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_BASE);
      const data = Array.isArray(response.data) ? response.data : [];
      setSuppliers(data);
      setFilteredSuppliers(data);
      setMessage({ text: "", type: "" });
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      setSuppliers([]);
      setFilteredSuppliers([]);
      setMessage({
        text: "Failed to fetch suppliers. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndResetDaily = async () => {
    const now = new Date();
    const today = now.toDateString();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if it's 12:00 AM (midnight)
    if (currentHour === 0 && currentMinute === 0) {
      const storedResetDate = localStorage.getItem("lastSupplierReset");

      // Only reset if we haven't already reset today
      if (storedResetDate !== today) {
        await resetAllSuppliersToPresent();
        localStorage.setItem("lastSupplierReset", today);
        setLastResetDate(today);
      }
    }
  };

  const resetAllSuppliersToPresent = async () => {
    try {
      // Update all suppliers to Present
      const updatePromises = suppliers.map((supplier) =>
        axios.patch(`${API_BASE}/${supplier._id}`, { attendance: "Present" })
      );

      await Promise.all(updatePromises);

      // Refresh the suppliers list
      await fetchSuppliers();

      setMessage({
        text: "All suppliers have been automatically reset to Present for the new day.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to reset suppliers:", error);
      setMessage({
        text: "Failed to reset suppliers automatically.",
        type: "error",
      });
    }
  };

  const toggleSupplierAttendance = async (supplier) => {
    const newAttendance =
      supplier.attendance === "Present" ? "Absent" : "Present";

    setIsLoading(true);
    try {
      await axios.patch(`${API_BASE}/${supplier._id}`, {
        attendance: newAttendance,
      });

      // Update local state immediately for better UX
      setSuppliers((prevSuppliers) =>
        prevSuppliers.map((s) =>
          s._id === supplier._id
            ? {
                ...s,
                attendance: newAttendance,
                status: newAttendance === "Absent" ? "Absent" : "Available",
              }
            : s
        )
      );

      setMessage({
        text: `${supplier.name} marked as ${newAttendance}`,
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update supplier attendance:", error);
      setMessage({
        text: "Failed to update supplier attendance. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !supplierForm.name ||
      !supplierForm.supplierId ||
      !supplierForm.password
    ) {
      setMessage({
        text: "Name, Supplier ID, and Password are required fields.",
        type: "error",
      });
      return;
    }

    if (supplierForm.password.length < 6) {
      setMessage({
        text: "Password must be at least 6 characters long.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: supplierForm.name.trim(),
        supplierId: supplierForm.supplierId.trim(),
        password: supplierForm.password,
        attendance: supplierForm.attendance,
      };

      if (editingSupplier) {
        // Update existing supplier
        await axios.patch(`${API_BASE}/${editingSupplier._id}`, payload);
        setMessage({
          text: `Supplier "${supplierForm.name}" updated successfully!`,
          type: "success",
        });
      } else {
        // Create new supplier
        await axios.post(API_BASE, payload);
        setMessage({
          text: `Supplier "${supplierForm.name}" created successfully!`,
          type: "success",
        });
      }

      // Reset form and refresh data
      resetSupplierForm();
      await fetchSuppliers();
    } catch (error) {
      console.error("Failed to create/update supplier:", error);

      if (error.response?.data?.error) {
        setMessage({
          text: error.response.data.error,
          type: "error",
        });
      } else {
        setMessage({
          text: "Failed to create/update supplier. Please try again.",
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetSupplierForm = () => {
    setSupplierForm({
      name: "",
      supplierId: "",
      password: "",
      attendance: "Present",
    });
    setEditingSupplier(null);
    setShowCreateForm(false);
    setShowPassword(false);
  };

  const handleEditSupplier = (supplier) => {
    setSupplierForm({
      name: supplier.name,
      supplierId: supplier.supplierId,
      password: "", // Don't show existing password
      attendance: supplier.attendance,
    });
    setEditingSupplier(supplier);
    setShowCreateForm(true);
    setMessage({ text: "", type: "" });
  };

  const handleDeleteSupplier = async (supplier) => {
    if (
      window.confirm(
        `Are you sure you want to delete supplier "${supplier.name}"? This action cannot be undone.`
      )
    ) {
      setIsLoading(true);
      try {
        await axios.delete(`${API_BASE}/${supplier._id}`);

        setMessage({
          text: `Supplier "${supplier.name}" deleted successfully!`,
          type: "success",
        });

        // Refresh the suppliers list
        await fetchSuppliers();
      } catch (error) {
        console.error("Failed to delete supplier:", error);
        setMessage({
          text: "Failed to delete supplier. Please try again.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getSupplierStats = () => {
    const total = suppliers.length;
    const present = suppliers.filter((s) => s.attendance === "Present").length;
    const absent = suppliers.filter((s) => s.attendance === "Absent").length;
    const busy = suppliers.filter((s) => s.status === "Busy").length;

    return { total, present, absent, busy };
  };

  const stats = getSupplierStats();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Suppliers Management
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Daily attendance resets automatically at 12:00 AM
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {showCreateForm ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>{showCreateForm ? "Cancel" : "Add Supplier"}</span>
          </button>
          <button
            onClick={fetchSuppliers}
            disabled={isLoading}
            className={`flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors ${
              isLoading ? "opacity-70" : ""
            }`}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Suppliers</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Present</p>
              <p className="text-2xl font-bold text-green-500">
                {stats.present}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Absent</p>
              <p className="text-2xl font-bold text-red-500">{stats.absent}</p>
            </div>
            <UserX className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Busy</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.busy}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
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

      {/* Create/Edit Supplier Form */}
      {showCreateForm && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            {editingSupplier ? (
              <>
                <Edit className="h-5 w-5 mr-2" />
                Edit Supplier
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Create New Supplier
              </>
            )}
          </h3>

          <form
            onSubmit={handleCreateSupplier}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={supplierForm.name}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, name: e.target.value })
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter supplier name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Supplier ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={supplierForm.supplierId}
                onChange={(e) =>
                  setSupplierForm({
                    ...supplierForm,
                    supplierId: e.target.value,
                  })
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter unique supplier ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={supplierForm.password}
                  onChange={(e) =>
                    setSupplierForm({
                      ...supplierForm,
                      password: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password (min 6 characters)"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Initial Attendance
              </label>
              <select
                value={supplierForm.attendance}
                onChange={(e) =>
                  setSupplierForm({
                    ...supplierForm,
                    attendance: e.target.value,
                  })
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>

            <div className="md:col-span-2 flex space-x-3 mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>
                      {editingSupplier ? "Updating..." : "Creating..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>
                      {editingSupplier ? "Update Supplier" : "Create Supplier"}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetSupplierForm}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                <XCircle className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
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
              placeholder="Search by name or supplier ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-10 py-2 appearance-none bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="present">Present Only</option>
              <option value="absent">Absent Only</option>
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <button
            onClick={resetAllSuppliersToPresent}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset All to Present</span>
          </button>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">
          Suppliers List ({filteredSuppliers.length})
        </h3>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="bg-gray-700 rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <Users className="w-full h-full" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              {suppliers.length === 0
                ? "No Suppliers Found"
                : "No Matching Suppliers"}
            </h3>
            <p className="text-gray-400 mb-6">
              {suppliers.length === 0
                ? "There are no suppliers registered in the system."
                : "Try a different search term or filter."}
            </p>
            {suppliers.length === 0 ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create First Supplier
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterStatus("all");
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier._id}
                className="bg-gray-700 p-6 rounded-lg border border-gray-600"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-gray-600 p-2 rounded-full">
                      <User className="h-5 w-5 text-gray-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {supplier.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        ID: {supplier.supplierId}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-400 mr-2">
                          Status:
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            supplier.status === "Available"
                              ? "bg-green-900 text-green-300"
                              : supplier.status === "Busy"
                              ? "bg-yellow-900 text-yellow-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {supplier.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm font-medium ${
                        supplier.attendance === "Present"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {supplier.attendance}
                    </span>
                    <button
                      onClick={() => toggleSupplierAttendance(supplier)}
                      disabled={isLoading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        supplier.attendance === "Present"
                          ? "bg-green-600"
                          : "bg-gray-600"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          supplier.attendance === "Present"
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditSupplier(supplier)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSupplier(supplier)}
                    disabled={isLoading}
                    className={`bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleSupplierAttendance(supplier)}
                    disabled={isLoading}
                    className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                      supplier.attendance === "Present"
                        ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {supplier.attendance === "Present" ? (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Mark Absent
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Present
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Reset Info */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center space-x-2 text-gray-400">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            Automatic Reset: All suppliers will be marked as "Present" daily at
            12:00 AM
          </span>
        </div>
        {lastResetDate && (
          <p className="text-xs text-gray-500 mt-1">
            Last reset: {lastResetDate}
          </p>
        )}
      </div>
    </div>
  );
};

export default Suppliers;
