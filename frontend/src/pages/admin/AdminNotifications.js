import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Package, ShoppingCart, Tag, Star, Bell, LogOut, Grid, Users, Plus, Edit2, Trash2, Send } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    type: 'info'
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const { data } = await axios.get(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Bildirişlər yüklənə bilmədi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${API}/notifications`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Bildiriş əlavə edildi');
      setShowModal(false);
      setFormData({ message: '', type: 'info' });
      fetchNotifications();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Bildiriş əlavə edilə bilmədi');
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Bu bildirişi silmək istədiyinizə əminsiniz?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Bildiriş silindi');
      fetchNotifications();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Bildiriş silinə bilmədi');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const getTypeBadge = (type) => {
    const badges = {
      info: 'bg-blue-100 text-blue-700',
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      promotion: 'bg-purple-100 text-purple-700'
    };
    const labels = {
      info: 'Məlumat',
      success: 'Uğur',
      warning: 'Xəbərdarlıq',
      promotion: 'Kampaniya'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[type] || 'bg-gray-100 text-gray-700'}`}>
        {labels[type] || type}
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
          <Link to="/admin/payments" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <Tag className="w-5 h-5" />
            <span>Ödənişlər</span>
          </Link>
          <Link to="/admin/reviews" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <Star className="w-5 h-5" />
            <span>Rəylər</span>
          </Link>
          <Link to="/admin/notifications" className="flex items-center gap-3 px-4 py-3 bg-white/20 rounded-lg">
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Bildirişlər</h2>
            <p className="text-[#5a7869]">Bildirişləri idarə edin</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#23B45D] text-white rounded-lg hover:bg-[#1e9d4f] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Bildiriş</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="bg-white rounded-xl border border-[#d4e8df] p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Bell className="w-5 h-5 text-[#23B45D]" />
                    {getTypeBadge(notification.type)}
                    <span className="text-sm text-gray-500">
                      {new Date(notification.created_at).toLocaleString('az-AZ')}
                    </span>
                  </div>
                  <p className="text-gray-900">{notification.message}</p>
                </div>
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-500">Bildiriş yoxdur</p>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6">Yeni Bildiriş Əlavə Et</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bildiriş Mesajı</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23B45D] focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bildiriş Növü</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23B45D] focus:border-transparent"
                >
                  <option value="info">Məlumat</option>
                  <option value="success">Uğur</option>
                  <option value="warning">Xəbərdarlıq</option>
                  <option value="promotion">Kampaniya</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ message: '', type: 'info' });
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#23B45D] text-white rounded-lg hover:bg-[#1e9d4f] transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Göndər</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
