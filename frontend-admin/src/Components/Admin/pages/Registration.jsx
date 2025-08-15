"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Users,
  UserPlus,
} from "lucide-react";

const API_BASE = "https://online-restaurant-management-system.onrender.com/api";

const Registration = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [registrationForm, setRegistrationForm] = useState({
    role: "cashier",
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    email: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Note: You might need to create a GET endpoint to fetch all users
      // For now, we'll just clear the message when component loads
      setMessage({ text: "", type: "" });
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !registrationForm.username ||
      !registrationForm.password ||
      !registrationForm.role
    ) {
      setMessage({
        text: "Username, password, and role are required fields.",
        type: "error",
      });
      return;
    }

    if (registrationForm.password !== registrationForm.confirmPassword) {
      setMessage({
        text: "Passwords do not match!",
        type: "error",
      });
      return;
    }

    if (registrationForm.password.length < 6) {
      setMessage({
        text: "Password must be at least 6 characters long.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const payload = {
        username: registrationForm.username.trim(),
        password: registrationForm.password,
        role: registrationForm.role,
      };

      if (editingUser) {
        // Update existing user (you might need to create an update endpoint)
        setMessage({
          text: "User update functionality needs to be implemented in backend.",
          type: "error",
        });
      } else {
        // Create new user
        const response = await axios.post(`${API_BASE}/register`, payload);

        setMessage({
          text: `User "${registrationForm.username}" registered successfully with role "${registrationForm.role}"!`,
          type: "success",
        });

        // Reset form
        setRegistrationForm({
          role: "cashier",
          username: "",
          password: "",
          confirmPassword: "",
          fullName: "",
          email: "",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response?.data?.message) {
        setMessage({
          text: error.response.data.message,
          type: "error",
        });
      } else {
        setMessage({
          text: "Registration failed. Please try again.",
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setRegistrationForm({
      role: "cashier",
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
    });
    setEditingUser(null);
    setMessage({ text: "", type: "" });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "text-yellow-400";
      case "cashier":
        return "text-blue-400";
      case "supplier":
        return "text-green-400";
      case "foodincharge":
        return "text-purple-400";
      default:
        return "text-gray-400";
    }
  };

  const getRolePermissions = (role) => {
    const permissions = {
      cashier: [
        "Process orders",
        "View menu items",
        "Handle payments",
        "Basic reporting",
      ],
      supplier: [
        "Update inventory",
        "View orders",
        "Manage deliveries",
        "Status updates",
      ],
      foodincharge: [
        "Manage menu items",
        "Recipe management",
        "Quality control",
        "Kitchen operations",
      ],
      admin: [
        "Full system access",
        "User management",
        "Analytics & reports",
        "System settings",
      ],
    };
    return permissions[role] || [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">User Registration</h2>
          <p className="text-gray-400 text-sm mt-1">
            Create and manage user accounts for the restaurant system
          </p>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <Users className="h-5 w-5" />
          <span className="text-sm">Backend Integration Active</span>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`p-4 rounded-lg flex items-center ${
            message.type === "success"
              ? "bg-green-900 text-green-300 border-l-4 border-green-500"
              : "bg-red-900 text-red-300 border-l-4 border-red-500"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      {/* Registration Form */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <UserPlus className="h-5 w-5 mr-2" />
          {editingUser ? "Edit User Account" : "Create New User Account"}
        </h3>

        <form onSubmit={handleRegistrationSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={registrationForm.role}
              onChange={(e) =>
                setRegistrationForm({
                  ...registrationForm,
                  role: e.target.value,
                })
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="cashier">Cashier</option>
              <option value="supplier">Supplier</option>
              <option value="foodincharge">Food Incharge</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Selected role permissions:{" "}
              {getRolePermissions(registrationForm.role).join(", ")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={registrationForm.username}
                  onChange={(e) =>
                    setRegistrationForm({
                      ...registrationForm,
                      username: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter unique username"
                />
                <p className="text-xs text-gray-400 mt-1">
                  This will be used for login
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={registrationForm.fullName}
                  onChange={(e) =>
                    setRegistrationForm({
                      ...registrationForm,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={registrationForm.email}
                  onChange={(e) =>
                    setRegistrationForm({
                      ...registrationForm,
                      email: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address (optional)"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={registrationForm.password}
                    onChange={(e) =>
                      setRegistrationForm({
                        ...registrationForm,
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
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={registrationForm.confirmPassword}
                    onChange={(e) =>
                      setRegistrationForm({
                        ...registrationForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {registrationForm.password &&
                  registrationForm.confirmPassword &&
                  registrationForm.password !==
                    registrationForm.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">
                      Passwords do not match
                    </p>
                  )}
              </div>

              {/* Password Strength Indicator */}
              {registrationForm.password && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Password strength:</p>
                  <div className="flex space-x-1">
                    <div
                      className={`h-1 w-full rounded ${
                        registrationForm.password.length >= 6
                          ? "bg-green-500"
                          : "bg-gray-600"
                      }`}
                    ></div>
                    <div
                      className={`h-1 w-full rounded ${
                        registrationForm.password.length >= 8
                          ? "bg-green-500"
                          : "bg-gray-600"
                      }`}
                    ></div>
                    <div
                      className={`h-1 w-full rounded ${
                        /[A-Z]/.test(registrationForm.password)
                          ? "bg-green-500"
                          : "bg-gray-600"
                      }`}
                    ></div>
                    <div
                      className={`h-1 w-full rounded ${
                        /[0-9]/.test(registrationForm.password)
                          ? "bg-green-500"
                          : "bg-gray-600"
                      }`}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg flex items-center space-x-2 transition-colors ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{editingUser ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>
                    {editingUser ? "Update Account" : "Create Account"}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={isLoading}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg transition-colors"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>

      {/* Role Permissions Info */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          Role Permissions Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["cashier", "supplier", "foodincharge", "admin"].map((role) => (
            <div key={role} className="bg-gray-700 p-4 rounded-lg">
              <h4
                className={`font-semibold mb-2 capitalize ${getRoleColor(
                  role
                )}`}
              >
                {role === "foodincharge" ? "Food Incharge" : role}
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                {getRolePermissions(role).map((permission, index) => (
                  <li key={index}>• {permission}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Registration;
