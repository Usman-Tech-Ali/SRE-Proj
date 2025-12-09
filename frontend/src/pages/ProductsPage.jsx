import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const API_BASE = "http://localhost:8000/api";

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    is_rental: false,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products/`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Adding product...");

    try {
      const res = await fetch(`${API_BASE}/products/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: parseInt(formData.id),
          name: formData.name,
          price: parseFloat(formData.price),
          is_rental: formData.is_rental,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(`Failed: ${JSON.stringify(error)}`, { id: loadingToast });
        return;
      }

      toast.success("Product added successfully!", { id: loadingToast });
      setShowAddModal(false);
      setFormData({ id: "", name: "", price: "", is_rental: false });
      loadProducts();
    } catch (err) {
      console.error("Failed to add product:", err);
      toast.error("Network error", { id: loadingToast });
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Updating product...");

    try {
      const res = await fetch(`${API_BASE}/products/${editingProduct.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          is_rental: formData.is_rental,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(`Failed: ${JSON.stringify(error)}`, { id: loadingToast });
        return;
      }

      toast.success("Product updated successfully!", { id: loadingToast });
      setShowEditModal(false);
      setEditingProduct(null);
      setFormData({ id: "", name: "", price: "", is_rental: false });
      loadProducts();
    } catch (err) {
      console.error("Failed to update product:", err);
      toast.error("Network error", { id: loadingToast });
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm(`Delete product ${productId}?`)) return;

    const loadingToast = toast.loading(`Deleting product...`);

    try {
      const res = await fetch(`${API_BASE}/products/${productId}/`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Failed to delete product", { id: loadingToast });
        return;
      }

      toast.success("Product deleted successfully!", { id: loadingToast });
      loadProducts();
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error("Network error", { id: loadingToast });
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      is_rental: product.is_rental,
    });
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="bottom-right" />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              Products Management
            </h1>
            <p className="text-sm text-slate-500">Manage your product catalog</p>
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
          <LoadingSpinner message="Loading products..." />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Products ({products.length})
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-medium shadow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Price</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-slate-500">
                        No products found. Add your first product!
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-800">{product.id}</td>
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4 font-semibold text-green-600">${product.price}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                            product.is_rental
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {product.is_rental ? "Rental" : "Sale"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                            >
                              Delete
                            </button>
                          </div>
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
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Add Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Product ID</label>
                <input
                  type="number"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_rental}
                    onChange={(e) => setFormData({ ...formData, is_rental: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">Rental Item</span>
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ id: "", name: "", price: "", is_rental: false });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Edit Product</h2>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Product ID</label>
                <input
                  type="number"
                  value={formData.id}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_rental}
                    onChange={(e) => setFormData({ ...formData, is_rental: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">Rental Item</span>
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                    setFormData({ id: "", name: "", price: "", is_rental: false });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow"
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
