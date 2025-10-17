import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import SplashScreen from './components/SplashScreen';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminCategories from './pages/admin/AdminCategories';
import AdminKanban from './pages/admin/AdminKanban';
import { AdminProducts, AdminOrders, AdminCoupons, AdminReviews, AdminNotifications } from './pages/admin/AdminPlaceholders';
import ChatWidget from './components/ChatWidget';
import { Toaster } from './components/ui/sonner';

function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check if splash already shown in this session
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('splashShown', 'true');
  };

  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/admin/login" />;
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <FavoritesProvider>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="/track-order" element={<OrderTrackingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin setToken={setToken} />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/kanban" element={<ProtectedRoute><AdminKanban /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/coupons" element={<ProtectedRoute><AdminCoupons /></ProtectedRoute>} />
            <Route path="/admin/reviews" element={<ProtectedRoute><AdminReviews /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute><AdminNotifications /></ProtectedRoute>} />
          </Routes>
          
          {/* AI Chat Widget - only on public pages */}
          {!window.location.pathname.startsWith('/admin') && <ChatWidget />}
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;