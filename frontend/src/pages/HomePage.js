import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, ShoppingCart, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

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
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(products.length / 4));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(products.length / 4)) % Math.ceil(products.length / 4));
  };

  const displayProducts = products.slice(currentSlide * 4, (currentSlide + 1) * 4);

  return (
    <div className="homepage">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
              <div className="w-12 h-12 rounded-full bg-[#00D084] flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#1B5E20]" style={{ fontFamily: 'Playfair Display' }}>AtaBuy</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-2">
              <input
                type="text"
                placeholder="Məhsul axtar"
                className="w-80 px-4 py-2 rounded-full border border-[#E0F2E9] focus:outline-none focus:border-[#00D084]"
              />
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/cart" data-testid="cart-icon">
                <ShoppingCart className="w-6 h-6 text-[#1B5E20] hover:text-[#00D084]" />
              </Link>
              <button onClick={() => setShowMenu(true)} data-testid="menu-btn">
                <Menu className="w-6 h-6 text-[#1B5E20] hover:text-[#00D084]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Sidebar */}
      {showMenu && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowMenu(false)}></div>
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 animate-slideIn" data-testid="menu-sidebar">
            <div className="bg-[#00D084] text-white p-6 flex items-center justify-between">
              <span className="text-xl font-bold">Menu</span>
              <button onClick={() => setShowMenu(false)} data-testid="close-menu-btn">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-3">Dil</p>
                <div className="space-y-2">
                  <button className="w-full px-4 py-3 bg-[#00D084] text-white rounded-lg font-medium">🇦🇿 Azərbaycan</button>
                  <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100">🇬🇧 English</button>
                  <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100">🇷🇺 Русский</button>
                  <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100">🇹🇷 Türkçe</button>
                </div>
              </div>
              <div className="space-y-3">
                <Link to="/admin/login" className="block w-full px-4 py-3 bg-[#00D084] text-white text-center rounded-lg font-medium">Daxil ol</Link>
                <button className="w-full px-4 py-3 border-2 border-[#00D084] text-[#00D084] rounded-lg font-medium">Qeydiyyat</button>
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-center">
              <p className="text-sm font-bold text-[#1B5E20]">AtaBuy</p>
              <p className="text-xs text-gray-500">Daima Atalar Alır</p>
            </div>
          </div>
        </>
      )}

      {/* Hero Banner with Carousel */}
      <section className="bg-[#00D084] py-16 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display' }} data-testid="hero-title">AtaBuy</h1>
            <p className="text-xl text-white/90">Daima Atalar Alır</p>
          </div>

          {/* Product Carousel */}
          <div className="relative">
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full"
              data-testid="carousel-prev-btn"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-12">
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
                      <span className="bg-[#00D084] text-white text-xs font-semibold px-3 py-1 rounded-full">Elektronika</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{product.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#00D084]">₼{product.price}</span>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="p-2 bg-[#00D084] hover:bg-[#00A86B] rounded-full">
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
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full"
              data-testid="carousel-next-btn"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Carousel dots */}
          <div className="flex items-center justify-center mt-6 space-x-2">
            {Array.from({ length: Math.ceil(products.length / 4) }).map((_, idx) => (
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
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="px-6 py-2 bg-[#00D084] text-white rounded-full font-medium hover:bg-[#00A86B]">Hamısı</button>
            {categories.slice(0, 20).map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200"
                data-testid={`category-pill-${cat.id}`}
              >
                {cat.name_az}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 bg-[#F8FFF9]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8" data-testid="all-products-title">Bütün Məhsullar</h2>
          <p className="text-gray-600 mb-6">{products.length} məhsul tapıldı</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <span className="bg-[#00D084] text-white text-xs font-semibold px-3 py-1 rounded-full">Elektronika</span>
                  </div>
                  <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button className="absolute top-3 right-14 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.title}</h3>
                  <p className="text-2xl font-bold text-[#00D084] mb-3">₼{product.price}</p>
                  <div className="flex items-center space-x-2">
                    <button className="flex-1 py-2 border-2 border-[#00D084] text-[#00D084] rounded-full font-medium hover:bg-[#00D084] hover:text-white">Bax</button>
                    <button className="flex-1 py-2 bg-[#00D084] text-white rounded-full font-medium hover:bg-[#00A86B]">Səbət</button>
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