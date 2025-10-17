import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, ShoppingCart, Menu, X, ChevronLeft, ChevronRight, User, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import ShareButton from '../components/ShareButton';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API}/categories`);
      setCategories(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API}/products`);
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const nextSlide = () => {
    const perPage = isMobile ? 1 : 4;
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(products.length / perPage));
  };

  const prevSlide = () => {
    const perPage = isMobile ? 1 : 4;
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(products.length / perPage)) % Math.ceil(products.length / perPage));
  };

  const perPage = isMobile ? 1 : 4;
  const displayProducts = products.slice(currentSlide * perPage, (currentSlide + 1) * perPage);

  return (
    <div className="homepage">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-1" data-testid="logo-link">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#23B45D] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg md:text-xl font-bold text-[#1B5E20]" style={{ fontFamily: 'Playfair Display' }}>Ata</span>
                <span className="text-lg md:text-xl font-bold text-[#23B45D]" style={{ fontFamily: 'Playfair Display' }}>Buy</span>
              </div>
            </Link>
            
            <div className="hidden lg:flex items-center space-x-2">
              <input
                type="text"
                placeholder="Məhsul axtar"
                className="w-80 px-4 py-2 rounded-full border border-[#E0F2E9] focus:outline-none focus:border-[#23B45D]"
              />
            </div>

            <div className="flex items-center space-x-3 md:space-x-4">
              {user ? (
                <Link to="/profile" className="flex items-center space-x-1 hover:opacity-80">
                  <User className="w-5 h-5 md:w-6 md:h-6 text-[#1B5E20]" />
                  <span className="hidden md:inline text-sm text-[#1B5E20]">{user.name}</span>
                </Link>
              ) : (
                <Link to="/login" className="text-sm text-[#1B5E20] hover:text-[#23B45D] font-medium">
                  Daxil ol
                </Link>
              )}
              <Link to="/cart" data-testid="cart-icon">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-[#1B5E20] hover:text-[#23B45D]" />
              </Link>
              <button onClick={() => setShowMenu(true)} data-testid="menu-btn">
                <Menu className="w-5 h-5 md:w-6 md:h-6 text-[#1B5E20] hover:text-[#23B45D]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Sidebar */}
      {showMenu && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowMenu(false)}></div>
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col" data-testid="menu-sidebar">
            <div className="bg-[#23B45D] text-white p-6 flex items-center justify-between">
              <span className="text-xl font-bold">Menu</span>
              <button onClick={() => setShowMenu(false)} data-testid="close-menu-btn">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* User Profile Section */}
              <div className="pb-4 border-b">
                {user ? (
                  <>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Profil</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <Link 
                      to="/profile" 
                      className="mt-3 inline-block text-sm text-[#23B45D] hover:underline"
                      onClick={() => setShowMenu(false)}
                    >
                      Profili görüntülə
                    </Link>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link 
                      to="/login" 
                      className="block w-full px-4 py-2 bg-[#23B45D] text-white rounded-lg text-center font-medium hover:opacity-90"
                      onClick={() => setShowMenu(false)}
                    >
                      Daxil ol
                    </Link>
                    <Link 
                      to="/register" 
                      className="block w-full px-4 py-2 border-2 border-[#23B45D] text-[#23B45D] rounded-lg text-center font-medium hover:bg-[#E0F2E9]"
                      onClick={() => setShowMenu(false)}
                    >
                      Qeydiyyat
                    </Link>
                  </div>
                )}
              </div>

              {/* Menu Links */}
              {user && (
                <div className="space-y-2 pb-4 border-b">
                  <Link 
                    to="/profile" 
                    className="block py-2 text-gray-700 hover:text-[#23B45D]"
                    onClick={() => setShowMenu(false)}
                  >
                    Mənim Profilim
                  </Link>
                  <Link 
                    to="/track-order" 
                    className="block py-2 text-gray-700 hover:text-[#23B45D]"
                    onClick={() => setShowMenu(false)}
                  >
                    Sifarişlərim
                  </Link>
                </div>
              )}

              {/* Language Selection */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-semibold text-gray-700">Dil</p>
                </div>
                <div className="space-y-2">
                  <button className="w-full px-4 py-3 bg-[#23B45D] text-white rounded-lg font-medium flex items-center justify-between">
                    <span>🇦🇿 Azərbaycan</span>
                    <span className="text-xs">✓</span>
                  </button>
                  <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100">
                    🇬🇧 English
                  </button>
                  <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100">
                    🇷🇺 Русский
                  </button>
                  <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100">
                    🇹🇷 Türkçe
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              <div className="border-t pt-6 space-y-2">
                <Link to="/favorites" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="font-medium text-gray-700">Bəyənilənlər</span>
                </Link>
                
                {user && (
                  <>
                    <Link to="/profile" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-3 bg-[#E8F5E9] text-[#23B45D] rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-semibold">Profil</span>
                    </Link>
                    
                    <Link to="/track-order" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="font-medium text-gray-700">Sifarişlərim</span>
                    </Link>

                    <button 
                      onClick={() => { logout(); setShowMenu(false); }} 
                      className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-lg w-full text-left"
                    >
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-medium text-red-600">Çıxış</span>
                    </button>
                  </>
                )}
                
                {!user && (
                  <Link to="/login" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium text-gray-700">Daxil ol</span>
                  </Link>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-[#23B45D] flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-bold text-[#1B5E20]">AtaBuy</p>
              </div>
              <p className="text-xs text-gray-500">Daima Atalar Alır</p>
            </div>
          </div>
        </>
      )}

      {/* Hero Banner with Carousel */}
      <section className="bg-[#23B45D] py-8 md:py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="neon-hero-text text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4" style={{ fontFamily: 'Poppins' }} data-testid="hero-title">AtaBuy</h1>
            <p className="text-lg md:text-xl text-white/90">Daima Atalar Alır</p>
          </div>

          <style jsx>{`
            @keyframes neonPulse {
              0% {
                text-shadow:
                  0 0 5px #ffffff,
                  0 0 10px #ffffff,
                  0 0 20px #ffffff,
                  0 0 40px #ffffff;
                color: #ffffff;
              }
              50% {
                text-shadow:
                  0 0 10px #00ff80,
                  0 0 20px #00ff80,
                  0 0 40px #00ff80,
                  0 0 80px #00ff80;
                color: #e6ffe6;
              }
              100% {
                text-shadow:
                  0 0 5px #ffffff,
                  0 0 10px #ffffff,
                  0 0 20px #ffffff,
                  0 0 40px #ffffff;
                color: #ffffff;
              }
            }

            .neon-hero-text {
              animation: neonPulse 2.5s infinite ease-in-out;
            }
          `}</style>

          {/* Product Carousel */}
          <div className="relative">
            <button
              onClick={prevSlide}
              className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 md:p-3 rounded-full"
              data-testid="carousel-prev-btn"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 px-10 md:px-12">
              {displayProducts.map(product => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all"
                  data-testid={`carousel-product-${product.id}`}
                >
                  <div className="aspect-square bg-gray-100 relative">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-20 h-20 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#23B45D] text-white text-xs font-semibold px-3 py-1 rounded-full">Elektronika</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{product.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#23B45D]">₼{product.price}</span>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="p-2 bg-[#23B45D] hover:bg-[#23B45D] rounded-full">
                          <ShoppingCart className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 md:p-3 rounded-full"
              data-testid="carousel-next-btn"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>
          </div>

          {/* Carousel dots */}
          <div className="flex items-center justify-center mt-4 md:mt-6 space-x-2">
            {Array.from({ length: Math.ceil(products.length / perPage) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 md:py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
            <button className="px-4 md:px-6 py-2 bg-[#23B45D] text-white rounded-full text-sm md:text-base font-medium hover:bg-[#23B45D]">Hamısı</button>
            {categories.slice(0, 20).map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="px-4 md:px-6 py-2 bg-gray-100 text-gray-700 rounded-full text-sm md:text-base font-medium hover:bg-gray-200"
                data-testid={`category-pill-${cat.id}`}
              >
                {cat.name_az}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 md:py-12 bg-[#F8FFF9]">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8" data-testid="all-products-title">Bütün Məhsullar</h2>
          <p className="text-gray-600 mb-4 md:mb-6">{products.length} məhsul tapıldı</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {products.map(product => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all product-card"
                data-testid={`product-${product.id}`}
              >
                <div className="aspect-square bg-gray-100 relative">
                  {product.images && product.images[0] ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-20 h-20 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#23B45D] text-white text-xs font-semibold px-3 py-1 rounded-full">Elektronika</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(product);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  >
                    <Heart 
                      className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                    />
                  </button>
                  <div className="absolute top-3 right-14">
                    <ShareButton product={product} className="shadow-md" />
                  </div>
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-semibold text-gray-800 mb-1 md:mb-2 line-clamp-2 text-sm md:text-base">{product.title}</h3>
                  <p className="text-lg md:text-2xl font-bold text-[#23B45D] mb-2 md:mb-3">₼{product.price}</p>
                  
                  {/* Delivery Info */}
                  <div className="mb-3 space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#23B45D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>20 gün çatdırılma</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#23B45D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>100% orijinal</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#23B45D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>14 gün qaytarma</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <button className="flex-1 py-1.5 md:py-2 border-2 border-[#23B45D] text-[#23B45D] rounded-full text-xs md:text-sm font-medium hover:bg-[#23B45D] hover:text-white">Bax</button>
                    <button className="flex-1 py-1.5 md:py-2 bg-[#23B45D] text-white rounded-full text-xs md:text-sm font-medium hover:bg-[#23B45D]">Səbət</button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1B5E20] text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">&copy; 2025 AtaBuy. Bütün hüquqlar qorunur.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;