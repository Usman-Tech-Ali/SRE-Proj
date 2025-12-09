import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = "http://localhost:8000/api";

export default function ReturnPage() {
  const navigate = useNavigate();
  const [returnType, setReturnType] = useState("rental"); // "rental" or "unsatisfied"
  const [customerPhone, setCustomerPhone] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [customerRentals, setCustomerRentals] = useState([]);
  const [itemsToReturn, setItemsToReturn] = useState([]);

  const verifyCustomer = async () => {
    if (!customerPhone || customerPhone.length < 10) {
      toast.error("Please enter a valid 11-digit phone number");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/customers/`);
      const customers = await res.json();
      const customer = customers.find(c => c.phone_number === customerPhone);

      if (!customer) {
        toast.error("Customer not found");
        return;
      }

      setCustomerId(customer.id);

      if (returnType === "rental") {
        // Load customer's active rentals
        const rentalsRes = await fetch(`${API_BASE}/rentals/`);
        const allRentals = await rentalsRes.json();
        const activeRentals = allRentals.filter(
          r => r.customer === customer.id && !r.is_returned
        );

        if (activeRentals.length === 0) {
          toast.error("No active rentals for this customer");
          return;
        }

        setCustomerRentals(activeRentals);
      }

      setIsVerified(true);
      toast.success("Customer verified!");
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Network error");
    }
  };

  const calculateLateFee = (rental) => {
    const dueDate = new Date(rental.due_date);
    const today = new Date();
    const daysLate = Math.max(0, Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)));
    return daysLate * 5; // $5 per day late fee
  };

  const toggleReturnItem = (rentalId) => {
    if (itemsToReturn.includes(rentalId)) {
      setItemsToReturn(itemsToReturn.filter(id => id !== rentalId));
    } else {
      setItemsToReturn([...itemsToReturn, rentalId]);
    }
  };

  const calculateTotalDue = () => {
    return itemsToReturn.reduce((sum, rentalId) => {
      const rental = customerRentals.find(r => r.id === rentalId);
      return sum + (rental ? calculateLateFee(rental) : 0);
    }, 0);
  };

  const handleProcessReturn = async () => {
    if (!isVerified) {
      toast.error("Please verify customer first");
      return;
    }

    if (returnType === "rental" && itemsToReturn.length === 0) {
      toast.error("Please select items to return");
      return;
    }

    const loadingToast = toast.loading("Processing return...");

    try {
      if (returnType === "rental") {
        // Process rental returns
        for (const rentalId of itemsToReturn) {
          const rental = customerRentals.find(r => r.id === rentalId);
          const lateFee = calculateLateFee(rental);

          const res = await fetch(`${API_BASE}/rentals/${rentalId}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              is_returned: true,
              returned_at: new Date().toISOString(),
              late_fee: lateFee,
              days_late: Math.max(0, Math.ceil((new Date() - new Date(rental.due_date)) / (1000 * 60 * 60 * 24))),
            }),
          });

          if (!res.ok) {
            throw new Error(`Failed to process return for rental ${rentalId}`);
          }
        }

        const totalDue = calculateTotalDue();
        toast.success(
          totalDue > 0 
            ? `Return processed! Late fee: $${totalDue.toFixed(2)}`
            : "Return processed successfully!",
          { id: loadingToast, duration: 3000 }
        );
      } else {
        // Unsatisfied item return - just log it
        toast.success("Unsatisfied item return processed!", { id: loadingToast });
      }

      // Reset and navigate back
      setTimeout(() => navigate("/cashier"), 2000);
    } catch (err) {
      console.error("Return error:", err);
      toast.error(err.message || "Failed to process return", { id: loadingToast });
    }
  };

  const totalDue = calculateTotalDue();

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="bottom-right" />

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 sm:px-6 py-4 shadow-lg">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Process Return</h1>
            <p className="text-indigo-100">Handle rental returns</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Return Type & Customer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Return Type Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Return Type</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setReturnType("rental");
                    setIsVerified(false);
                    setCustomerPhone("");
                    setItemsToReturn([]);
                  }}
                  className={`p-4 rounded-xl border-2 transition text-left ${
                    returnType === "rental"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      returnType === "rental" ? "bg-indigo-500" : "bg-slate-300"
                    }`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Rental Return</p>
                      <p className="text-xs text-slate-600">Return rented items</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setReturnType("unsatisfied");
                    setIsVerified(false);
                    setCustomerPhone("");
                    setItemsToReturn([]);
                  }}
                  className={`p-4 rounded-xl border-2 transition text-left ${
                    returnType === "unsatisfied"
                      ? "border-slate-500 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      returnType === "unsatisfied" ? "bg-slate-500" : "bg-slate-300"
                    }`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Unsatisfied Item</p>
                      <p className="text-xs text-slate-600">Refund for defective item</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Customer Verification */}
            {returnType === "rental" && (
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
                    onKeyPress={(e) => e.key === 'Enter' && !isVerified && verifyCustomer()}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 disabled:bg-slate-100"
                  />
                  <button
                    onClick={verifyCustomer}
                    disabled={isVerified}
                    className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerified ? "Verified ✓" : "Verify"}
                  </button>
                </div>
              </div>
            )}

            {/* Rental Items to Return */}
            {returnType === "rental" && isVerified && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                  Select Items to Return
                </h2>
                <div className="space-y-3">
                  {customerRentals.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">
                      No active rentals found for this customer
                    </p>
                  ) : (
                    customerRentals.map((rental) => {
                      const lateFee = calculateLateFee(rental);
                      const daysLate = Math.max(0, Math.ceil((new Date() - new Date(rental.due_date)) / (1000 * 60 * 60 * 24)));
                      const isSelected = itemsToReturn.includes(rental.id);

                      return (
                        <div
                          key={rental.id}
                          onClick={() => toggleReturnItem(rental.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-slate-800">
                                {rental.product?.name || `Product ID: ${rental.product_id}`}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                Rented: {new Date(rental.rented_at).toLocaleDateString()} → 
                                Due: {new Date(rental.due_date).toLocaleDateString()}
                              </p>
                              {daysLate > 0 && (
                                <p className="text-xs text-red-600 font-semibold mt-1">
                                  ⚠️ {daysLate} days late • Late fee: ${lateFee.toFixed(2)}
                                </p>
                              )}
                            </div>
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? "bg-indigo-500 border-indigo-500"
                                : "border-slate-300"
                            }`}>
                              {isSelected && (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Unsatisfied Item Return */}
            {returnType === "unsatisfied" && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                  Unsatisfied Item Return
                </h2>
                <p className="text-slate-600 mb-4">
                  Process refund for defective or unsatisfactory purchased items.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    ℹ️ For unsatisfied item returns, please verify the original receipt and inspect the item before processing the refund.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Return Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-6 text-xl">Return Summary</h3>
              
              {/* Return Type */}
              <div className={`p-4 rounded-lg mb-4 ${
                returnType === "rental" 
                  ? 'bg-indigo-50 border border-indigo-200' 
                  : 'bg-slate-50 border border-slate-200'
              }`}>
                <p className="text-sm font-medium text-slate-700 mb-1">Return Type</p>
                <p className="font-bold text-slate-900">
                  {returnType === "rental" ? "Rental Return" : "Unsatisfied Item"}
                </p>
              </div>

              {/* Customer Status */}
              <div className={`p-4 rounded-lg mb-4 ${
                isVerified 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-amber-50 border border-amber-200'
              }`}>
                <p className="text-sm font-medium text-slate-700 mb-1">Customer</p>
                <p className="font-bold text-slate-900">
                  {isVerified ? customerPhone : "Not verified"}
                </p>
              </div>

              {/* Items to Return */}
              <div className="p-4 bg-slate-50 rounded-lg mb-4">
                <p className="text-sm font-medium text-slate-700 mb-1">Items to Return</p>
                <p className="text-2xl font-bold text-slate-900">{itemsToReturn.length}</p>
              </div>

              {/* Total Due */}
              {returnType === "rental" && itemsToReturn.length > 0 && (
                <div className="border-t-2 border-slate-200 pt-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-700">Late Fees</span>
                    <span className="font-semibold text-red-600">${totalDue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-slate-800">Total Due</span>
                    <span className="text-slate-900">${totalDue.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleProcessReturn}
                disabled={!isVerified || (returnType === "rental" && itemsToReturn.length === 0)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-indigo-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Process Return
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

