'use client';

import { useState, useEffect } from 'react';
import { Save, X, Download, Eye } from 'lucide-react';
import { invoiceService } from '@/services/invoiceService';
import InvoiceForm from '@/components/expenses/invoices/InvoiceForm';
import InvoicePreview from '@/components/expenses/invoices/InvoicePreview';

export default function InvoiceDetailPage({ params }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [params.invoiceId]);

  async function loadInvoice() {
    try {
      setLoading(true);
      const data = await invoiceService.getInvoice(params.invoiceId);
      setInvoice(data);
    } catch (err) {
      console.error('Failed to load invoice', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(invoiceData) {
    try {
      const updated = await invoiceService.updateInvoice(params.invoiceId, invoiceData);
      setInvoice(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save invoice', err);
    }
  }

  async function handleDownloadPdf() {
    try {
      await invoiceService.downloadInvoicePdf(params.invoiceId, invoice.invoiceNo);
    } catch (err) {
      console.error('Failed to download PDF', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading invoice...</div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-40 bg-white border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Edit Invoice</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
              </div>
            </div>
          </div>
        </div>
        <InvoiceForm
          initialData={invoice}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-40 bg-white border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Preview: Invoice #{invoice.invoiceNo}</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                  Back to Edit
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
        <InvoicePreview invoice={invoice} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Invoice #{invoice.invoiceNo}</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Save className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <InvoicePreview invoice={invoice} />
    </div>
  );
}
