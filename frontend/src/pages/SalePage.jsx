import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = "http://localhost:8000/api";

export default function SalePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
      toast.error("Failed to load products");
    }
  };

  const addToCart = () => {
    const product = products.find((p) => p.id.toString() === itemId);
    if (!product) {
      toast.error("Product not found");
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
      toast.success(`Added ${product.name} to cart`);
    }

    setItemId("");
    setQuantity(1);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
    toast.success("Item removed from cart");
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/coupons/`);
      const coupons = await res.json();
      const coupon = coupons.find((c) => c.code === couponCode.toUpperCase());

      if (coupon && coupon.is_active) {
        setDiscountPercent(parseFloat(coupon.discount_percent));
        toast.success(`Coupon applied! ${coupon.discount_percent}% off`);
      } else {
        toast.error("Invalid or inactive coupon code");
        setDiscountPercent(0);
      }
    } catch (err) {
      toast.error("Failed to validate coupon");
      setDiscountPercent(0);
    }
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );
    const discountAmount = (subtotal * discountPercent) / 100;
    const tax = (subtotal - discountAmount) * 0.06; // 6% tax
    return {
      subtotal,
      discountAmount,
      tax,
      total: subtotal - discountAmount + tax,
    };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const employee = JSON.parse(localStorage.getItem("employee"));
    const { subtotal, discountAmount, tax, total } = calculateTotal();

    const loadingToast = toast.loading("Processing sale...");

    try {
      const res = await fetch(`${API_BASE}/transactions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SALE",
          cashier: employee.username,
          total_before_tax: (subtotal - discountAmount).toFixed(2),
          tax_amount: tax.toFixed(2),
          total_after_tax: total.toFixed(2),
          items: cart.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price: parseFloat(item.price).toFixed(2),
            line_total: (parseFloat(item.price) * item.quantity).toFixed(2),
          })),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(`Failed: ${JSON.stringify(error)}`, { id: loadingToast });
        return;
      }

      toast.success("Sale completed successfully!", { id: loadingToast });
      setCart([]);
      setCouponCode("");
      setDiscount(0);
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Network error", { id: loadingToast });
    }
  };

  const { subtotal, discountAmount, tax, total } = calculateTotal();

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="bottom-right" />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              New Sale
            </h1>
            <p className="text-sm text-slate-500">Process a new sale transaction</p>
          </div>
          <button
            onClick={() => navigate("/cashier")}
            className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition font-medium text-sm sm:text-base"
          >
            Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Add Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Items Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Add Items
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Item ID (e.g., 1000)"
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addToCart()}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-400"
                />
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-24 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-center font-semibold"
                />
                <button
                  onClick={addToCart}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:from-teal-600 hover:to-emerald-700 transition font-semibold shadow-md flex items-center gap-2"
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
                <h2 className="text-lg font-bold text-slate-800">Cart</h2>
                <span className="text-sm text-slate-500">{cart.length} items</span>
              </div>
              <div className="space-y-3">
                {cart.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">
                    Cart is empty. Add items to start.
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
                          ID: {item.id} • Qty: {item.quantity} @ ${parseFloat(item.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-teal-600">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-6 text-xl">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discountPercent}%)</span>
                    <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-700">
                  <span>Tax (6%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-slate-200 pt-3 mt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-slate-800">Total</span>
                    <span className="text-slate-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-indigo-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Proceed to Payment
              </button>
            </div>

            {/* Apply Coupon */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-3">Apply Coupon</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code (e.g., SAVE10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-400"
                />
                <button
                  onClick={applyCoupon}
                  className="px-5 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-semibold shadow flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

