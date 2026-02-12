'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function LogoSignatureUpload({ 
  type = 'logo', 
  value, 
  onChange, 
  maxSize = 2 * 1024 * 1024, // 2MB
  accept = 'image/*'
}) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(value || null);

  // 🔥 CRITICAL FIX: Update preview when value prop changes (edit mode)
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFile = (file) => {
    if (file && file.size <= maxSize) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setPreview(result);
        onChange(result);
      };
      reader.readAsDataURL(file);
    } else {
      alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const removeImage = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {type === 'logo' ? 'Company Logo' : 'Signature'}
      </label>
      
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt={type === 'logo' ? 'Company Logo' : 'Signature'}
            className={`object-cover border border-gray-200 rounded-lg ${
              type === 'logo' ? 'w-32 h-20' : 'w-48 h-24'
            }`}
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
            id={`${type}-upload`}
          />
          <label
            htmlFor={`${type}-upload`}
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              {type === 'logo' ? 'Upload company logo' : 'Upload signature'}
            </span>
            <span className="text-xs text-gray-500">
              PNG, JPG, GIF up to {maxSize / (1024 * 1024)}MB
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
