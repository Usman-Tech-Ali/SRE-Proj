import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = "http://localhost:8000/api";

export default function RentalPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customerPhone, setCustomerPhone] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [returnDate, setReturnDate] = useState("");

  useEffect(() => {
    loadProducts();
    // Set default return date to 7 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setReturnDate(defaultDate.toISOString().split('T')[0]);
  }, []);

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/`);
      const data = await res.json();
      setProducts(data.filter(p => p.is_rental)); // Only rental items
    } catch (err) {
      console.error("Failed to load products:", err);
      toast.error("Failed to load products");
    }
  };

  const verifyCustomer = async () => {
    if (!customerPhone || customerPhone.length < 10) {
      toast.error("Please enter a valid 11-digit phone number");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/customers/`);
      const customers = await res.json();
      const customer = customers.find(c => c.phone_number === customerPhone);

      if (customer) {
        setCustomerId(customer.id);
        setIsVerified(true);
        toast.success("Customer verified!");
      } else {
        // Create new customer
        const createRes = await fetch(`${API_BASE}/customers/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone_number: customerPhone }),
        });

        if (createRes.ok) {
          const newCustomer = await createRes.json();
          setCustomerId(newCustomer.id);
          setIsVerified(true);
          toast.success("New customer registered and verified!");
        } else {
          toast.error("Failed to register customer");
        }
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Network error");
    }
  };

  const addToCart = () => {
    if (!isVerified) {
      toast.error("Please verify customer first");
      return;
    }

    const product = products.find((p) => p.id.toString() === itemId);
    if (!product) {
      toast.error("Rental item not found");
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
      toast.success(`Updated quantity for ${product.name}`);
    } else {
      setCart([...cart, { ...product, quantity }]);
      toast.success(`Added ${product.name} to rental`);
    }

    setItemId("");
    setQuantity(1);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
    toast.success("Item removed from rental");
  };

  const calculateTotal = () => {
    return cart.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );
  };

  const handleCheckout = async () => {
    if (!isVerified) {
      toast.error("Please verify customer first");
      return;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!returnDate) {
      toast.error("Please set a return date");
      return;
    }

    const employee = JSON.parse(localStorage.getItem("employee"));
    const total = calculateTotal();

    const loadingToast = toast.loading("Processing rental...");

    try {
      // First, create a transaction for the rental
      const transactionRes = await fetch(`${API_BASE}/transactions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "RENTAL",
          cashier: employee.username,
          customer: customerId,
          total_before_tax: total.toFixed(2),
          tax_amount: "0.00",
          total_after_tax: total.toFixed(2),
          items: cart.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price: parseFloat(item.price).toFixed(2),
            line_total: (parseFloat(item.price) * item.quantity).toFixed(2),
          })),
        }),
      });

      if (!transactionRes.ok) {
        const error = await transactionRes.json();
        throw new Error(`Failed to create transaction: ${JSON.stringify(error)}`);
      }

      const transaction = await transactionRes.json();

      // Now create rental records for each item
      for (const item of cart) {
        const rentalData = {
          customer: customerId,
          product_id: item.id,
          rented_at: new Date().toISOString(),
          due_date: returnDate,
          is_returned: false,
          days_late: 0,
          late_fee: "0.00",
          rent_transaction: transaction.id,
        };

        const res = await fetch(`${API_BASE}/rentals/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rentalData),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(`Failed to create rental for ${item.name}: ${JSON.stringify(error)}`);
        }
      }

      toast.success("Rental completed successfully!", { id: loadingToast });
      
      // Reset form
      setCart([]);
      setCustomerPhone("");
      setIsVerified(false);
      setCustomerId(null);
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setReturnDate(defaultDate.toISOString().split('T')[0]);
      
      // Navigate back after a short delay
      setTimeout(() => navigate("/cashier"), 1500);
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(err.message || "Failed to process rental", { id: loadingToast });
    }
  };

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="bottom-right" />

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 sm:px-6 py-4 shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/cashier")}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">New Rental</h1>
            <p className="text-amber-100">Process rental transaction</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Customer & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Verification */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Customer Verification
              </h2>
              <div className="flex gap-3">
                <input
                  type="tel"
                  placeholder="Enter 11-digit phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  disabled={isVerified}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400 disabled:bg-slate-100"
                />
                <button
                  onClick={verifyCustomer}
                  disabled={isVerified}
                  className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerified ? "Verified ✓" : "Verify"}
                </button>
              </div>
            </div>

            {/* Add Items (only if verified) */}
            {isVerified && (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Add Rental Items
                  </h2>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Rental Item ID"
                      value={itemId}
                      onChange={(e) => setItemId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addToCart()}
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400"
                    />
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      className="w-24 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-center font-semibold"
                    />
                    <button
                      onClick={addToCart}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition font-semibold shadow-md flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </button>
                  </div>
                </div>

                {/* Cart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Rental Items</h2>
                    <span className="text-sm text-slate-500">{cart.length} items</span>
                  </div>
                  <div className="space-y-3">
                    {cart.length === 0 ? (
                      <p className="text-center text-slate-500 py-8">
                        No items added. Add rental items to continue.
                      </p>
                    ) : (
                      cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800 text-sm">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              ID: {item.id} • Qty: {item.quantity} @ ${parseFloat(item.price).toFixed(2)}/day
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-amber-600">
                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </p>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Rental Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-6 text-xl">Rental Summary</h3>
              
              {/* Customer Status */}
              <div className={`p-4 rounded-lg mb-4 ${isVerified ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                <p className="text-sm font-medium text-slate-700 mb-1">Customer</p>
                <p className="font-bold text-slate-900">
                  {isVerified ? customerPhone : "Not verified"}
                </p>
              </div>

              {/* Items Count */}
              <div className="p-4 bg-slate-50 rounded-lg mb-4">
                <p className="text-sm font-medium text-slate-700 mb-1">Items</p>
                <p className="text-2xl font-bold text-slate-900">{cart.length}</p>
              </div>

              {/* Return Date */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={!isVerified}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold disabled:bg-slate-100"
                />
                {returnDate && (
                  <p className="text-xs text-slate-600 mt-1">
                    {Math.ceil((new Date(returnDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="border-t-2 border-slate-200 pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-slate-800">Total</span>
                  <span className="text-slate-900">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={!isVerified || cart.length === 0}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

