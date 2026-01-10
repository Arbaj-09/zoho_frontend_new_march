"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Eye, Settings, X } from "lucide-react";
import { backendApi } from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CustomFieldsModal from "@/components/CustomFieldsModal";
import { toast } from "react-toastify";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({ name: "", sku: "", description: "", price: "", category: "", categoryId: "" });
  const [customFields, setCustomFields] = useState({});
  const [showCustomFieldsModal, setShowCustomFieldsModal] = useState(false);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await backendApi.get("/products");
      const productsData = Array.isArray(res) ? res : (res?.content || []);
      setProducts(productsData);
      // If currently editing a product that no longer exists, close modal and clear selection
      if (selectedProduct && !productsData.some(p => p.id === selectedProduct.id)) {
        setShowCreateModal(false);
        setSelectedProduct(null);
      }
      
      // Extract dynamic columns from custom fields
      const dynamicKeys = new Set();
      productsData.forEach(product => {
        if (product.customFields) {
          Object.keys(product.customFields).forEach(key => dynamicKeys.add(key));
        }
      });
      setDynamicColumns([...dynamicKeys]);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await backendApi.get("/categories");
      setCategories(Array.isArray(res) ? res : (res?.content || []));
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Helper function to format field names
  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const filtered = products.filter((p) =>
    (p.productName || p.name)?.toLowerCase().includes(search.toLowerCase()) ||
    (p.productCode || p.sku)?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateOrUpdate = async () => {
    try {
      // Get logged-in user data
      const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user_data') || '{}') : {};
      
      // Backend will set ownerId from authentication token
      const employeeId = userData.id;
      if (!employeeId) {
        toast.error("User not logged in. Please login again.");
        return;
      }
      
      // Don't send ownerId from frontend - backend will set it from authenticated user
      const payload = {
        productName: form.name,
        productCode: form.sku,
        description: form.description,
        unitPrice: Number(form.price) || 0,
        categoryId: form.categoryId || null,
        // ownerId: ownerId, // Backend will set this from authentication
        active: true,
        customFields: customFields,
      };
      
      console.log('Sending payload:', payload);
      
      if (selectedProduct) {
        if (!selectedProduct?.id) {
          toast.error("Selected product no longer exists. Reloading list...");
          await fetchProducts();
          setShowCreateModal(false);
          setSelectedProduct(null);
          return;
        }
        await backendApi.put(`/products/${selectedProduct.id}`, payload);
        toast.success("Product updated successfully");
      } else {
        await backendApi.post("/products", payload);
        toast.success("Product created successfully");
      }
      
      // Refresh list
      await fetchProducts();
      
      // Reset form and close modal
      setShowCreateModal(false);
      setSelectedProduct(null);
      setForm({ name: "", sku: "", description: "", price: "", category: "", categoryId: "" });
      setCustomFields({});
    } catch (err) {
      console.error("Save failed:", err);
      const isNotFound = err?.status === 404 || err?.data?.status === 404 || /not\s*found/i.test(err?.message || "");
      if (isNotFound) {
        toast.error("Product not found. Reloading list...");
        await fetchProducts();
        setShowCreateModal(false);
        setSelectedProduct(null);
        return;
      }
      const errorMsg = err?.data?.message || err?.message || "Unknown error";
      toast.error(`Failed to save product: ${errorMsg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await backendApi.delete(`/products/${id}`);
      // Optimistic UI update to prevent stale row edits
      setProducts(prev => prev.filter(p => p.id !== id));
      // If we were editing this product, close the modal and clear selection
      if (selectedProduct?.id === id) {
        setShowCreateModal(false);
        setSelectedProduct(null);
      }
      toast.success("Product deleted successfully");
      // Also refetch to guarantee sync with backend
      await fetchProducts();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete product");
    }
  };

  const openEdit = (product) => {
    // Use product data directly from table row (no detail API call)
    setSelectedProduct(product);
    setForm({
      name: product.productName || product.name || "",
      sku: product.productCode || product.sku || "",
      description: product.description || "",
      price: product.unitPrice || product.price || "",
      category: product.category || "",
      categoryId: product.categoryId || "",
    });
    setCustomFields(product.customFields || {});
    setShowCreateModal(true);
  };

  const openDetails = (product) => {
    setSelectedProduct(product);
    setShowDetailsDrawer(true);
  };

  return (
    <DashboardLayout
      header={{
        project: 'Products',
        user: { name: 'Admin User', role: 'Administrator' },
        notifications: [],
      }}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-slate-900">Products</div>
            <p className="text-sm text-slate-500">All products list</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <span className="text-lg leading-none">+</span>
              <span>Add Product</span>
            </button>
          </div>
        </div>

      <div className="mb-4 flex items-center gap-2 border rounded px-3 py-2 w-96">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Price
                  </th>
                  {/* Dynamic custom fields columns */}
                  {dynamicColumns.map(col => (
                    <th key={col} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      {formatLabel(col)}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {product.productName || product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {product.productCode || product.sku || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {product.category || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      ${product.unitPrice || product.price || 0}
                    </td>
                    {/* Dynamic custom fields data */}
                    {dynamicColumns.map(col => (
                      <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {product.customFields?.[col] || "-"}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openDetails(product)}
                          className="text-green-600 hover:text-green-800"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(product)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
            <div
              className="relative w-full max-w-2xl h-[80vh] transform overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/50 animate-slideInRight flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-200/80 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {selectedProduct ? "Edit Product" : "Create Product"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedProduct ? "Update product information" : "Add a new product to your catalog"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-6 max-h-full">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Product Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        SKU / Code
                      </label>
                      <input
                        type="text"
                        value={form.sku}
                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        placeholder="Enter SKU or product code"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                      placeholder="Enter product description"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Category
                      </label>
                      <select
                        value={form.categoryId}
                        onChange={(e) => setForm({ ...form, categoryId: e.target.value, category: e.target.options[e.target.selectedIndex].text })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name || cat.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Price ($) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Settings className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">Custom Fields</div>
                        <div className="text-xs text-slate-500">Add custom fields to this product</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCustomFieldsModal(true)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Configure
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200/80 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    <span className="text-rose-500">*</span> Required fields
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateOrUpdate}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      {selectedProduct ? "Update Product" : "Create Product"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Details Drawer */}
      {showDetailsDrawer && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-end z-50">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Product Details</h2>
              <button onClick={() => setShowDetailsDrawer(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div><strong>Name:</strong> {selectedProduct.productName || selectedProduct.name}</div>
              <div><strong>SKU:</strong> {selectedProduct.productCode || selectedProduct.sku}</div>
              <div><strong>Description:</strong> {selectedProduct.description}</div>
              <div><strong>Category:</strong> {selectedProduct.category}</div>
              <div><strong>Price:</strong> ${selectedProduct.unitPrice || selectedProduct.price}</div>
            </div>
          </div>
        </div>
      )}

      <CustomFieldsModal
        isOpen={showCustomFieldsModal}
        onClose={() => setShowCustomFieldsModal(false)}
        entityType="Product"
        initialFields={customFields}
        onSave={(fields) => {
          setCustomFields(fields);
          setShowCustomFieldsModal(false);
        }}
      />
      </div>
    </DashboardLayout>
  );
}
