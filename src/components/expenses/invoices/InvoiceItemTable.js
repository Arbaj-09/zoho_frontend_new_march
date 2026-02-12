'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import AddEditItemDialog from './AddEditItemDialog';
import ProductSelectionModal from './ProductSelectionModal';

export default function InvoiceItemTable({ items, includeGst, onAddItem, onUpdateItem, onDeleteItem }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleAddItem = (item) => {
    onAddItem(item);
    setShowAddDialog(false);
  };

  const handleEditItem = (item) => {
    onUpdateItem(editingIndex, item);
    setEditingItem(null);
    setEditingIndex(null);
  };

  const handleEditClick = (index, item) => {
    setEditingItem(item);
    setEditingIndex(index);
  };

  const calculateItemTotals = (item) => {
    const amount = item.qty * item.rate;
    const cgst = includeGst ? amount * 0.09 : 0;
    const sgst = includeGst ? amount * 0.09 : 0;
    const total = amount + cgst + sgst;
    return { amount, cgst, sgst, total };
  };

  return (
    <div>
      {/* Add Item Button */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => setShowProductModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Items Table */}
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          No items added. Click "Add Item" to insert items.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                {includeGst && (
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GST Rate
                  </th>
                )}
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                {includeGst && (
                  <>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CGST
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SGST
                    </th>
                  </>
                )}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => {
                const { amount, cgst, sgst, total } = calculateItemTotals(item);
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.name}
                    </td>
                    {includeGst && (
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        18%
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-900 text-center">
                      {item.qty % 1 === 0 ? item.qty.toString() : item.qty}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatCurrency(amount)}
                    </td>
                    {includeGst && (
                      <>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatCurrency(cgst)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatCurrency(sgst)}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(total)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditClick(index, item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Item Dialog */}
      {showAddDialog && (
        <AddEditItemDialog
          title="Add Item"
          initialData={{ name: '', qty: 1, rate: 0 }}
          onSave={handleAddItem}
          onCancel={() => setShowAddDialog(false)}
        />
      )}

      {/* Product Selection Modal */}
      {showProductModal && (
        <ProductSelectionModal
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          onAddItem={onAddItem}
        />
      )}

      {/* Edit Item Dialog */}
      {editingItem && (
        <AddEditItemDialog
          title="Edit Item"
          initialData={editingItem}
          onSave={handleEditItem}
          onCancel={() => {
            setEditingItem(null);
            setEditingIndex(null);
          }}
        />
      )}
    </div>
  );
}
