import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Package, ShoppingCart, Tag, Star, Bell, LogOut, Menu } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const { data } = await axios.get(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#FAFFFE]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-[#1a3d2e] to-[#2d5f4a] text-white p-6 z-50">
        <div className="mb-10">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display' }}>Atabuy Admin</h1>
        </div>
        
        <nav className="space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 bg-white/20 rounded-lg" data-testid="nav-dashboard">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/categories" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors" data-testid="nav-categories">
            <Menu className="w-5 h-5" />
            <span>Kateqoriyalar</span>
          </Link>
          <Link to="/admin/products" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors" data-testid="nav-products">
            <Package className="w-5 h-5" />
            <span>Məhsullar</span>
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors" data-testid="nav-orders">
            <ShoppingCart className="w-5 h-5" />
            <span>Sifarişlər</span>
          </Link>
          <Link to="/admin/kanban" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors" data-testid="nav-kanban">
            <LayoutDashboard className="w-5 h-5" />
            <span>Kanban Board</span>
          </Link>
          <Link to="/admin/coupons" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors" data-testid="nav-coupons">
            <Tag className="w-5 h-5" />
            <span>Kuponlar</span>
          </Link>
          <Link to="/admin/reviews" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors" data-testid="nav-reviews">
            <Star className="w-5 h-5" />
            <span>Rəylər</span>
          </Link>
          <Link to="/admin/notifications" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors" data-testid="nav-notifications">
            <Bell className="w-5 h-5" />
            <span>Bildirişlər</span>
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          data-testid="logout-btn"
        >
          <LogOut className="w-5 h-5" />
          <span>Çıxış</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" data-testid="dashboard-title">Dashboard</h2>
          <p className="text-[#5a7869]">Atabuy idarəetmə paneli</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-[#2d5f4a] border-t-transparent rounded-full"></div>
          </div>
        ) : stats && (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-[#d4e8df]" data-testid="stat-products">
                <p className="text-sm text-[#5a7869] mb-2">Məhsullar</p>
                <p className="text-4xl font-bold text-[#2d5f4a]">{stats.total_products}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-[#d4e8df]" data-testid="stat-orders">
                <p className="text-sm text-[#5a7869] mb-2">Sifarişlər</p>
                <p className="text-4xl font-bold text-[#2d5f4a]">{stats.total_orders}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-[#d4e8df]" data-testid="stat-revenue">
                <p className="text-sm text-[#5a7869] mb-2">Gəlir</p>
                <p className="text-4xl font-bold text-[#2d5f4a]">{stats.total_revenue} ₼</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-[#d4e8df]" data-testid="stat-pending">
                <p className="text-sm text-[#5a7869] mb-2">Gözləyən</p>
                <p className="text-4xl font-bold text-[#2d5f4a]">{stats.pending_orders}</p>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-2xl p-6 border border-[#d4e8df]">
              <h3 className="text-xl font-bold mb-6" data-testid="top-products-title">Ən Yaxşı Məhsullar</h3>
              <div className="space-y-4">
                {stats.top_products.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-[#F5FBF8] rounded-xl" data-testid={`top-product-${idx}`}>
                    <div>
                      <p className="font-semibold text-[#0d291e]">{product.title}</p>
                      <p className="text-sm text-[#5a7869]">Qiymət: {product.price} ₼</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#5a7869]">Reytinq</p>
                      <p className="font-semibold text-[#2d5f4a]">{product.rating} ⭐</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;