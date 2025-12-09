import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const API_BASE = "http://localhost:8000/api";

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/transactions/`);
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to load transactions:", err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "SALE":
        return "bg-green-100 text-green-700";
      case "RENTAL":
        return "bg-amber-100 text-amber-700";
      case "RETURN_RENTAL":
        return "bg-blue-100 text-blue-700";
      case "RETURN_SALE":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
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
              Transaction History
            </h1>
            <p className="text-sm text-slate-500">View all sales and transactions</p>
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
          <LoadingSpinner message="Loading transactions..." />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                All Transactions ({transactions.length})
              </h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Cashier</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Total</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Tax</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Final Total</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-slate-500">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-800">#{transaction.id}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getTypeColor(transaction.type)}`}>
                            {transaction.type.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{transaction.cashier || "N/A"}</td>
                        <td className="py-3 px-4">${parseFloat(transaction.total_before_tax).toFixed(2)}</td>
                        <td className="py-3 px-4 text-slate-600">${parseFloat(transaction.tax_amount).toFixed(2)}</td>
                        <td className="py-3 px-4 font-semibold text-green-600">
                          ${parseFloat(transaction.total_after_tax).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(transaction.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            {transactions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 font-medium mb-1">Total Sales</p>
                    <p className="text-2xl font-bold text-green-700">
                      $
                      {transactions
                        .reduce((sum, t) => sum + parseFloat(t.total_after_tax), 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <p className="text-sm text-indigo-700 font-medium mb-1">Total Transactions</p>
                    <p className="text-2xl font-bold text-indigo-700">{transactions.length}</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-700 font-medium mb-1">Total Tax Collected</p>
                    <p className="text-2xl font-bold text-amber-700">
                      $
                      {transactions
                        .reduce((sum, t) => sum + parseFloat(t.tax_amount), 0)
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
