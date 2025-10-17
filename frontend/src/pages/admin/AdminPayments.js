import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Package, ShoppingCart, Tag, Star, Bell, LogOut, Grid, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    failed: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const { data } = await axios.get(`${API}/admin/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(data);

      // Calculate stats
      const stats = {
        total: data.length,
        paid: data.filter(p => p.payment_status === 'paid').length,
        pending: data.filter(p => p.payment_status === 'unpaid' || p.payment_status === 'pending').length,
        failed: data.filter(p => p.payment_status === 'failed').length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ödənişlər yüklənə bilmədi');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'bg-green-100 text-green-700',
      unpaid: 'bg-yellow-100 text-yellow-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700'
    };
    const labels = {
      paid: 'Ödənilib',
      unpaid: 'Ödənilməyib',
      pending: 'Gözləyir',
      failed: 'Uğursuz'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#23B45D', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFFFE]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-[#1a3d2e] to-[#2d5f4a] text-white p-6 z-50">
        <div className="mb-10">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display' }}>Atabuy Admin</h1>
        </div>
        
        <nav className="space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/categories" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <Grid className="w-5 h-5" />
            <span>Kateqoriyalar</span>
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <Users className="w-5 h-5" />
            <span>İstifadəçilər</span>
          </Link>
          <Link to="/admin/products" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <Package className="w-5 h-5" />
            <span>Məhsullar</span>
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <ShoppingCart className="w-5 h-5" />
            <span>Sifarişlər</span>
          </Link>
          <Link to="/admin/kanban" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span>Kanban Board</span>
          </Link>
          <Link to="/admin/payments" className="flex items-center gap-3 px-4 py-3 bg-white/20 rounded-lg">
            <DollarSign className="w-5 h-5" />
            <span>Ödənişlər</span>
          </Link>
          <Link to="/admin/reviews" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <Star className="w-5 h-5" />
            <span>Rəylər</span>
          </Link>
          <Link to="/admin/notifications" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span>Bildirişlər</span>
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Çıxış</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Ödənişlər</h2>
          <p className="text-[#5a7869]">Bütün ödəniş əməliyyatları</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-[#d4e8df] p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#5a7869]">Cəmi Ödənişlər</span>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl border border-[#d4e8df] p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#5a7869]">Ödənilib</span>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
          </div>

          <div className="bg-white rounded-xl border border-[#d4e8df] p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#5a7869]">Gözləyir</span>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-xl border border-[#d4e8df] p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#5a7869]">Uğursuz</span>
              <DollarSign className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl border border-[#d4e8df] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f0f7f4]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Session ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">İstifadəçi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Məbləğ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sifariş ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tarix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.session_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600">
                        {payment.session_id.substring(0, 20)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{payment.user_email}</p>
                        <p className="text-sm text-gray-500">{payment.user_id.substring(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#23B45D]">
                        {payment.amount} {payment.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payment.payment_status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm">
                        {payment.order_id || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(payment.created_at).toLocaleString('az-AZ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {payments.length === 0 && (
            <div className="text-center py-20">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl text-gray-500">Ödəniş yoxdur</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPayments;
