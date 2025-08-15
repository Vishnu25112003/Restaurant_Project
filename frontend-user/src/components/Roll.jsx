"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Minus, Plus, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { useNavigate } from "react-router-dom";
import rollImage from "../assets/rollmenu.jpg";

export default function RollMenu() {
  const [rolls, setRolls] = useState([]);
  const [selectedRoll, setSelectedRoll] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addOns, setAddOns] = useState([
    { name: "EGG OMELETTE", price: 20, quantity: 0 },
    { name: "CHICKEN FILLING", price: 40, quantity: 0 },
    { name: "VEGETABLE MIX", price: 15, quantity: 0 },
    { name: "CHEESE SLICE", price: 25, quantity: 0 },
    { name: "HOT SAUCE", price: 10, quantity: 0 },
  ]);
  const [customNotes, setCustomNotes] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const tableNumber = localStorage.getItem("tableNumber");

  // Fetch Roll data
  useEffect(() => {
    axios
      .get(
        "https://online-restaurant-management-system.onrender.com/api/foods/roll"
      )
      .then((response) => setRolls(response.data))
      .catch((error) => console.error("Error fetching rolls:", error));
  }, []);

  const handleQuantityChange = (index, increment) => {
    setAddOns((prev) =>
      prev.map((addon, i) =>
        i === index
          ? {
              ...addon,
              quantity: Math.max(0, addon.quantity + (increment ? 1 : -1)),
            }
          : addon
      )
    );
  };

  const calculateTotal = () => {
    const addOnsTotal = addOns.reduce(
      (sum, addon) => sum + addon.price * addon.quantity,
      0
    );
    return selectedRoll ? selectedRoll.price + addOnsTotal : 0;
  };

  const addToCart = async () => {
    if (!token || !tableNumber || !selectedRoll) return;

    try {
      await axios.post(
        "https://online-restaurant-management-system.onrender.com/api/orders/place-order",
        {
          foodName: selectedRoll.name,
          basePrice: selectedRoll.price,
          addOns: addOns.filter((addon) => addon.quantity > 0),
          specialInstructions: customNotes,
          totalPrice: calculateTotal(),
          tableNumber,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsModalOpen(false);
      setAddOns((prev) => prev.map((addon) => ({ ...addon, quantity: 0 })));
      setCustomNotes("");

      await axios.patch(
        `https://online-restaurant-management-system.onrender.com/api/foods/${selectedRoll._id}/decrease-quantity`
      );
      setRolls((prev) =>
        prev.map((roll) =>
          roll._id === selectedRoll._id
            ? { ...roll, quantity: roll.quantity - 1 }
            : roll
        )
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Hero Image */}
      <div className="relative h-[40vh] md:h-screen md:w-1/2 lg:w-3/5">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 flex items-end p-8">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">ROLLS</h1>
            <p className="text-xl text-gray-200">
              Street-style rolled delicacies
            </p>
          </div>
        </div>
        <img
          src={rollImage}
          alt="Roll Dish"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Menu Section */}
      <div className="flex flex-1 flex-col bg-gray-50 md:h-screen md:overflow-hidden">
        <div className="sticky top-0 bg-gray-50 p-6 pb-4 z-10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Button
              className="flex items-center gap-2 bg-[#122348] text-white hover:bg-[#122348]/90 transition-colors"
              onClick={() => navigate("/Home")}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK</span>
            </Button>
          </div>
          <h2 className="text-3xl font-bold">
            <span className="text-[#ff3131]">Flavors of Asia</span>{" "}
            <span className="text-[#122348]">Rolls</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Street food favorites with global twists
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <div className="grid gap-4">
            {rolls.map((item, index) => (
              <div
                key={index}
                className={`rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 ${
                  item.quantity === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                onClick={() => {
                  if (item.quantity > 0) {
                    setSelectedRoll(item);
                    setIsModalOpen(true);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-[#122348]">
                      {item.name} <span className="text-[#ff3131]"></span>
                    </h3>
                    <p className="text-sm text-gray-600">
                      "{item.description}"
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                        Street Food
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.type === "veg"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.type === "veg" ? "Veg" : "Non-Veg"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {item.quantity > 0 ? (
                      <>
                        <span className="block text-xl font-bold text-[#ff3131]">
                          ₹{item.price}
                        </span>
                        <span className="text-xs text-gray-500">
                          Customizable
                        </span>
                      </>
                    ) : (
                      <span className="inline-block text-xs font-semibold text-red-500 border border-red-500 px-2 py-1 rounded-md">
                        Sold Out
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-white max-w-md md:max-w-3xl rounded-xl shadow-lg p-0 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Left side - Image */}
              <div className="relative hidden md:block md:w-2/5 h-auto bg-[#122348]">
                <img
                  src={rollImage}
                  alt={selectedRoll?.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-3xl font-bold text-white text-center px-4">
                    {selectedRoll?.name} Roll
                  </h2>
                </div>
              </div>

              {/* Right side - Content */}
              <div className="p-4 md:p-5 w-full md:w-3/5">
                {/* Mobile title */}
                <div className="md:hidden mb-3">
                  <h2 className="text-xl font-bold text-[#122348]">
                    {selectedRoll?.name}{" "}
                    <span className="text-[#ff3131]">Roll</span>
                  </h2>
                </div>

                <p className="text-gray-600 text-sm italic mb-3">
                  {selectedRoll?.description}
                </p>

                <div className="mb-3">
                  <h4 className="font-medium text-[#122348] mb-2 text-sm">
                    Add Extras
                  </h4>
                  <ScrollArea className="h-36 rounded-md border">
                    <div className="p-3 space-y-2">
                      {addOns.map((addon, index) => (
                        <div
                          key={addon.name}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 border border-gray-100"
                        >
                          <div>
                            <p className="font-medium text-[#122348] text-sm">
                              {addon.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ₹{addon.price}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-md border border-gray-300 bg-white hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(index, false);
                              }}
                            >
                              <Minus className="h-3 w-3 text-[#ff3131]" />
                            </Button>
                            <span className="w-4 text-center font-semibold text-[#122348] text-sm">
                              {addon.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-md border border-gray-300 bg-white hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(index, true);
                              }}
                            >
                              <Plus className="h-3 w-3 text-[#ff3131]" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="mb-3">
                  <h4 className="font-medium text-[#122348] mb-1 text-sm">
                    Special Instructions
                  </h4>
                  <Textarea
                    placeholder="Any special requests? (e.g., extra spicy, no onions)"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="border-gray-300 focus:ring-[#122348] text-sm resize-none h-16"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-lg font-bold text-[#122348]">
                    Total: ₹{calculateTotal()}
                  </span>
                  <Button
                    className="bg-gradient-to-r from-[#ff3131] to-[#ff5733] hover:from-[#e62c2c] hover:to-[#e64e2e] text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow-md transition-all duration-300 ease-in-out active:scale-95"
                    onClick={addToCart}
                    disabled={!selectedRoll || !tableNumber}
                  >
                    ADD TO CART
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
