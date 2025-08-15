"use client";
import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaBell, FaTrash, FaArrowRight } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";

const BookingPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState({});
  const [viewModalTable, setViewModalTable] = useState(null);
  const [cancelMessage, setCancelMessage] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch orders grouped by table number
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://online-restaurant-management-system.onrender.com/api/booking"
      );
      const data = await response.json();
      const grouped = data.reduce((acc, order) => {
        if (!acc[order.tableNumber]) acc[order.tableNumber] = [];
        acc[order.tableNumber].push(order);
        return acc;
      }, {});
      setOrders(grouped);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const ordersInterval = setInterval(fetchOrders, 5000);
    return () => clearInterval(ordersInterval);
  }, []);

  // Format date/time
  const formatDateTime = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Delete an order
  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      await fetch(
        `https://online-restaurant-management-system.onrender.com/api/booking/${id}`,
        { method: "DELETE" }
      );
      fetchOrders();
      setCancelMessage("Order Cancelled");
      setTimeout(() => setCancelMessage(""), 2000);
    } catch (error) {
      console.error("Error deleting order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to Supplier Page
  const handleConfirm = (tableNumber) => {
    if (!orders[tableNumber] || orders[tableNumber].length === 0) {
      setNotificationMessage("No orders found for this table");
      setTimeout(() => setNotificationMessage(""), 2000);
      return;
    }
    navigate("/dashboard/supplier", {
      state: {
        tableNumber,
        orders: orders[tableNumber],
        totalAmount: orders[tableNumber].reduce(
          (sum, order) => sum + order.totalPrice,
          0
        ),
      },
    });
  };

  // Open View Modal
  const handleView = (tableNumber) => {
    setViewModalTable(tableNumber);
  };

  // Close View Modal
  const closeViewModal = () => {
    setViewModalTable(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-md flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#122348]">Order Dashboard</h1>
          <button className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition">
            <FaBell size={20} />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-40 bg-white rounded-xl shadow-md">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#ff3131]"></div>
          </div>
        )}

        {/* No Orders Available */}
        {!isLoading && Object.keys(orders).length === 0 && (
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No Orders Found
            </h3>
            <p className="text-gray-600 mb-6">
              There are no active orders at the moment.
            </p>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-6">
          {Object.keys(orders).map((tableNumber) => (
            <div
              key={tableNumber}
              className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center transform transition hover:shadow-lg"
            >
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <FaUser />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Table {tableNumber}</h2>
                  <span className="text-sm text-gray-500">
                    {orders[tableNumber].length} item(s)
                  </span>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleView(tableNumber)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                >
                  View
                </button>
                <button
                  onClick={() => handleConfirm(tableNumber)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-1 transition"
                >
                  Confirm <FaArrowRight />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast Notifications */}
      {cancelMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-5 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down">
          {cancelMessage}
        </div>
      )}
      {notificationMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-5 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down">
          {notificationMessage}
        </div>
      )}

      {/* View Order Modal */}
      <Transition appear show={!!viewModalTable} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClose={closeViewModal}
        >
          {/* Backdrop Blur */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 backdrop-blur-sm bg-black/10" />
          </Transition.Child>

          {/* Modal Content */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto mx-4 p-6 z-50">
              <Dialog.Title className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Table {viewModalTable} Orders
              </Dialog.Title>

              {viewModalTable &&
                orders[viewModalTable]?.map((order) => (
                  <div
                    key={order._id}
                    className="border-b py-4 last:border-b-0"
                  >
                    <h3 className="font-bold text-lg text-gray-900">
                      {order.foodName}
                    </h3>
                    <ul className="mt-2 space-y-1 text-gray-700 text-sm">
                      <li>
                        <strong>Price:</strong> Rs. {order.totalPrice}
                      </li>
                      <li>
                        <strong>Add-ons:</strong>{" "}
                        {order.addOns?.length
                          ? order.addOns.join(", ")
                          : "None"}
                      </li>
                      <li>
                        <strong>Instructions:</strong>{" "}
                        {order.specialInstructions || "None"}
                      </li>
                      <li>
                        <strong>Ordered At:</strong>{" "}
                        {formatDateTime(order.createdAt)}
                      </li>
                    </ul>
                    <button
                      onClick={() => handleDelete(order._id)}
                      className="mt-3 flex items-center gap-1 text-red-500 hover:text-red-700 transition"
                    >
                      <FaTrash /> Cancel Order
                    </button>
                  </div>
                ))}

              <button
                onClick={closeViewModal}
                className="w-full mt-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
              >
                Close
              </button>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  );
};

export default BookingPage;
