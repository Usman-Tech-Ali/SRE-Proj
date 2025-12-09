import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = "http://localhost:8000/api";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
    position: "Cashier",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.username.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/employees/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          password: formData.password,
          position: formData.position,
          is_active: true,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.username?.[0] || "Registration failed");
        setLoading(false);
        return;
      }

      toast.success("Account created successfully! Please login.");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Toaster position="bottom-right" />

      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute bottom-0 right-0 w-96 h-96 border-2 border-white/20 rounded-full translate-x-32 translate-y-32"></div>
        <div className="absolute top-20 left-20 w-64 h-64 border-2 border-white/10 rounded-full -translate-x-16 -translate-y-16"></div>

        {/* Illustration */}
        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-8">
            <svg
              viewBox="0 0 400 300"
              className="w-full h-auto drop-shadow-2xl"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* User Card */}
              <rect x="100" y="80" width="200" height="140" fill="white" rx="15" />
              
              {/* Avatar Circle */}
              <circle cx="200" cy="120" r="25" fill="#8B5CF6" />
              
              {/* Lines for text */}
              <rect x="130" y="160" width="140" height="8" fill="#E0E7FF" rx="4" />
              <rect x="150" y="180" width="100" height="6" fill="#C7D2FE" rx="3" />
              
              {/* Checkmark */}
              <circle cx="270" cy="190" r="20" fill="#10B981" />
              <path d="M 262 190 L 268 196 L 278 184" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="text-white">
            <h2 className="text-3xl font-bold mb-2">Join Our Team</h2>
            <p className="text-purple-100 text-lg">
              Create your account and start managing sales
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Create Account
              </h1>
              <p className="text-slate-600">Sign up to get started</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    minLength={3}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-slate-700 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-slate-700 placeholder-slate-400"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-slate-700 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Role
                </label>
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <select
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-slate-700 appearance-none bg-white cursor-pointer"
                  >
                    <option value="Cashier">Cashier</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
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
                    minLength={6}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-slate-700 placeholder-slate-400"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Minimum 6 characters
                </p>
              </div>

              {/* Confirm Password */}
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={formData.confirm_password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirm_password: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-slate-700 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-indigo-600 hover:to-purple-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </div>
                ) : (
                  "Sign Up"
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-slate-200">
                <p className="text-slate-600 text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold transition"
                  >
                    Login
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

