import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, ShoppingBag, TrendingUp, Award, Truck, Shield } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchNotifications();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API}/categories`);
      setCategories(data.slice(0, 8));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API}/products`);
      setProducts(data.slice(0, 8));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${API}/notifications`);
      setNotifications(data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  return (
    <div className="homepage">
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
              <Link to="/track-order" className="text-[#5a7869] hover:text-[#2d5f4a] font-medium transition-colors" data-testid="nav-track-order">Sifariş izləmə</Link>
              <Link to="/cart" className="text-[#5a7869] hover:text-[#2d5f4a] font-medium transition-colors" data-testid="nav-cart">Səbət</Link>
              <Link to="/admin/login" className="btn-outline text-sm py-2 px-6" data-testid="admin-login-btn">Admin</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Notifications Banner */}
      {notifications.length > 0 && (
        <div className="bg-gradient-to-r from-[#d4f4dd] to-[#e8f8ed] py-3">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-center space-x-2 text-[#1a3d2e]">
              <Award className="w-5 h-5" />
              <span className="font-medium">{notifications[0].message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-[#F5FBF8] to-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzJkNWY0YSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="hero-title">
              Premium Alış-veriş <span className="text-[#2d5f4a]">Təcrübəsi</span>
            </h1>
            <p className="text-base sm:text-lg text-[#5a7869] mb-8 leading-relaxed">
              Atabuy ilə keyfiyyətli məhsulları kəşf edin. 20+ kateqoriya, 70+ məhsul və ən yaxşı qiymətlər sizi gözləyir.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/products" className="btn-primary" data-testid="explore-products-btn">
                Məhsulları kəşf et
                <ChevronRight className="inline-block ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl hover:bg-[#F5FBF8] transition-colors" data-testid="feature-delivery">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#d4f4dd] flex items-center justify-center">
                <Truck className="w-8 h-8 text-[#2d5f4a]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sürətli Çatdırılma</h3>
              <p className="text-[#5a7869] text-sm">2-3 iş günü ərzində ünvanınıza çatdırılır</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl hover:bg-[#F5FBF8] transition-colors" data-testid="feature-quality">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#d4f4dd] flex items-center justify-center">
                <Award className="w-8 h-8 text-[#2d5f4a]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Keyfiyyət</h3>
              <p className="text-[#5a7869] text-sm">Yalnız yüksək keyfiyyətli məhsullar</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl hover:bg-[#F5FBF8] transition-colors" data-testid="feature-security">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#d4f4dd] flex items-center justify-center">
                <Shield className="w-8 h-8 text-[#2d5f4a]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Təhlükəsiz Ödəniş</h3>
              <p className="text-[#5a7869] text-sm">100% təhlükəsiz və şifrələnmiş ödəniş</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-[#F5FBF8]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="categories-title">Kateqoriyalar</h2>
            <p className="text-[#5a7869] text-sm sm:text-base">İstədiyiniz kateqoriyadan seçim edin</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all product-card"
                data-testid={`category-${category.id}`}
              >
                <div className="text-4xl mb-3">{category.icon || '📦'}</div>
                <h3 className="font-semibold text-[#0d291e]">{category.name_az}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2" data-testid="featured-products-title">Seçilmiş Məhsullar</h2>
              <p className="text-[#5a7869] text-sm sm:text-base">Ən populyar məhsullarımız</p>
            </div>
            <Link to="/products" className="btn-outline text-sm py-2 px-6" data-testid="view-all-products-btn">
              Hamısına bax
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="bg-white rounded-2xl overflow-hidden border border-[#d4e8df] hover:shadow-xl transition-all product-card"
                data-testid={`product-${product.id}`}
              >
                <div className="image-zoom aspect-square bg-[#F5FBF8]">
                  {product.images && product.images[0] ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-20 h-20 text-[#d4e8df]" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#0d291e] mb-2 line-clamp-2">{product.title}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-[#2d5f4a]">{product.price} ₼</p>
                      {product.discount_percent > 0 && (
                        <p className="text-sm text-[#5a7869] line-through">{product.original_price} ₼</p>
                      )}
                    </div>
                    {product.discount_percent > 0 && (
                      <span className="badge badge-success">-{product.discount_percent}%</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a3d2e] text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Playfair Display' }}>Atabuy</h3>
              <p className="text-[#8fbc8f] text-sm">Premium onlayn alış-veriş platforması</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Keçidlər</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products" className="text-[#8fbc8f] hover:text-white transition-colors">Məhsullar</Link></li>
                <li><Link to="/track-order" className="text-[#8fbc8f] hover:text-white transition-colors">Sifariş izləmə</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Əlaqə</h4>
              <p className="text-[#8fbc8f] text-sm">Email: info@atabuy.az</p>
              <p className="text-[#8fbc8f] text-sm">Tel: +994 12 345 67 89</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">İş Saatları</h4>
              <p className="text-[#8fbc8f] text-sm">B.e - Cümə: 09:00 - 18:00</p>
              <p className="text-[#8fbc8f] text-sm">Şənbə: 10:00 - 16:00</p>
            </div>
          </div>
          <div className="border-t border-[#3d7a5f] pt-8 text-center text-sm text-[#8fbc8f]">
            <p>&copy; 2025 Atabuy. Bütün hüquqlar qorunur.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;