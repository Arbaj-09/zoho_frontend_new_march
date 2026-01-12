"use client";

import FieldDefinitionsPage from "@/components/dynamic-fields/FieldDefinitionsPage";

export default function DealFieldSettingsPage() {
  return (
    <FieldDefinitionsPage
      entityType="deal"
      title="Deal Field Settings"
      subtitle="Configure fields shown on Deal create/edit/view and customer deal page."
    />
  );
}
