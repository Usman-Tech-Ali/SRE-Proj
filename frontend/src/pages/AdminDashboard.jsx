import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const API_BASE = "http://localhost:8000/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    admins: 0,
    cashiers: 0,
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    position: "Cashier",
    password: "",
  });

  useEffect(() => {
    const emp = JSON.parse(localStorage.getItem("employee") || "null");
    const role = localStorage.getItem("role");

    if (!emp || role !== "Admin") {
      navigate("/");
      return;
    }

    setEmployee(emp);
    loadEmployees();
  }, [navigate]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/employees/`);
      const data = await res.json();
      setEmployees(data);

      const admins = data.filter((e) => e.position === "Admin").length;
      const cashiers = data.filter((e) => e.position === "Cashier").length;
      setStats({
        totalEmployees: data.length,
        admins,
        cashiers,
      });
    } catch (err) {
      console.error("Failed to load employees:", err);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
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

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (formData.username.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }

    const loadingToast = toast.loading("Adding employee...");

    try {
      const res = await fetch(`${API_BASE}/employees/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          position: formData.position,
          password: formData.password, // Backend will hash it
          is_active: true,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(`Failed to add employee: ${error.username?.[0] || JSON.stringify(error)}`, {
          id: loadingToast,
        });
        return;
      }

      toast.success(`Employee ${formData.username} added successfully!`, {
        id: loadingToast,
      });

      setShowAddModal(false);
      setFormData({
        username: "",
        first_name: "",
        last_name: "",
        position: "Cashier",
        password: "",
      });
      loadEmployees();
    } catch (err) {
      console.error("Failed to add employee:", err);
      toast.error("Network error. Please try again.", { id: loadingToast });
    }
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();

    // Validation for password if provided
    if (formData.password && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    const loadingToast = toast.loading("Updating employee...");

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        position: formData.position,
        is_active: true,
      };

      // Only include password if it was changed
      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await fetch(`${API_BASE}/employees/${editingEmployee.username}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(`Failed to update employee: ${JSON.stringify(error)}`, {
          id: loadingToast,
        });
        return;
      }

      toast.success(`Employee ${editingEmployee.username} updated successfully!`, {
        id: loadingToast,
      });

      setShowEditModal(false);
      setEditingEmployee(null);
      setFormData({
        username: "",
        first_name: "",
        last_name: "",
        position: "Cashier",
        password: "",
      });
      loadEmployees();
    } catch (err) {
      console.error("Failed to update employee:", err);
      toast.error("Network error. Please try again.", { id: loadingToast });
    }
  };

  const handleDelete = async (username) => {
    // Prevent self-deletion
    if (employee && username === employee.username) {
      toast.error("You cannot delete your own account while logged in");
      return;
    }

    if (!window.confirm(`Delete employee ${username}?\n\nThis will also delete all associated login/logout logs.`)) return;

    const loadingToast = toast.loading(`Deleting ${username}...`);

    try {
      const res = await fetch(`${API_BASE}/employees/${username}/`, {
        method: "DELETE",
      });

      if (!res.ok) {
        let errorMsg = "Failed to delete employee";
        try {
          const errorData = await res.json();
          errorMsg = errorData.detail || JSON.stringify(errorData);
        } catch {
          errorMsg = `${res.status} ${res.statusText}`;
        }
        console.error("Delete error:", errorMsg);
        toast.error(errorMsg, {
          id: loadingToast,
          duration: 4000,
        });
        return;
      }

      toast.success(`Employee ${username} deleted successfully!`, {
        id: loadingToast,
        duration: 3000,
      });
      loadEmployees();
    } catch (err) {
      console.error("Failed to delete employee:", err);
      toast.error("Network error. Please try again.", { 
        id: loadingToast,
        duration: 4000,
      });
    }
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      username: emp.username,
      first_name: emp.first_name,
      last_name: emp.last_name,
      position: emp.position,
      password: "", // Leave blank, only update if user enters new password
    });
    setShowEditModal(true);
  };

  if (!employee) return null;

  const getInitials = (fname, lname) => {
    return (fname.charAt(0) + lname.charAt(0)).toUpperCase();
  };

  const getAvatarColor = (index) => {
    const colors = [
      "bg-teal-500",
      "bg-purple-500",
      "bg-emerald-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-amber-500",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="bottom-right" />
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
              <p className="text-sm text-slate-500">Employee Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-lg">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow">
                {employee.first_name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-800">
                  {employee.first_name} {employee.last_name}
                </p>
                <p className="text-xs text-indigo-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Admin
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/cashier")}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition flex items-center gap-2 font-medium shadow"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Cashier
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2 font-medium shadow"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <LoadingSpinner message="Loading employees..." />
        ) : (
          <>
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Total Employees</p>
                <p className="text-4xl font-bold text-slate-800">{stats.totalEmployees}</p>
              </div>
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Admins</p>
                <p className="text-4xl font-bold text-slate-800">{stats.admins}</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Cashiers</p>
                <p className="text-4xl font-bold text-slate-800">{stats.cashiers}</p>
              </div>
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access - View Data (Modern Enhancement) */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">View Data</h3>
          <p className="text-sm text-slate-600 mb-4">Quick access to view system data (read-only)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/products")}
              className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:shadow-md transition text-left"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="font-semibold text-slate-800">Products</p>
              <p className="text-xs text-slate-600">Manage inventory</p>
            </button>

            <button
              onClick={() => navigate("/transactions")}
              className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:shadow-md transition text-left"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="font-semibold text-slate-800">Transactions</p>
              <p className="text-xs text-slate-600">View sales history</p>
            </button>

            <button
              onClick={() => navigate("/customers")}
              className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl hover:shadow-md transition text-left"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="font-semibold text-slate-800">Customers</p>
              <p className="text-xs text-slate-600">Customer database</p>
            </button>

            <button
              onClick={() => navigate("/rentals")}
              className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl hover:shadow-md transition text-left"
            >
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-semibold text-slate-800">Rentals</p>
              <p className="text-xs text-slate-600">Active rentals</p>
            </button>
          </div>
        </div>

        {/* Employees section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Employees</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-medium shadow"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Add Employee
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-500">No employees found. Add your first employee!</p>
              </div>
            ) : (
              employees.map((emp, i) => (
              <div
                key={emp.username}
                className={`p-4 rounded-xl border-2 relative ${
                  emp.position === "Admin"
                    ? "border-indigo-200 bg-indigo-50"
                    : "border-teal-200 bg-teal-50"
                } ${employee && emp.username === employee.username ? "ring-2 ring-indigo-500" : ""}`}
              >
                {employee && emp.username === employee.username && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow">
                    YOU
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-12 h-12 ${getAvatarColor(
                      i
                    )} rounded-full flex items-center justify-center text-white font-bold text-lg shadow`}
                  >
                    {getInitials(emp.first_name, emp.last_name)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">
                      {emp.first_name} {emp.last_name}
                    </p>
                    <p className="text-xs text-slate-500">@{emp.username}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-semibold border ${
                      emp.position === "Admin"
                        ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                        : "bg-teal-100 text-teal-700 border-teal-300"
                    }`}
                  >
                    <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d={
                          emp.position === "Admin"
                            ? "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            : "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        }
                        clipRule="evenodd"
                      />
                    </svg>
                    {emp.position}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(emp)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition text-sm font-medium text-slate-700 flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(emp.username)}
                    disabled={employee && emp.username === employee.username}
                    className={`flex-1 px-3 py-2 rounded-lg transition text-sm font-medium flex items-center justify-center gap-1 shadow ${
                      employee && emp.username === employee.username
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                    title={employee && emp.username === employee.username ? "Cannot delete your own account" : "Delete employee"}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
          </>
        )}
      </main>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Add New Employee</h2>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  minLength={3}
                  placeholder="At least 3 characters"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Position</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-xs text-slate-500">Minimum 6 characters required</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      username: "",
                      first_name: "",
                      last_name: "",
                      position: "Cashier",
                      password: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow order-1 sm:order-2"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Edit Employee: @{editingEmployee.username}
            </h2>
            <form onSubmit={handleEditEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Position</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                  minLength={6}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formData.password && (
                  <p className="mt-1 text-xs text-slate-500">Minimum 6 characters required</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEmployee(null);
                    setFormData({
                      username: "",
                      first_name: "",
                      last_name: "",
                      position: "Cashier",
                      password: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow order-1 sm:order-2"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
