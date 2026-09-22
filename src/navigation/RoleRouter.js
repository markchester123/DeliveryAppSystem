import React from 'react';
import { useAuth } from '../users';
import LoginScreen from '../layouts/auth/LoginScreen';
import CustomerLayout from '../layouts/customer/CustomerLayout';
import DriverLayout from '../layouts/driver/DriverLayout';
import StaffLayout from '../layouts/staff/StaffLayout';
import AdminLayout from '../layouts/admin/AdminLayout';

const LAYOUT_FOR_ROLE = {
  customer: CustomerLayout,
  driver: DriverLayout,
  staff: StaffLayout,
  admin: AdminLayout,
};

export default function RoleRouter() {
  const { user } = useAuth();
  if (!user) return <LoginScreen />;
  const Layout = LAYOUT_FOR_ROLE[user.role];
  return <Layout />;
}
