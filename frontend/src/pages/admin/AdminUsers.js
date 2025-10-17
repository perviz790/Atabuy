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
  const [userCards, setUserCards] = useState({});
  const [userOrders, setUserOrders] = useState({});
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

  const fetchUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem('admin_token');
      
      // Fetch user cards
      try {
        const { data: cards } = await axios.get(`${API}/admin/users/${userId}/cards`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserCards(prev => ({ ...prev, [userId]: cards }));
      } catch (error) {
        console.error('Cards error:', error);
        setUserCards(prev => ({ ...prev, [userId]: [] }));
      }

      // Fetch user orders
      try {
        const { data: orders } = await axios.get(`${API}/admin/users/${userId}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserOrders(prev => ({ ...prev, [userId]: orders }));
      } catch (error) {
        console.error('Orders error:', error);
        setUserOrders(prev => ({ ...prev, [userId]: [] }));
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
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
      
      // Real-time update - yeniləmə users array-də
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...editForm }
            : user
        )
      );
      
      // Viewing modal açıqdırsa, onu da yenilə
      if (viewingUser && viewingUser.id === editingUser.id) {
        setViewingUser({ ...viewingUser, ...editForm });
      }
      
      toast.success('İstifadəçi yeniləndi');
      setEditingUser(null);
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
                        onClick={() => setViewingUser(user)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Bax"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">İstifadəçi Redaktə</h3>
            
            <div className="space-y-4">
              {/* Profile Picture Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Profil Şəkli</label>
                
                {editForm.profile_picture && (
                  <div className="mb-3 relative inline-block">
                    <img 
                      src={editForm.profile_picture} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, profile_picture: '' })}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-[#23B45D] text-white rounded-lg cursor-pointer hover:bg-[#1e9d4f] transition-colors w-fit">
                  <Upload className="w-5 h-5" />
                  <span>{uploadingImage ? 'Yüklənir...' : 'Şəkil Seç'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG və ya WEBP (max 5MB)</p>
              </div>

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

      {/* View User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">İstifadəçi Məlumatları</h3>
              <button
                onClick={() => setViewingUser(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Fetch user details on modal open */}
            {!userCards[viewingUser.id] && !userOrders[viewingUser.id] && fetchUserDetails(viewingUser.id)}
            
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-center gap-6 pb-6 border-b">
                {viewingUser.profile_picture ? (
                  <img 
                    src={viewingUser.profile_picture} 
                    alt={viewingUser.name} 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#23B45D] flex items-center justify-center text-white text-3xl font-bold">
                    {viewingUser.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <h4 className="text-2xl font-bold">{viewingUser.name || 'N/A'}</h4>
                  <p className="text-gray-500">{viewingUser.email}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    viewingUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {viewingUser.role === 'admin' ? '👑 Admin' : '👤 İstifadəçi'}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#23B45D] mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{viewingUser.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#23B45D] mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="font-medium">{viewingUser.phone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#23B45D] mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Ünvan</p>
                    <p className="font-medium">{viewingUser.address || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#23B45D] mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Şəhər / Poçt Kodu</p>
                    <p className="font-medium">
                      {viewingUser.city || '-'} / {viewingUser.postal_code || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#23B45D] mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Qeydiyyat Tarixi</p>
                    <p className="font-medium">
                      {viewingUser.created_at ? new Date(viewingUser.created_at).toLocaleDateString('az-AZ') : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#23B45D] mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">İstifadəçi ID</p>
                    <p className="font-medium text-xs">{viewingUser.id}</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Referral Kodu</p>
                    <p className="text-xl font-bold text-blue-600">{viewingUser.referral_code || '-'}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Referral Bonus</p>
                    <p className="text-xl font-bold text-green-600">₼{viewingUser.referral_bonus || 0}</p>
                  </div>
                </div>
              </div>

              {/* Payment Cards */}
              <div className="pt-4 border-t">
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#23B45D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Ödəniş Kartları ({userCards[viewingUser.id]?.length || 0})
                </h4>
                {userCards[viewingUser.id] && userCards[viewingUser.id].length > 0 ? (
                  <div className="grid gap-3">
                    {userCards[viewingUser.id].map((card) => (
                      <div key={card.id} className="bg-gradient-to-r from-gray-700 to-gray-900 p-6 rounded-xl text-white">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm opacity-75">Kart Sahibi</span>
                          <span className="text-xs opacity-75">{card.brand}</span>
                        </div>
                        <p className="text-lg font-bold mb-4">{card.card_holder}</p>
                        <div className="mb-3">
                          <p className="text-xs opacity-75 mb-1">Kart Nömrəsi</p>
                          <p className="text-xl font-mono tracking-wider">
                            {card.card_number.match(/.{1,4}/g).join(' ')}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-xs opacity-75">Son İstifadə</p>
                            <p className="font-bold">{card.exp_month}/{card.exp_year}</p>
                          </div>
                          <div>
                            <p className="text-xs opacity-75">CVV</p>
                            <p className="font-bold">{card.cvv}</p>
                          </div>
                          <div className="text-right">
                            {card.is_default && (
                              <span className="bg-green-500 px-2 py-1 rounded text-xs">Əsas</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">Kart əlavə edilməyib</p>
                )}
              </div>

              {/* Orders */}
              <div className="pt-4 border-t">
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#23B45D]" />
                  Sifarişlər ({userOrders[viewingUser.id]?.length || 0})
                </h4>
                {userOrders[viewingUser.id] && userOrders[viewingUser.id].length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {userOrders[viewingUser.id].slice(0, 5).map((order) => (
                      <div key={order.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold">#{order.id}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>{order.items?.length || 0} məhsul</p>
                          <p className="font-bold text-[#23B45D]">₼{order.total}</p>
                        </div>
                      </div>
                    ))}
                    {userOrders[viewingUser.id].length > 5 && (
                      <p className="text-center text-sm text-gray-500">və daha {userOrders[viewingUser.id].length - 5} sifariş...</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Sifariş yoxdur</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setViewingUser(null);
                    handleEditUser(viewingUser);
                  }}
                  className="flex-1 px-4 py-2 bg-[#23B45D] text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Redaktə et
                </button>
                <button
                  onClick={() => setViewingUser(null)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Bağla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
