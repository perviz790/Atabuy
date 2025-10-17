import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_address: '',
    city: '',
    postal_code: '',
    card_number: '',
    card_holder: '',
    card_expiry: '',
    card_cvv: ''
  });

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Kupon kodu daxil edin');
      return;
    }

    // Local promo codes (demo)
    const promoCodes = {
      'ATA10': { type: 'percent', value: 10, description: '10% endirim' },
      'ATA20': { type: 'percent', value: 20, description: '20% endirim' },
      'YENI50': { type: 'fixed', value: 50, description: '50₼ endirim' }
    };

    const promo = promoCodes[couponCode.toUpperCase()];
    
    if (promo) {
      let discountAmount = 0;
      if (promo.type === 'percent') {
        discountAmount = subtotal * (promo.value / 100);
      } else {
        discountAmount = promo.value;
      }
      setDiscount(discountAmount);
      setCouponApplied(true);
      toast.success(`✅ ${promo.description} tətbiq edildi!`);
    } else {
      // Try backend validation
      try {
        const { data } = await axios.post(`${API}/coupons/validate?code=${couponCode}&subtotal=${subtotal}`);
        setDiscount(data.discount);
        setCouponApplied(true);
        toast.success(`Kupon təsdiq edildi! ${data.discount} ₼ endirim`);
      } catch (error) {
        toast.error('Yanlış kupon kodu');
        setDiscount(0);
        setCouponApplied(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast.error('Səbətiniz boşdur');
      return;
    }

    if (!formData.customer_name || !formData.customer_email || !formData.customer_phone || !formData.delivery_address) {
      toast.error('Bütün məlumatları doldurun');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        ...formData,
        items: cart,
        subtotal,
        discount,
        coupon_code: couponCode || null,
        total,
        status: 'pending',
        payment_status: 'pending'
      };

      const { data } = await axios.post(`${API}/orders`, orderData);
      
      localStorage.removeItem('cart');
      toast.success('Sifarişiniz uğurla qeyd edildi!');
      navigate(`/track-order?id=${data.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Sifariş zamanı xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFFFE] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-[#d4e8df] mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-4">Səbətiniz boşdur</h2>
          <Link to="/products" className="btn-primary">
            Məhsullara bax
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFFFE]">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2d5f4a] to-[#3d7a5f] flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display' }}>Atabuy</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8" data-testid="checkout-title">Ödəniş</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-[#d4e8df]">
              <div className="mb-6 p-4 bg-[#E8F5E9] rounded-xl border-l-4 border-[#00D084]">
                <p className="font-semibold text-[#1B5E20]">✈️ Məhsulunuz 20 gün ərzində çatdırılacaq</p>
                <p className="text-sm text-gray-600 mt-1">Təyyarə ilə sürətli, etibarlı və təhlükəsiz çatdırılma</p>
              </div>

              <h2 className="text-2xl font-bold mb-6" data-testid="delivery-info-title">Çatdırılma Ünvanı</h2>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#0d291e]">Ad və Soyad *</label>
                    <Input
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      placeholder="Adınız və soyadınız"
                      required
                      className="border-[#d4e8df] focus:border-[#00D084]"
                      data-testid="customer-name-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#0d291e]">Telefon *</label>
                    <Input
                      name="customer_phone"
                      type="tel"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      placeholder="+994 XX XXX XX XX"
                      required
                      className="border-[#d4e8df] focus:border-[#00D084]"
                      data-testid="customer-phone-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#0d291e]">Email *</label>
                  <Input
                    name="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    required
                    className="border-[#d4e8df] focus:border-[#00D084]"
                    data-testid="customer-email-input"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#0d291e]">Şəhər *</label>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Bakı"
                      required
                      className="border-[#d4e8df] focus:border-[#00D084]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#0d291e]">Poçt kodu *</label>
                    <Input
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      placeholder="AZ1000"
                      required
                      className="border-[#d4e8df] focus:border-[#00D084]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#0d291e]">Ünvan *</label>
                  <textarea
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleInputChange}
                    placeholder="Küçə, ev №, mənzil"
                    required
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-[#d4e8df] rounded-xl focus:border-[#00D084] focus:outline-none resize-none"
                    data-testid="delivery-address-input"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-xl font-bold mb-4">Ödəniş Məlumatları</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#0d291e]">Kart Nömrəsi *</label>
                      <Input
                        name="card_number"
                        value={formData.card_number}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        required
                        className="border-[#d4e8df] focus:border-[#00D084]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#0d291e]">Kart Sahibinin Adı *</label>
                      <Input
                        name="card_holder"
                        value={formData.card_holder}
                        onChange={(e) => setFormData({ ...formData, card_holder: e.target.value.toUpperCase() })}
                        placeholder="AD SOYAD"
                        required
                        className="border-[#d4e8df] focus:border-[#00D084]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-[#0d291e]">Son İstifadə *</label>
                        <Input
                          name="card_expiry"
                          value={formData.card_expiry}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          maxLength="5"
                          required
                          className="border-[#d4e8df] focus:border-[#00D084]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-[#0d291e]">CVV *</label>
                        <Input
                          name="card_cvv"
                          value={formData.card_cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          maxLength="3"
                          required
                          className="border-[#d4e8df] focus:border-[#00D084]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Payment Info */}
            <div className="bg-[#F5FBF8] rounded-2xl p-8 mt-6 border border-[#d4e8df]">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-[#2d5f4a]" />
                <h3 className="text-xl font-semibold">Ödəniş Məlumatı</h3>
              </div>
              <p className="text-[#5a7869] text-sm">
                Ödəniş kuryer tərəfindən məhsulı çatdırarkən nqəd və ya kart ilə edəcəksiniz.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-[#d4e8df] sticky top-24">
              <h2 className="text-2xl font-bold mb-6" data-testid="order-summary-title">Sifariş Xülası</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.product_id} className="flex gap-3" data-testid={`summary-item-${item.product_id}`}>
                    <div className="w-16 h-16 bg-[#F5FBF8] rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-[#d4e8df]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0d291e] line-clamp-2">{item.title}</p>
                      <p className="text-xs text-[#5a7869]">{item.quantity} x {item.price} ₼</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-[#0d291e]">Endirim Kuponu</label>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="KUPON"
                    className="border-[#d4e8df] focus:border-[#2d5f4a]"
                    data-testid="coupon-input"
                  />
                  <Button
                    type="button"
                    onClick={validateCoupon}
                    variant="outline"
                    className="border-[#2d5f4a] text-[#2d5f4a] hover:bg-[#2d5f4a] hover:text-white whitespace-nowrap"
                    data-testid="apply-coupon-btn"
                  >
                    Tətbiq et
                  </Button>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-[#5a7869]">Ara Cəm</span>
                  <span className="font-semibold" data-testid="summary-subtotal">{subtotal.toFixed(2)} ₼</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#2d5f4a]">
                    <span>Endirim</span>
                    <span className="font-semibold" data-testid="summary-discount">-{discount.toFixed(2)} ₼</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#5a7869]">Çatdırılma</span>
                  <span className="font-semibold text-[#2d5f4a]">Pulsuz</span>
                </div>
                <div className="border-t border-[#d4e8df] pt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold">Cəm</span>
                    <span className="text-3xl font-bold text-[#2d5f4a]" data-testid="summary-total">{total.toFixed(2)} ₼</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full btn-primary py-6 text-lg"
                data-testid="place-order-btn"
              >
                {loading ? 'Gözləyin...' : 'Sifarişi təsdiqlə'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;