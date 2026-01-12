"use client";

import FieldDefinitionsPage from "@/components/dynamic-fields/FieldDefinitionsPage";

export default function ProductFieldSettingsPage() {
  return (
    <FieldDefinitionsPage
      entityType="product"
      title="Product Field Settings"
      subtitle="Configure fields shown on Product create/edit/view and list table."
    />
  );
}
