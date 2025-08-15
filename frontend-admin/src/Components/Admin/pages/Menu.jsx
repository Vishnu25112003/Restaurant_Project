"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  ChevronDown,
  Filter,
  Utensils,
} from "lucide-react";

const API_BASE =
  "https://online-restaurant-management-system.onrender.com/api/foods";

const foodCategories = [
  { value: "noodles", label: "Noodles", icon: "🍜" },
  { value: "biryani", label: "Biryani", icon: "🍚" },
  { value: "fried-rice", label: "Fried Rice", icon: "🍚" },
  { value: "halwa", label: "Halwa", icon: "🍮" },
  { value: "dosa", label: "Dosa", icon: "🥞" },
  { value: "pasta", label: "Pasta", icon: "🍝" },
  { value: "burger", label: "Burger", icon: "🍔" },
  { value: "idli", label: "Idli", icon: "🍙" },
  { value: "naan", label: "Naan", icon: "🫓" },
  { value: "roll", label: "Roll", icon: "🌯" },
  { value: "pizza", label: "Pizza", icon: "🍕" },
  { value: "sandwich", label: "Sandwich", icon: "🥪" },
  { value: "cake", label: "Cake", icon: "🍰" },
  { value: "icecream", label: "Ice Cream", icon: "🍦" },
  { value: "cookies", label: "Cookies", icon: "🍪" },
  { value: "pie", label: "Pie", icon: "🥧" },
  { value: "brownies", label: "Brownies", icon: "🍫" },
  { value: "doughnuts", label: "Doughnuts", icon: "🍩" },
  { value: "frieddesserts", label: "Fried Desserts", icon: "🍯" },
  { value: "pudding", label: "Pudding", icon: "🍮" },
  { value: "pastries", label: "Pastries", icon: "🥐" },
  { value: "gulabjamun", label: "Gulab Jamun", icon: "🍯" },
  { value: "jalebi", label: "Jalebi", icon: "🥨" },
];

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState("noodles");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    type: "veg",
    quantity: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchItems();
    resetForm();
  }, [selectedCategory]);

  useEffect(() => {
    if (searchQuery.trim() === "" && filterType === "all") {
      setFilteredItems(items);
      return;
    }

    let filtered = [...items];

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((item) => item.type === filterType);
    }

    setFilteredItems(filtered);
  }, [searchQuery, items, filterType]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/${selectedCategory}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
      setFilteredItems(data);
    } catch (err) {
      console.error("Failed to fetch items:", err);
      setItems([]);
      setFilteredItems([]);
      setMessage({
        text: "Failed to fetch items. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, price, type, quantity } = form;
    if (!name || price === "" || type === "" || quantity === "") {
      setMessage({
        text: "Please fill in all required fields.",
        type: "error",
      });
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      type: form.type,
      quantity: Number(form.quantity),
    };

    setIsLoading(true);
    try {
      if (editingId) {
        await axios.put(
          `${API_BASE}/${selectedCategory}/${editingId}`,
          payload
        );
        setMessage({
          text: "Item updated successfully!",
          type: "success",
        });
      } else {
        await axios.post(`${API_BASE}/${selectedCategory}`, payload);
        setMessage({
          text: "Item added successfully!",
          type: "success",
        });
      }
      resetForm();
      fetchItems();
      if (!editingId) {
        setShowForm(false);
      }
    } catch (err) {
      setMessage({
        text: "Something went wrong. Please try again.",
        type: "error",
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      type: "veg",
      quantity: "",
    });
    setEditingId(null);
    setMessage({ text: "", type: "" });
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name || "",
      description: item.description || "",
      price: item.price || "",
      type: item.type || "veg",
      quantity: item.quantity || "",
    });
    setEditingId(item._id);
    setMessage({ text: "", type: "" });
    setShowForm(true);

    // Scroll to form
    setTimeout(() => {
      document
        .getElementById("food-form")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setIsLoading(true);
      try {
        await axios.delete(`${API_BASE}/${selectedCategory}/${id}`);
        fetchItems();
        setMessage({
          text: "Item deleted successfully",
          type: "success",
        });
      } catch (err) {
        setMessage({
          text: "Error deleting item",
          type: "error",
        });
        console.error(err);
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

  const getCurrentCategory = () => {
    return (
      foodCategories.find((cat) => cat.value === selectedCategory) || {
        label: "Unknown",
        icon: "🍽️",
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="text-3xl mr-2">{getCurrentCategory().icon}</span>
              {getCurrentCategory().label} Management
            </h2>
            <p className="text-gray-400 mt-1">
              Manage menu items for {getCurrentCategory().label.toLowerCase()}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-10 py-2 appearance-none bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {foodCategories.map((category) => (
                  <option
                    key={category.value}
                    value={category.value}
                    className="bg-gray-700"
                  >
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Utensils className="h-4 w-4 text-gray-400" />
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {showForm ? (
                <XCircle className="h-5 w-5" />
              ) : (
                <PlusCircle className="h-5 w-5" />
              )}
              <span>{showForm ? "Cancel" : "Add New Item"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div
          id="food-form"
          className="bg-gray-800 p-6 rounded-lg border border-gray-700"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            {editingId ? (
              <>
                <Edit className="h-5 w-5 mr-2" />
                Edit {getCurrentCategory().label} Item
              </>
            ) : (
              <>
                <PlusCircle className="h-5 w-5 mr-2" />
                Add New {getCurrentCategory().label} Item
              </>
            )}
          </h3>

          {message.text && (
            <div
              className={`mb-4 p-3 rounded-lg flex items-center ${
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

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="space-y-4 md:col-span-1">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  type="text"
                  name="name"
                  placeholder="Enter food name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  name="description"
                  placeholder="Enter description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4 md:col-span-1">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  type="number"
                  name="price"
                  placeholder="Enter price"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="veg"
                      checked={form.type === "veg"}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 mr-2"
                    />
                    <span className="flex items-center text-gray-300">
                      <span className="inline-block w-4 h-4 bg-green-600 rounded-full mr-2"></span>
                      Veg
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="non-veg"
                      checked={form.type === "non-veg"}
                      onChange={handleChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 mr-2"
                    />
                    <span className="flex items-center text-gray-300">
                      <span className="inline-block w-4 h-4 bg-red-600 rounded-full mr-2"></span>
                      Non-Veg
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Quantity Available <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  type="number"
                  name="quantity"
                  placeholder="Enter available quantity"
                  value={form.quantity}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="md:col-span-2 flex gap-3 mt-2">
              <button
                className={`flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>{editingId ? "Updating..." : "Adding..."}</span>
                  </>
                ) : (
                  <>
                    {editingId ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <PlusCircle className="h-5 w-5" />
                    )}
                    <span>{editingId ? "Update Item" : "Add Item"}</span>
                  </>
                )}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <XCircle className="h-5 w-5" />
                  <span>Cancel Edit</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Items List Section */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-bold text-white">
            {getCurrentCategory().label} Items ({items.length})
          </h3>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-10 py-2 appearance-none bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="veg">Veg Only</option>
                <option value="non-veg">Non-Veg Only</option>
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <button
              onClick={fetchItems}
              disabled={isLoading}
              className={`flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors ${
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

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-gray-700 rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <Utensils className="w-full h-full" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              {items.length === 0 ? "No Items Found" : "No Matching Items"}
            </h3>
            <p className="text-gray-400 mb-6">
              {items.length === 0
                ? `There are no ${getCurrentCategory().label.toLowerCase()} items available. Add your first item!`
                : "Try a different search term or filter."}
            </p>
            {items.length === 0 ? (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Item
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-gray-700 border border-gray-600 rounded-lg overflow-hidden hover:bg-gray-600 transition-all duration-200"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2">
                      <div
                        className={`mt-1 w-4 h-4 rounded-full flex-shrink-0 ${
                          item.type === "veg" ? "bg-green-600" : "bg-red-600"
                        }`}
                      ></div>
                      <div>
                        <h4 className="font-bold text-white">{item.name}</h4>
                        <p className="text-sm text-gray-300 line-clamp-2">
                          {item.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-400">
                        {formatCurrency(item.price)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-3 flex justify-end gap-2 border-t border-gray-600">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
