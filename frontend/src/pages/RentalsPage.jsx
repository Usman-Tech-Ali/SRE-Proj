import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const API_BASE = "http://localhost:8000/api";

export default function RentalsPage() {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rentals/`);
      const data = await res.json();
      setRentals(data);
    } catch (err) {
      console.error("Failed to load rentals:", err);
      toast.error("Failed to load rentals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="bottom-right" />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              Rental Management
            </h1>
            <p className="text-sm text-slate-500">Track active and returned rentals</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition font-medium text-sm sm:text-base"
          >
            Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <LoadingSpinner message="Loading rentals..." />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                All Rentals ({rentals.length})
              </h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Product</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Rented</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Due Date</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Late Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-slate-500">
                        No rentals found.
                      </td>
                    </tr>
                  ) : (
                    rentals.map((rental) => (
                      <tr key={rental.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-800">#{rental.id}</td>
                        <td className="py-3 px-4 text-slate-600">{rental.customer || "N/A"}</td>
                        <td className="py-3 px-4">
                          {rental.product ? (
                            <div>
                              <p className="font-medium text-slate-800">{rental.product.name}</p>
                              <p className="text-xs text-slate-500">ID: {rental.product.id}</p>
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(rental.rented_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(rental.due_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-semibold ${
                              rental.is_returned
                                ? "bg-green-100 text-green-700"
                                : rental.days_late > 0
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {rental.is_returned
                              ? "Returned"
                              : rental.days_late > 0
                              ? `Late (${rental.days_late} days)`
                              : "Active"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-red-600">
                          {rental.late_fee > 0 ? `$${rental.late_fee}` : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            {rentals.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-700 font-medium mb-1">Active Rentals</p>
                    <p className="text-2xl font-bold text-amber-700">
                      {rentals.filter((r) => !r.is_returned).length}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 font-medium mb-1">Returned</p>
                    <p className="text-2xl font-bold text-green-700">
                      {rentals.filter((r) => r.is_returned).length}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700 font-medium mb-1">Late Fees</p>
                    <p className="text-2xl font-bold text-red-700">
                      $
                      {rentals
                        .reduce((sum, r) => sum + parseFloat(r.late_fee || 0), 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
