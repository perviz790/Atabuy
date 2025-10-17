import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, ShoppingCart, Menu, X, Search, Heart, Share2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [filters, setFilters] = useState({
    category_id: searchParams.get('category') || '',
    search: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [filters]);

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
      const params = new URLSearchParams();
      if (filters.category_id) params.append('category_id', filters.category_id);
      if (filters.search) params.append('search', filters.search);

      const { data } = await axios.get(`${API}/products?${params}`);
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Məhsul axtar"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-80 pl-10 pr-4 py-2 rounded-full border border-[#E0F2E9] focus:outline-none focus:border-[#00D084]"
                  data-testid="search-input"
                />
              </div>
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
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50">
            <div className="bg-[#00D084] text-white p-6 flex items-center justify-between">
              <span className="text-xl font-bold">Menu</span>
              <button onClick={() => setShowMenu(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-3">Dil</p>
                <div className="space-y-2">
                  <button className="w-full px-4 py-3 bg-[#00D084] text-white rounded-lg font-medium">🇦🇿 Azərbaycan</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="container mx-auto px-6 py-8">
        {/* Category Pills */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilters({ ...filters, category_id: '' })}
              className={`px-6 py-2 rounded-full font-medium ${!filters.category_id ? 'bg-[#00D084] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              data-testid="category-all"
            >
              Hamısı
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilters({ ...filters, category_id: cat.id })}
                className={`px-6 py-2 rounded-full font-medium ${filters.category_id === cat.id ? 'bg-[#00D084] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                data-testid={`category-${cat.id}`}
              >
                {cat.name_az}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 className="text-3xl font-bold mb-2" data-testid="products-title">Bütün Məhsullar</h2>
          <p className="text-gray-600 mb-6">{products.length} məhsul tapıldı</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all product-card"
                data-testid={`product-card-${product.id}`}
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
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="absolute top-3 right-14 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                    <Share2 className="w-5 h-5 text-gray-600" />
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
      </div>
    </div>
  );
};

export default ProductsPage;