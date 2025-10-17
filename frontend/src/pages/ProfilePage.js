import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Copy, CreditCard, Lock, Users, Gift, User, Package, Camera, MapPin, Phone, Mail, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProfilePage = () => {
  const { user, loading, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (user) {
      fetchProfileData();
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchProfileData = async () => {
    try {
      const { data } = await axios.get(`${API}/user/profile`, { withCredentials: true });
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const { data } = await axios.get(`${API}/user/orders`, { withCredentials: true });
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Sifarişlər yüklənə bilmədi');
    } finally {
      setLoadingOrders(false);
    }
  };

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: ''
  });

  useEffect(() => {
    if (profileData) {
      setProfileForm({
        name: profileData.name || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        city: profileData.city || '',
        postal_code: profileData.postal_code || ''
      });
    }
  }, [profileData]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/user/profile`, profileForm, { withCredentials: true });
      toast.success('Profil yeniləndi!');
      await fetchProfileData();
      await checkAuth();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Xəta baş verdi');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await axios.post(`${API}/user/upload-avatar`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Şəkil yükləndi!');
      await fetchProfileData();
      await checkAuth();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Şəkil yüklənə bilmədi');
    }
  };

  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardHolder: '',
    month: '',
    year: '',
    cvv: ''
  });

  const handleAddCard = async (e) => {
    e.preventDefault();
    
    if (cardForm.cardNumber.length !== 16) {
      toast.error('Kart nömrəsi 16 rəqəm olmalıdır');
      return;
    }

    try {
      await axios.post(`${API}/user/cards`, {
        last4: cardForm.cardNumber.slice(-4),
        brand: 'VISA',
        exp_month: cardForm.month,
        exp_year: cardForm.year
      }, { withCredentials: true });
      
      toast.success('Kart əlavə edildi!');
      setCardForm({ cardNumber: '', cardHolder: '', month: '', year: '' });
      await fetchProfileData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Kart əlavə edilə bilmədi');
    }
  };

  const handleDeleteCard = async (last4) => {
    try {
      await axios.delete(`${API}/user/cards/${last4}`, { withCredentials: true });
      toast.success('Kart silindi!');
      await fetchProfileData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Kart silinə bilmədi');
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(profileData?.referral_code || '');
    toast.success('Referral kodu kopyalandı!');
  };

  if (loading || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#23B45D', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" style={{ color: '#23B45D' }} />
                <span className="text-xl font-bold">ATABUY</span>
              </Link>
            </div>
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
              Ana səhifə
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[280px,1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Avatar */}
            <div className="bg-white rounded-2xl p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4" style={{ borderColor: '#23B45D' }}>
                  {profileData.picture ? (
                    <img src={profileData.picture} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 rounded-full bg-white border-2 cursor-pointer hover:bg-gray-50" style={{ borderColor: '#23B45D' }}>
                  <Camera className="w-4 h-4" style={{ color: '#23B45D' }} />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
              <h3 className="font-bold text-lg">{profileData.name}</h3>
              <p className="text-sm text-gray-600">{profileData.email}</p>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-2xl p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile' ? 'text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={activeTab === 'profile' ? { backgroundColor: '#23B45D' } : {}}
                >
                  <User className="w-5 h-5" />
                  <span>Profil Məlumatları</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'orders' ? 'text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={activeTab === 'orders' ? { backgroundColor: '#23B45D' } : {}}
                >
                  <Package className="w-5 h-5" />
                  <span>Sifarişlərim</span>
                </button>

                <button
                  onClick={() => setActiveTab('cards')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'cards' ? 'text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={activeTab === 'cards' ? { backgroundColor: '#23B45D' } : {}}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Kartlarım</span>
                </button>

                <button
                  onClick={() => setActiveTab('referral')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'referral' ? 'text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={activeTab === 'referral' ? { backgroundColor: '#23B45D' } : {}}
                >
                  <Gift className="w-5 h-5" />
                  <span>Referral</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Profil Məlumatları</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Ad Soyad</label>
                    <Input
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      placeholder="Ad Soyad"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Telefon</label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      placeholder="+994 XX XXX XX XX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Ünvan</label>
                    <Input
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                      placeholder="Küçə, ev nömrəsi"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Şəhər</label>
                      <Input
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                        placeholder="Bakı"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Poçt Kodu</label>
                      <Input
                        value={profileForm.postal_code}
                        onChange={(e) => setProfileForm({...profileForm, postal_code: e.target.value})}
                        placeholder="AZ1000"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" style={{ backgroundColor: '#23B45D' }}>
                    Yadda saxla
                  </Button>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Sifarişlərim</h2>
                {loadingOrders ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#23B45D', borderTopColor: 'transparent' }}></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">Hələ sifarişiniz yoxdur</p>
                    <Link to="/products" className="inline-block mt-4 px-6 py-2 rounded-lg text-white" style={{ backgroundColor: '#23B45D' }}>
                      Alış-verişə başla
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg">#{order.id}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString('az-AZ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{order.total?.toFixed(2)} ₼</div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'airplane' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {order.status === 'confirmed' ? 'Təsdiqləndi' :
                               order.status === 'warehouse' ? 'Anbarda' :
                               order.status === 'airplane' ? 'Təyyarədə' :
                               order.status === 'atabuy_warehouse' ? 'AtaBuy Anbarı' :
                               order.status === 'delivered' ? 'Çatdırıldı' : order.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="border-t pt-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              {order.items?.length || 0} məhsul
                            </div>
                            <Link 
                              to={`/track-order?id=${order.id}`}
                              className="text-sm font-semibold hover:underline"
                              style={{ color: '#23B45D' }}
                            >
                              İzlə →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cards' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Kartlarım</h2>
                
                {/* Saved Cards */}
                {profileData.saved_cards && profileData.saved_cards.length > 0 && (
                  <div className="mb-8 space-y-3">
                    <h3 className="font-semibold mb-3">Saxlanılmış Kartlar</h3>
                    {profileData.saved_cards.map((card, idx) => (
                      <div key={idx} className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-8 h-8 text-gray-400" />
                          <div>
                            <div className="font-semibold">•••• {card.last4}</div>
                            <div className="text-sm text-gray-600">{card.brand} • {card.exp_month}/{card.exp_year}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCard(card.last4)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Card */}
                <div>
                  <h3 className="font-semibold mb-4">Yeni Kart Əlavə Et</h3>
                  <form onSubmit={handleAddCard} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Kart Nömrəsi</label>
                      <Input
                        value={cardForm.cardNumber}
                        onChange={(e) => setCardForm({...cardForm, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Kart Sahibi</label>
                      <Input
                        value={cardForm.cardHolder}
                        onChange={(e) => setCardForm({...cardForm, cardHolder: e.target.value})}
                        placeholder="AD SOYAD"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Ay</label>
                        <Input
                          value={cardForm.month}
                          onChange={(e) => setCardForm({...cardForm, month: e.target.value.replace(/\D/g, '').slice(0, 2)})}
                          placeholder="MM"
                          maxLength="2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">İl</label>
                        <Input
                          value={cardForm.year}
                          onChange={(e) => setCardForm({...cardForm, year: e.target.value.replace(/\D/g, '').slice(0, 2)})}
                          placeholder="YY"
                          maxLength="2"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" style={{ backgroundColor: '#23B45D' }}>
                      Kartı əlavə et
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'referral' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Referral Proqramı</h2>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-6" style={{ borderLeft: '4px solid #23B45D' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <Gift className="w-8 h-8" style={{ color: '#23B45D' }} />
                    <div>
                      <h3 className="font-bold text-lg">Dostlarını dəvət et, bonuslar qazan!</h3>
                      <p className="text-sm text-gray-600">Hər dost üçün 10 AZN bonus</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <label className="block text-sm font-medium mb-2">Sizin Referral Kodunuz</label>
                    <div className="flex gap-2">
                      <div className="flex-1 px-4 py-3 bg-gray-50 rounded-lg font-mono font-bold text-lg" style={{ color: '#23B45D' }}>
                        {profileData.referral_code}
                      </div>
                      <button
                        onClick={copyReferralCode}
                        className="px-4 py-3 rounded-lg text-white flex items-center gap-2"
                        style={{ backgroundColor: '#23B45D' }}
                      >
                        <Copy className="w-5 h-5" />
                        Kopyala
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold mb-2" style={{ color: '#23B45D' }}>0</div>
                    <div className="text-sm text-gray-600">Dəvət edilmiş dostlar</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold mb-2" style={{ color: '#23B45D' }}>{profileData.referral_bonus?.toFixed(2)} ₼</div>
                    <div className="text-sm text-gray-600">Qazanılmış bonus</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
