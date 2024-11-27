import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { LoginPage } from '../pages/login';
import { UnauthorizedPage } from '../pages/unauthorized';
import { DashboardPage } from '../pages/dashboard';
import { CustomersPage } from '../pages/customers';
import { CustomerDetailPage } from '../pages/customer-detail';
import { SalesPage } from '../pages/sales';
import { PaymentsPage } from '../pages/payments';
import { DailyReportPage } from '../pages/daily-report';
import { SettingsPage } from '../pages/settings';
import { ProductsPage } from '../pages/products';
import { ApprovalsPage } from '../pages/approvals';
import { ReturnsPage } from '../pages/returns';
import { InventoryCountPage } from '../pages/inventory/count';
import { InventoryListsPage } from '../pages/inventory/lists';
import { CompletedInventoryPage } from '../pages/inventory/completed';
import { OrdersPage } from '../pages/orders/index';
import { OrderPreparationPage } from '../pages/orders/preparation';
import { OrderRoutePage } from '../pages/orders/route';
import { OrderDeliveryPage } from '../pages/orders/delivery';
import { CompletedDeliveriesPage } from '../pages/orders/completed-deliveries';
import { UsersPage } from '../pages/users';
import { NotificationsPage } from '../pages/notifications';
import { ProtectedRoute } from '../components/layout/protected-route';

export function AppRoutes() {
  return (
    <Routes>
      {/* Login ve Yetkilendirme Sayfaları */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Ana Layout ile Sarılmış Rotalar */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <CustomersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute>
              <CustomerDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <SalesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/daily-report"
          element={
            <ProtectedRoute>
              <DailyReportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/approvals"
          element={
            <ProtectedRoute>
              <ApprovalsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/returns"
          element={
            <ProtectedRoute>
              <ReturnsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/count"
          element={
            <ProtectedRoute>
              <InventoryCountPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/lists"
          element={
            <ProtectedRoute>
              <InventoryListsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/completed"
          element={
            <ProtectedRoute>
              <CompletedInventoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/preparation/:id"
          element={
            <ProtectedRoute>
              <OrderPreparationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/route"
          element={
            <ProtectedRoute>
              <OrderRoutePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/delivery"
          element={
            <ProtectedRoute>
              <OrderDeliveryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/completed-deliveries"
          element={
            <ProtectedRoute>
              <CompletedDeliveriesPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Hatalı Rotayı Yönlendirme */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
