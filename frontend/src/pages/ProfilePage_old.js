import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Copy, CreditCard, Lock, Users, Gift } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('referral');
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#23B45D', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const referralCode = user.referral_code || 'N/A';
  const referralStats = {
    friends: 0,
    bonus: user.referral_bonus || 0
  };
  
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardHolder: '',
    month: '',
    year: '',
    cvv: ''
  });

  const copyReferralCode = () => {
    navigator.clipboard.writeText(`https://atabuy.az?ref=${referralCode}`);
    toast.success('Referal linki köçürüldü!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Şifrələr uyğun gəlmir');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Şifrə minimum 6 simvol olmalıdır');
      return;
    }
    toast.success('Şifrə uğurla dəyişdirildi!');
    setPasswordForm({ newPassword: '', confirmPassword: '' });
  };

  const handleCardSave = (e) => {
    e.preventDefault();
    toast.success('Kart məlumatları saxlanıldı!');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#23B45D] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg md:text-xl font-bold text-[#1B5E20]" style={{ fontFamily: 'Playfair Display' }}>Ata</span>
                <span className="text-lg md:text-xl font-bold text-[#23B45D]" style={{ fontFamily: 'Playfair Display' }}>Buy</span>
              </div>
            </Link>
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-[#23B45D]">← Ana səhifə</Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Profil</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('referral')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap ${activeTab === 'referral' ? 'bg-[#23B45D] text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <Gift className="w-5 h-5 inline mr-2" />
            Referal
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap ${activeTab === 'password' ? 'bg-[#23B45D] text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <Lock className="w-5 h-5 inline mr-2" />
            Şifrə
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap ${activeTab === 'cards' ? 'bg-[#23B45D] text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <CreditCard className="w-5 h-5 inline mr-2" />
            Kartlar
          </button>
        </div>

        {/* Referral Tab */}
        {activeTab === 'referral' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-gradient-to-br from-[#23B45D] to-[#23B45D] text-white rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold mb-2">Referal Sistemi</h2>
              <p className="text-white/90 mb-6">Dostlarını dəvət et, hər ikisi bonus qazanın!</p>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                <p className="text-sm text-white/80 mb-2">Sənin Referal Kodun</p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-2xl font-bold tracking-wider">{referralCode}</code>
                  <button
                    onClick={copyReferralCode}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-white/80" />
                  <p className="text-3xl font-bold">{referralStats.friends}</p>
                  <p className="text-sm text-white/80">Dəvət Etdiyin Dostlar</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <Gift className="w-8 h-8 mx-auto mb-2 text-white/80" />
                  <p className="text-3xl font-bold">₼{referralStats.bonus}</p>
                  <p className="text-sm text-white/80">Qazandığın Bonus</p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-[#E0F2E9] rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Necə işləyir?</h3>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#23B45D] text-white rounded-full flex items-center justify-center font-bold">1</span>
                  <div>
                    <p className="font-semibold">Referal linkini dostunla paylaş</p>
                    <p className="text-sm text-gray-600">Linkini WhatsApp, Instagram və ya SMS ilə göndər</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#23B45D] text-white rounded-full flex items-center justify-center font-bold">2</span>
                  <div>
                    <p className="font-semibold">Dostun qeydiyyatdan keçib 10₼-lik məhsul alsın</p>
                    <p className="text-sm text-gray-600">İlk alış-verişi tamamladıqda bonus aktivləşir</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#23B45D] text-white rounded-full flex items-center justify-center font-bold">3</span>
                  <div>
                    <p className="font-semibold">Sən avtomatik 10₼ bonus qazanırsan!</p>
                    <p className="text-sm text-gray-600">Bonusu istənilən məhsul alışında istifadə et</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="max-w-xl">
            <div className="bg-white border-2 border-[#E0F2E9] rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Şifrəni Dəyişdir</h2>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#1B5E20]">Yeni Şifrə</label>
                  <Input
                    type="password"
                    placeholder="Yeni şifrənizi daxil edin"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="border-[#E0F2E9] focus:border-[#23B45D]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#1B5E20]">Şifrəni Təsdiq Et</label>
                  <Input
                    type="password"
                    placeholder="Şifrəni yenidən daxil edin"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="border-[#E0F2E9] focus:border-[#23B45D]"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-[#23B45D] hover:bg-[#23B45D] text-white py-6 text-lg font-semibold rounded-xl">
                  Şifrəni Dəyişdir
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Cards Tab */}
        {activeTab === 'cards' && (
          <div className="max-w-2xl">
            <div className="bg-white border-2 border-[#E0F2E9] rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Ödəniş Kartları</h2>
              <form onSubmit={handleCardSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#1B5E20]">Kart Nömrəsi</label>
                  <Input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    value={cardForm.cardNumber}
                    onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                    className="border-[#E0F2E9] focus:border-[#23B45D]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#1B5E20]">Kart Sahibinin Adı</label>
                  <Input
                    type="text"
                    placeholder="AD SOYAD"
                    value={cardForm.cardHolder}
                    onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value.toUpperCase() })}
                    className="border-[#E0F2E9] focus:border-[#23B45D]"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#1B5E20]">Ay</label>
                    <Input
                      type="text"
                      placeholder="MM"
                      maxLength="2"
                      value={cardForm.month}
                      onChange={(e) => setCardForm({ ...cardForm, month: e.target.value })}
                      className="border-[#E0F2E9] focus:border-[#23B45D]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#1B5E20]">İl</label>
                    <Input
                      type="text"
                      placeholder="YY"
                      maxLength="2"
                      value={cardForm.year}
                      onChange={(e) => setCardForm({ ...cardForm, year: e.target.value })}
                      className="border-[#E0F2E9] focus:border-[#23B45D]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#1B5E20]">CVV</label>
                    <Input
                      type="text"
                      placeholder="123"
                      maxLength="3"
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                      className="border-[#E0F2E9] focus:border-[#23B45D]"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[#23B45D] hover:bg-[#23B45D] text-white py-6 text-lg font-semibold rounded-xl">
                  Kartı Saxla
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
