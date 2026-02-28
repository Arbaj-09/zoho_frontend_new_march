'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';

export default function AdminLayout({ children }) {
  return (
    <DashboardLayout header={{ title: 'Customer Address Requests' }}>
      {children}
    </DashboardLayout>
  );
}
