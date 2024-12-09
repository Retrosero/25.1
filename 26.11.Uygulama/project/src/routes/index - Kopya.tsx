import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { ProtectedRoute } from '../components/layout/protected-route';
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
import { OrdersPage } from '../pages/orders';
import { OrderPreparationPage } from '../pages/orders/preparation';
import { OrderRoutePage } from '../pages/orders/route';
import { OrderDeliveryPage } from '../pages/orders/delivery';
import { CompletedDeliveriesPage } from '../pages/orders/completed-deliveries';
import { UsersPage } from '../pages/users';
import { NotificationsPage } from '../pages/notifications';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute permission="settings.edit">
            <UsersPage />
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />

        <Route path="/customers" element={
          <ProtectedRoute permission="customers.view">
            <CustomersPage />
          </ProtectedRoute>
        } />

        <Route path="/customers/:id" element={
          <ProtectedRoute permission="customers.view">
            <CustomerDetailPage />
          </ProtectedRoute>
        } />

        <Route path="/sales" element={
          <ProtectedRoute permission="sales.create">
            <SalesPage />
          </ProtectedRoute>
        } />

        <Route path="/payments" element={
          <ProtectedRoute permission="payments.create">
            <PaymentsPage />
          </ProtectedRoute>
        } />

        <Route path="/daily-report" element={
          <ProtectedRoute permission="reports.view">
            <DailyReportPage />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute permission="settings.view">
            <SettingsPage />
          </ProtectedRoute>
        } />

        <Route path="/products" element={
          <ProtectedRoute permission="settings.view">
            <ProductsPage />
          </ProtectedRoute>
        } />

        <Route path="/approvals" element={
          <ProtectedRoute permission="approvals.view">
            <ApprovalsPage />
          </ProtectedRoute>
        } />

        <Route path="/returns" element={
          <ProtectedRoute>
            <ReturnsPage />
          </ProtectedRoute>
        } />

        <Route path="/inventory/count" element={
          <ProtectedRoute>
            <InventoryCountPage />
          </ProtectedRoute>
        } />

        <Route path="/inventory/lists" element={
          <ProtectedRoute>
            <InventoryListsPage />
          </ProtectedRoute>
        } />

        <Route path="/inventory/completed" element={
          <ProtectedRoute>
            <CompletedInventoryPage />
          </ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute permission="orders.view">
            <OrdersPage />
          </ProtectedRoute>
        } />

        <Route path="/orders/preparation/:id" element={
          <ProtectedRoute permission="orders.prepare">
            <OrderPreparationPage />
          </ProtectedRoute>
        } />

        <Route path="/orders/route" element={
          <ProtectedRoute permission="orders.deliver">
            <OrderRoutePage />
          </ProtectedRoute>
        } />

        <Route path="/orders/delivery" element={
          <ProtectedRoute permission="orders.deliver">
            <OrderDeliveryPage />
          </ProtectedRoute>
        } />

        <Route path="/orders/completed-deliveries" element={
          <ProtectedRoute permission="orders.view">
            <CompletedDeliveriesPage />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}