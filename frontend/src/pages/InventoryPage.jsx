import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const API_BASE = "http://localhost:8000/api";

export default function InventoryPage() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    product_code: "",
    quantity: 0,
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/inventory/`);
      const data = await res.json();
      setInventory(data);
    } catch (err) {
      console.error("Failed to load inventory:", err);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Adding inventory...");

    try {
      const res = await fetch(`${API_BASE}/inventory/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(`Failed: ${JSON.stringify(error)}`, { id: loadingToast });
        return;
      }

      toast.success("Inventory added successfully!", { id: loadingToast });
      setShowAddModal(false);
      setFormData({ product_code: "", quantity: 0 });
      loadInventory();
    } catch (err) {
      console.error("Failed to add inventory:", err);
      toast.error("Network error", { id: loadingToast });
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
              Inventory Management
            </h1>
            <p className="text-sm text-slate-500">Manage stock levels</p>
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
          <LoadingSpinner message="Loading inventory..." />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Stock Items ({inventory.length})
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-medium shadow"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Stock
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                      Product Code
                    </th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                      Quantity
                    </th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-12 text-slate-500"
                      >
                        No inventory found. Add stock to get started!
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {item.product_code}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              item.quantity > 50
                                ? "bg-green-100 text-green-700"
                                : item.quantity > 20
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(item.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Add Inventory
            </h2>
            <form onSubmit={handleAddInventory} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Product Code
                </label>
                <input
                  type="text"
                  value={formData.product_code}
                  onChange={(e) =>
                    setFormData({ ...formData, product_code: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value),
                    })
                  }
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ product_code: "", quantity: 0 });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow order-1 sm:order-2"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

