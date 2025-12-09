import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = "http://localhost:8000/api";

export default function CashierDashboard() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [stats, setStats] = useState({
    todaysSales: 0,
    transactions: 0,
    activeRentals: 0,
  });

  useEffect(() => {
    const emp = JSON.parse(localStorage.getItem("employee") || "null");
    const role = localStorage.getItem("role");

    if (!emp || role !== "Cashier") {
      navigate("/");
      return;
    }

    setEmployee(emp);
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const [txRes, rentalsRes] = await Promise.all([
        fetch(`${API_BASE}/transactions/`),
        fetch(`${API_BASE}/rentals/`),
      ]);

      const transactions = await txRes.json();
      const rentals = await rentalsRes.json();

      const today = new Date().toISOString().split("T")[0];
      const todayTxs = transactions.filter((t) =>
        t.created_at.startsWith(today)
      );
      const todaysSales = todayTxs
        .filter((t) => t.type === "SALE")
        .reduce((sum, t) => sum + parseFloat(t.total_after_tax || 0), 0);
      const activeRentals = rentals.filter((r) => !r.is_returned).length;

      setStats({
        todaysSales,
        transactions: transactions.length,
        activeRentals,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const handleLogout = async () => {
    if (employee) {
      await fetch(`${API_BASE}/logout/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: employee.username }),
      });
    }
    localStorage.clear();
    navigate("/");
  };

  if (!employee) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="bottom-right" />
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Cashier Dashboard</h1>
              <p className="text-sm text-slate-500">Transaction Processing</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-lg">
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow">
                {employee.first_name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-800">
                  {employee.first_name} {employee.last_name}
                </p>
                <p className="text-xs text-teal-600 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Cashier
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2 font-medium shadow"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome back, {employee.first_name}! 👋
          </h2>
          <p className="text-slate-600">Here's your dashboard overview for today</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Today's Sales</p>
                <p className="text-4xl font-bold text-slate-800">
                  ${stats.todaysSales.toFixed(2)}
                </p>
              </div>
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Transactions</p>
                <p className="text-4xl font-bold text-slate-800">{stats.transactions}</p>
              </div>
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Active Rentals</p>
                <p className="text-4xl font-bold text-slate-800">{stats.activeRentals}</p>
              </div>
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Start New Transaction */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            Start New Transaction
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* New Sale */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-14 h-14 bg-teal-500 rounded-xl flex items-center justify-center mb-4 shadow">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-2">New Sale</h4>
            <p className="text-slate-600 mb-4 text-sm">
              Process a new sales transaction with automatic inventory update
            </p>
            <button 
              onClick={() => navigate("/sale")}
              className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-medium flex items-center justify-center gap-2 shadow">
              Get Started
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* New Rental */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center mb-4 shadow">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-2">New Rental</h4>
            <p className="text-slate-600 mb-4 text-sm">
              Start a rental transaction and track return dates
            </p>
            <button 
              onClick={() => navigate("/rental")}
              className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium flex items-center justify-center gap-2 shadow">
              Get Started
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Process Return */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-14 h-14 bg-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-2">Process Return</h4>
            <p className="text-slate-600 mb-4 text-sm">
              Handle rental returns and calculate late fees
            </p>
            <button 
              onClick={() => navigate("/return")}
              className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition font-medium flex items-center justify-center gap-2 shadow">
              Get Started
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

