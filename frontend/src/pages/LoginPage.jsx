import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = "http://localhost:8000/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Store employee data and role
      localStorage.setItem("employee", JSON.stringify(data.employee));
      localStorage.setItem("role", data.employee.position);
      
      // Navigate based on role - use hard redirect immediately after toast
      const position = data.employee.position;
      console.log("Login successful, position:", position);
      
      toast.success(`Welcome, ${data.employee.first_name}!`, {
        duration: 2000,
      });

      // Hard redirect based on role
      setTimeout(() => {
        if (position === "Admin") {
          console.log("Redirecting to /admin");
          window.location.href = "/admin";
        } else {
          console.log("Redirecting to /cashier");
          window.location.href = "/cashier";
        }
      }, 800);
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Toaster position="bottom-right" />

      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute bottom-0 right-0 w-96 h-96 border-2 border-white/20 rounded-full translate-x-32 translate-y-32"></div>
        <div className="absolute top-20 left-20 w-64 h-64 border-2 border-white/10 rounded-full -translate-x-16 -translate-y-16"></div>

        {/* Illustration */}
        <div className="relative z-10 max-w-lg">
          <svg
            viewBox="0 0 500 400"
            className="w-full h-auto drop-shadow-2xl"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Desk */}
            <rect x="80" y="280" width="340" height="15" fill="#4B5563" rx="5" />
            <rect x="100" y="295" width="40" height="80" fill="#374151" rx="5" />
            <rect x="360" y="295" width="40" height="80" fill="#374151" rx="5" />

            {/* Chair */}
            <ellipse cx="180" cy="340" rx="50" ry="20" fill="#3B82F6" />
            <rect x="155" y="280" width="50" height="60" fill="#2563EB" rx="10" />
            <rect x="165" y="340" width="10" height="40" fill="#374151" />
            <rect x="195" y="340" width="10" height="40" fill="#374151" />

            {/* Person */}
            <circle cx="200" cy="220" r="30" fill="#F59E0B" />
            <rect x="185" y="245" width="30" height="50" fill="#1F2937" rx="5" />
            <rect x="170" y="260" width="20" height="50" fill="#60A5FA" rx="5" />
            <rect x="210" y="260" width="20" height="50" fill="#60A5FA" rx="5" />
            <rect x="170" y="305" width="15" height="40" fill="#2563EB" rx="3" />
            <rect x="215" y="305" width="15" height="40" fill="#2563EB" rx="3" />

            {/* Computer Monitor */}
            <rect x="260" y="200" width="140" height="90" fill="#E5E7EB" rx="5" />
            <rect x="270" y="210" width="120" height="70" fill="#3B82F6" rx="3" />
            
            {/* Login Box on Monitor */}
            <rect x="285" y="230" width="90" height="40" fill="white" rx="3" />
            <rect x="295" y="240" width="70" height="6" fill="#93C5FD" rx="2" />
            <rect x="295" y="252" width="70" height="6" fill="#93C5FD" rx="2" />
            <rect x="320" y="262" width="20" height="6" fill="#2563EB" rx="2" />

            {/* Monitor Stand */}
            <rect x="315" y="290" width="30" height="5" fill="#6B7280" />
            <rect x="325" y="275" width="10" height="15" fill="#6B7280" />

            {/* Charts/Graphs */}
            <g opacity="0.6">
              <rect x="40" y="150" width="8" height="40" fill="#60A5FA" rx="2" />
              <rect x="55" y="130" width="8" height="60" fill="#3B82F6" rx="2" />
              <rect x="70" y="110" width="8" height="80" fill="#2563EB" rx="2" />
              <rect x="85" y="140" width="8" height="50" fill="#60A5FA" rx="2" />
            </g>

            {/* Decorative icons */}
            <circle cx="420" cy="140" r="25" fill="white" opacity="0.2" />
            <circle cx="440" cy="200" r="15" fill="white" opacity="0.15" />
            <circle cx="60" cy="80" r="20" fill="white" opacity="0.1" />
          </svg>

          <div className="mt-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-2">Welcome to POS System</h2>
            <p className="text-blue-100 text-lg">
              Modern Point of Sale Management
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Hello!
              </h1>
              <p className="text-slate-600">Sign In to Get Started</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition text-slate-700 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition text-slate-700 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  "Login"
                )}
              </button>

              {/* Forgot Password */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-slate-600 hover:text-blue-600 transition text-sm font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign Up Link */}
              <div className="text-center pt-4 border-t border-slate-200">
                <p className="text-slate-600 text-sm">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/signup")}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-500 text-sm mt-6">
            © 2025 SG Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
