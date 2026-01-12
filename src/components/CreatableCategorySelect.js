"use client";

import { useState, useCallback, useEffect } from "react";
import Select from "react-select";
import { backendApi } from "@/services/api";
import { toast } from "react-toastify";

export default function CreatableCategorySelect({ value, onChange, className }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await backendApi.get("/categories");
      const cats = Array.isArray(res) ? res : (res?.content || []);
      setCategories(cats.map(cat => ({ value: cat.id, label: cat.name })));
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      toast.error("Failed to load categories");
    }
  }, []);

  const handleCreate = useCallback(async (inputValue) => {
    try {
      setLoading(true);
      const newCategory = await backendApi.post("/categories", { 
        name: inputValue, 
        active: true 
      });
      const newOption = { value: newCategory.id, label: newCategory.name };
      setCategories(prev => [...prev, newOption]);
      onChange(newOption.value);
      toast.success("Category created successfully");
      return newOption;
    } catch (err) {
      console.error("Failed to create category:", err);
      toast.error("Failed to create category");
      return null;
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const selectedOption = categories.find(cat => cat.value === value);

  return (
    <Select
      value={selectedOption}
      onChange={(option) => onChange(option?.value || "")}
      options={categories}
      onCreateOption={handleCreate}
      isLoading={loading}
      isClearable
      placeholder="Select or create category..."
      className={className}
      classNamePrefix="react-select"
      styles={{
        control: (base) => ({
          ...base,
          minHeight: '42px',
          border: '1px solid #cbd5e1',
          '&:hover': { borderColor: '#3b82f6' },
        }),
        menu: (base) => ({
          ...base,
          zIndex: 50,
        }),
      }}
    />
  );
}
