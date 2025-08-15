"use client";
import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useNavigate, useLocation } from "react-router-dom";

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationType, setConfirmationType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { tableNumber, orders: orderList, totalAmount } = location.state || {};

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://online-restaurant-management-system.onrender.com/api/suppliers"
      );
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const selectSupplier = (supplier) => {
    setSelectedSupplier(
      selectedSupplier?.name === supplier.name ? null : supplier
    );
  };

  const sendNotification = () => {
    if (!selectedSupplier) return;
    setIsModalOpen(true);
    setIsBlurred(true);
  };

  const confirmAssign = async () => {
    try {
      setIsLoading(true);
      if (!selectedSupplier) {
        throw new Error("No supplier selected");
      }

      const orderId =
        orderList && orderList.length > 0 ? orderList[0]._id : null;

      const items = orderList.map((order) => ({
        id: order._id,
        foodName: order.foodName,
        totalPrice: order.totalPrice,
        addOns: order.addOns,
        specialInstructions: order.specialInstructions,
      }));

      const response = await fetch(
        "https://online-restaurant-management-system.onrender.com/api/suppliers/send-notification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supplierId: selectedSupplier.supplierId,
            supplierName: selectedSupplier.name,
            orderId,
            tableNumber,
            items,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.details || "Notification failed"
        );
      }

      const responseData = await response.json();
      console.log("Notification sent successfully:", responseData);

      setConfirmationMessage(`Order sent to ${selectedSupplier.name}`);
      setConfirmationType("success");

      setTimeout(() => {
        setIsBlurred(false);
        setIsModalOpen(false);
        navigate("/dashboard/booking");
      }, 2000);
    } catch (error) {
      console.error("Assignment/Notification error:", error);
      setConfirmationMessage(error.message || "Something went wrong.");
      setConfirmationType("error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!tableNumber || !orderList?.length) {
      navigate("/dashboard/booking");
    }
  }, [tableNumber, orderList, navigate]);

  return (
    <div className="bg-gray-100 text-gray-900 min-h-screen p-6 relative">
      {/* Blurred Content Only */}
      <div
        className={`flex flex-col gap-6 items-center transition-all duration-300 ${
          isBlurred ? "blur-sm" : ""
        }`}
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Supplier Management
          </h1>
          <p className="text-red-600 mb-6">
            Checking available and Assign Supplier
          </p>
          {tableNumber && (
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-2">Order Details</h2>
              <p className="text-gray-700">Table: {tableNumber}</p>
              <p className="text-gray-700">Items: {orderList?.length || 0}</p>
              <p className="text-gray-700">
                Total Amount: Rs. {totalAmount || 0}
              </p>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="text-center py-4 w-full">
            <p className="text-gray-500">Loading...</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-14 w-full max-w-4xl">
          <div className="text-center font-semibold text-2xl text-gray-900">
            Available Suppliers
          </div>
          <div className="text-center font-semibold text-2xl text-gray-900">
            Assigned Suppliers
          </div>

          {/* Available */}
          <div className="w-full bg-white p-3 rounded-lg shadow-lg max-h-65 overflow-y-auto">
            <div className="space-y-2">
              {suppliers.filter((s) => s.status === "Available").length ===
                0 && (
                <p className="text-center py-4 text-gray-500">
                  No available suppliers
                </p>
              )}
              {suppliers
                .filter((s) => s.status === "Available")
                .map((supplier) => (
                  <div
                    key={supplier._id || supplier.supplierId}
                    className="flex justify-between items-center p-2 rounded-lg"
                  >
                    <span className="text-gray-700 font-medium text-lg">
                      {supplier.name}
                    </span>
                    <button
                      onClick={() => selectSupplier(supplier)}
                      className={`px-5 py-2 rounded-lg transition duration-300 ${
                        selectedSupplier?.name === supplier.name
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-gray-900 hover:bg-gray-400"
                      }`}
                      disabled={isLoading}
                    >
                      {selectedSupplier?.name === supplier.name
                        ? "Selected"
                        : "Assign"}
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Busy */}
          <div className="w-full bg-white p-3 rounded-lg shadow-lg max-h-65 overflow-y-auto">
            <div className="space-y-2">
              {suppliers.filter((s) => s.status === "Busy").length === 0 && (
                <p className="text-center py-4 text-gray-500">
                  No busy suppliers
                </p>
              )}
              {suppliers
                .filter((s) => s.status === "Busy")
                .map((supplier) => (
                  <div
                    key={supplier._id || supplier.supplierId}
                    className="flex justify-between items-center p-2 rounded-lg"
                  >
                    <span className="text-gray-700 font-medium text-lg">
                      {supplier.name}
                    </span>
                    <span className="px-4 py-2 rounded-lg bg-green-500 text-white">
                      Assigned
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={sendNotification}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-400 transition duration-300 shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={!selectedSupplier || isLoading}
          >
            {isLoading ? "Processing..." : "Send Notification"}
          </button>
        </div>

        <div className="text-center font-semibold text-2xl text-gray-900 mt-6">
          Absent Suppliers
        </div>
        <div className="w-full max-w-4xl bg-white p-3 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          <div className="space-y-2">
            {suppliers.filter((s) => s.status === "Absent").length === 0 && (
              <p className="text-center py-4 text-gray-500">
                No absent suppliers
              </p>
            )}
            {suppliers
              .filter((s) => s.status === "Absent")
              .map((supplier) => (
                <div
                  key={supplier._id || supplier.supplierId}
                  className="flex justify-between items-center p-2 rounded-lg"
                >
                  <span className="text-gray-700 font-medium text-lg">
                    {supplier.name}
                  </span>
                  <span className="px-4 py-2 rounded-lg bg-red-500 text-white">
                    Absent
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Modal With No Dark Overlay */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClose={() => {
            if (!isLoading) {
              setIsModalOpen(false);
              setIsBlurred(false);
            }
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 backdrop-blur-sm" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center z-50">
              <Dialog.Title className="text-2xl font-semibold text-gray-800 mb-2">
                Confirm Assignment
              </Dialog.Title>
              <Dialog.Description className="text-gray-600 mb-4">
                Are you sure you want to mark{" "}
                <span className="font-bold">{selectedSupplier?.name}</span> as
                Busy?
              </Dialog.Description>
              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmAssign}
                  disabled={isLoading}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-400 disabled:opacity-50"
                >
                  {isLoading ? "Processing..." : "Confirm"}
                </button>
                <button
                  onClick={() => {
                    if (!isLoading) {
                      setIsModalOpen(false);
                      setIsBlurred(false);
                    }
                  }}
                  disabled={isLoading}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
              {confirmationMessage && (
                <div
                  className={`mt-4 text-xl font-semibold ${
                    confirmationType === "success"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {confirmationMessage}
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  );
};

export default SupplierPage;
