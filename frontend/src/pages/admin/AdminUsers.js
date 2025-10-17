import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Users, ShoppingBag, Package, TrendingUp, LogOut, LayoutDashboard, ShoppingCart, Tag, Star, Bell, Grid, Shield, Trash2, Edit2, RefreshCw, Eye, X, Upload, Phone, MapPin, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    profile_picture: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const { data } = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setUsers(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('İstifadəçilər yüklənə bilmədi');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(
        `${API}/admin/users/${userId}/role`,
        { role: newRole },
        { 
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true 
        }
      );
      toast.success('Rol yeniləndi');
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Rol yenilənə bilmədi');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      postal_code: user.postal_code || '',
      profile_picture: user.profile_picture || ''
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Yalnız şəkil faylları yüklənə bilər');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Şəkil 5MB-dan böyük ola bilməz');
      return;
    }

    setUploadingImage(true);
    try {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await axios.post(`${API}/admin/upload-image`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setEditForm({ ...editForm, profile_picture: data.url });
      toast.success('Şəkil yükləndi');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Şəkil yüklənə bilmədi');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(
        `${API}/admin/users/${editingUser.id}/profile`,
        editForm,
        { 
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true 
        }
      );
      toast.success('İstifadəçi yeniləndi');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Yeniləmə xətası');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('İstifadəçini silmək istədiyinizə əminsiniz?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('İstifadəçi silindi');
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Silinə bilmədi');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#23B45D', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-[#23B45D] text-white p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-8 h-8" />
            ATABUY Admin
          </h2>
        </div>

        <nav className="space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 bg-white/20 rounded-lg transition-colors">
            <Users className="w-5 h-5" />
            <span>İstifadəçilər</span>
          </Link>
          <Link to="/admin/products" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <Package className="w-5 h-5" />
            <span>Məhsullar</span>
          </Link>
          <Link to="/admin/categories" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <Grid className="w-5 h-5" />
            <span>Kateqoriyalar</span>
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <ShoppingCart className="w-5 h-5" />
            <span>Sifarişlər</span>
          </Link>
          <Link to="/admin/kanban" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span>Kanban Board</span>
          </Link>
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem('admin_token');
            window.location.href = '/admin/login';
          }}
          className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Çıxış</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">İstifadəçi İdarəetməsi</h1>
            <p className="text-gray-600">Bütün qeydiyyatlı istifadəçilər</p>
          </div>
          <button 
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-[#23B45D] text-white rounded-lg hover:opacity-90"
          >
            <RefreshCw className="w-5 h-5" />
            Yenilə
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">İstifadəçi</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Telefon</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rol</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Qeydiyyat</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.picture ? (
                        <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#23B45D] flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold">{user.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-sm">{user.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('az-AZ') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Redaktə et"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Cəmi: {users.length} istifadəçi
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">İstifadəçi Redaktə</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ad Soyad</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Telefon</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ünvan</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Şəhər</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Poçt Kodu</label>
                  <input
                    type="text"
                    value={editForm.postal_code}
                    onChange={(e) => setEditForm({...editForm, postal_code: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateUser}
                className="flex-1 px-4 py-2 bg-[#23B45D] text-white rounded-lg hover:opacity-90"
              >
                Yadda saxla
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Ləğv et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
