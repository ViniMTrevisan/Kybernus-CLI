import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './shared/theme/ThemeProvider';
import { Layout } from './shared/components/Layout';
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { NotFoundPage } from './shared/pages/NotFoundPage';
import { useAuthStore } from './modules/auth/useAuthStore';

// Auth
import { LoginPage } from './modules/auth/pages/LoginPage';
import { RegisterPage } from './modules/auth/pages/RegisterPage';
import { ForgotPasswordPage } from './modules/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './modules/auth/pages/ResetPasswordPage';

// Catalog
import { ProductListPage } from './modules/catalog/pages/ProductListPage';
import { ProductDetailPage } from './modules/catalog/pages/ProductDetailPage';

// Cart
import { CartPage } from './modules/cart/pages/CartPage';

// Checkout
import { CheckoutPage } from './modules/checkout/pages/CheckoutPage';
import { CheckoutSuccessPage } from './modules/checkout/pages/CheckoutSuccessPage';

// Profile
import { ProfilePage } from './modules/profile/pages/ProfilePage';

// Orders
import { OrderHistoryPage } from './modules/orders/pages/OrderHistoryPage';
import { OrderDetailPage } from './modules/orders/pages/OrderDetailPage';

// Admin
import { DashboardPage } from './modules/admin/pages/DashboardPage';
import { UsersAdminPage } from './modules/admin/pages/UsersAdminPage';
import { ProductsAdminPage } from './modules/admin/pages/ProductsAdminPage';
import { OrdersAdminPage } from './modules/admin/pages/OrdersAdminPage';
import { CouponsAdminPage } from './modules/admin/pages/CouponsAdminPage';

// Legal
import { TermsOfServicePage } from './modules/legal/pages/TermsOfServicePage';
import { PrivacyPolicyPage } from './modules/legal/pages/PrivacyPolicyPage';

function AppRoutes() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    void init();
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public */}
          <Route index element={<ProductListPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />

          {/* Cart — accessible to all (authenticated or not) */}
          <Route path="cart" element={<CartPage />} />

          {/* Protected — any logged-in user */}
          <Route
            path="checkout"
            element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>}
          />
          <Route
            path="checkout/success"
            element={<ProtectedRoute><CheckoutSuccessPage /></ProtectedRoute>}
          />
          <Route
            path="profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />
          <Route
            path="orders"
            element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>}
          />
          <Route
            path="orders/:id"
            element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>}
          />

          {/* Protected — ADMIN only */}
          <Route
            path="admin"
            element={<ProtectedRoute requiredRole="ADMIN"><DashboardPage /></ProtectedRoute>}
          />
          <Route
            path="admin/users"
            element={<ProtectedRoute requiredRole="ADMIN"><UsersAdminPage /></ProtectedRoute>}
          />
          <Route
            path="admin/products"
            element={<ProtectedRoute requiredRole="ADMIN"><ProductsAdminPage /></ProtectedRoute>}
          />
          <Route
            path="admin/orders"
            element={<ProtectedRoute requiredRole="ADMIN"><OrdersAdminPage /></ProtectedRoute>}
          />
          <Route
            path="admin/coupons"
            element={<ProtectedRoute requiredRole="ADMIN"><CouponsAdminPage /></ProtectedRoute>}
          />

          {/* Legal — public */}
          <Route path="terms" element={<TermsOfServicePage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
