"use client";

import FieldDefinitionsPage from "@/components/dynamic-fields/FieldDefinitionsPage";

export default function BankFieldSettingsPage() {
  return (
    <FieldDefinitionsPage
      entityType="bank"
      title="Bank Field Settings"
      subtitle="Configure fields shown on Bank create/edit/view and list table."
    />
  );
}
