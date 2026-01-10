"use client";

import { useState, useEffect } from "react";
import { Search, X, ChevronRight } from "lucide-react";
import { backendApi } from "@/services/api";

export default function SearchSelectModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  entityType, 
  placeholder = "Search..." 
}) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen, entityType]);

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = entityType === "product" ? "/products" : "/banks";
      const res = await backendApi.get(endpoint);
      const data = Array.isArray(res) ? res : (res?.content || []);
      setItems(data);
    } catch (err) {
      console.error(`Failed to fetch ${entityType}s:`, err);
      setError(`Failed to load ${entityType}s`);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    if (entityType === "product") {
      return (
        item.name?.toLowerCase().includes(q) ||
        item.productName?.toLowerCase().includes(q) ||
        item.sku?.toLowerCase().includes(q) ||
        item.productCode?.toLowerCase().includes(q)
      );
    } else {
      return (
        item.name?.toLowerCase().includes(q) ||
        item.bankName?.toLowerCase().includes(q) ||
        item.branch?.toLowerCase().includes(q) ||
        item.branchName?.toLowerCase().includes(q) ||
        item.owner?.toLowerCase().includes(q)
      );
    }
  });

  const handleSelect = (item) => {
    // Normalize the item data
    const normalizedItem = {
      ...item,
      name: item.name || item.productName || item.bankName,
      price: item.price || item.unitPrice,
      sku: item.sku || item.productCode,
      branch: item.branch || item.branchName,
    };
    
    onSelect(normalizedItem);
    onClose();
    setSearch("");
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
        <div
          className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/50 animate-slideInRight"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-slate-200/80 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Select {entityType === "product" ? "Product" : "Bank"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose a {entityType} to associate with this deal
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[70vh] flex-1 overflow-y-auto px-6 py-4">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        {entityType === "product" ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {item.name || item.productName || item.bankName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {entityType === "product" ? (
                            <>
                              {item.sku || item.productCode} • ${item.price || item.unitPrice || 0}
                            </>
                          ) : (
                            <>
                              {item.branch || item.branchName} • {item.owner}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                ))}

                {filteredItems.length === 0 && !loading && (
                  <div className="text-center py-8 text-sm text-slate-500 border-2 border-dashed border-slate-300 rounded-lg">
                    No {entityType}s found
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200/80 px-6 py-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
