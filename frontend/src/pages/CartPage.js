import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  };

  const updateQuantity = (productId, change) => {
    const updatedCart = cart.map(item => {
      if (item.product_id === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + change) };
      }
      return item;
    });
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item.product_id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Məhsul silindi');
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

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
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/products" className="text-[#5a7869] hover:text-[#2d5f4a] font-medium transition-colors" data-testid="nav-products">Məhsullar</Link>
              <Link to="/track-order" className="text-[#5a7869] hover:text-[#2d5f4a] font-medium transition-colors" data-testid="nav-track">Sifariş izləmə</Link>
              <Link to="/cart" className="text-[#2d5f4a] font-semibold" data-testid="nav-cart">Səbət</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8" data-testid="cart-title">Alış-veriş Səbəti</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20" data-testid="empty-cart-message">
            <ShoppingBag className="w-24 h-24 text-[#d4e8df] mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-[#0d291e] mb-4">Səbətiniz boşdur</h2>
            <p className="text-[#5a7869] mb-8">Məhsullar səhifəsinə kedin və alış-verişə başlayın!</p>
            <Link to="/products" className="btn-primary" data-testid="continue-shopping-btn">
              Məhsullara bax
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map(item => (
                <div
                  key={item.product_id}
                  className="bg-white rounded-2xl p-6 border border-[#d4e8df] flex gap-6"
                  data-testid={`cart-item-${item.product_id}`}
                >
                  <div className="w-24 h-24 bg-[#F5FBF8] rounded-xl overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-[#d4e8df]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-[#0d291e] mb-2">{item.title}</h3>
                    <p className="text-2xl font-bold text-[#2d5f4a] mb-4">{item.price} ₼</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border-2 border-[#d4e8df] rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product_id, -1)}
                          className="px-4 py-2 hover:bg-[#F5FBF8] transition-colors"
                          data-testid={`decrease-qty-${item.product_id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-semibold" data-testid={`qty-${item.product_id}`}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, 1)}
                          className="px-4 py-2 hover:bg-[#F5FBF8] transition-colors"
                          data-testid={`increase-qty-${item.product_id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        data-testid={`remove-item-${item.product_id}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 border border-[#d4e8df] sticky top-24">
                <h2 className="text-2xl font-bold mb-6" data-testid="order-summary-title">Sifariş Xülası</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-[#5a7869]">Ara Cəm</span>
                    <span className="font-semibold" data-testid="subtotal">{getSubtotal().toFixed(2)} ₼</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5a7869]">Çatdırılma</span>
                    <span className="font-semibold text-[#2d5f4a]">Pulsuz</span>
                  </div>
                  <div className="border-t border-[#d4e8df] pt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-semibold">Cəm</span>
                      <span className="text-3xl font-bold text-[#2d5f4a]" data-testid="total">{getSubtotal().toFixed(2)} ₼</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/checkout')}
                  className="w-full btn-primary py-6 text-lg"
                  data-testid="proceed-checkout-btn"
                >
                  Ödənişə keç
                </Button>

                <Link
                  to="/products"
                  className="block text-center text-[#2d5f4a] hover:text-[#3d7a5f] mt-4 font-medium"
                  data-testid="continue-shopping-link"
                >
                  Alış-verişə davam et
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;