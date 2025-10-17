import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, Filter, Search, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category_id: searchParams.get('category') || '',
    min_price: '',
    max_price: '',
    brand: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
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
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.search) params.append('search', filters.search);

      const { data } = await axios.get(`${API}/products?${params}`);
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
              <Link to="/products" className="text-[#2d5f4a] font-semibold" data-testid="nav-products">Məhsullar</Link>
              <Link to="/track-order" className="text-[#5a7869] hover:text-[#2d5f4a] font-medium transition-colors" data-testid="nav-track">Sifariş izləmə</Link>
              <Link to="/cart" className="text-[#5a7869] hover:text-[#2d5f4a] font-medium transition-colors" data-testid="nav-cart">Səbət</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Search & Filter Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6" data-testid="page-title">Məhsullar</h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#5a7869]" />
              <Input
                data-testid="search-input"
                placeholder="Məhsul axtar..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 border-[#d4e8df] focus:border-[#2d5f4a] rounded-full"
              />
            </div>
            <Button
              data-testid="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-[#2d5f4a] text-[#2d5f4a] hover:bg-[#2d5f4a] hover:text-white rounded-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtrlər
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-white rounded-2xl border border-[#d4e8df] fade-in" data-testid="filters-panel">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#0d291e]">Kateqoriya</label>
                  <Select value={filters.category_id} onValueChange={(value) => handleFilterChange('category_id', value)}>
                    <SelectTrigger data-testid="category-filter">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Hamısı</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name_az}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#0d291e]">Min Qiymət</label>
                  <Input
                    data-testid="min-price-input"
                    type="number"
                    placeholder="0 ₼"
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    className="border-[#d4e8df] focus:border-[#2d5f4a]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#0d291e]">Max Qiymət</label>
                  <Input
                    data-testid="max-price-input"
                    type="number"
                    placeholder="1000 ₼"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    className="border-[#d4e8df] focus:border-[#2d5f4a]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#0d291e]">Brend</label>
                  <Input
                    data-testid="brand-input"
                    placeholder="Brend adı"
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="border-[#d4e8df] focus:border-[#2d5f4a]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map(product => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="bg-white rounded-2xl overflow-hidden border border-[#d4e8df] hover:shadow-xl transition-all product-card"
                data-testid={`product-card-${product.id}`}
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
                  {product.brand && (
                    <p className="text-xs text-[#5a7869] mb-1 uppercase tracking-wide">{product.brand}</p>
                  )}
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
                  {product.stock > 0 ? (
                    <p className="text-xs text-[#2d5f4a] mt-2">Stokda: {product.stock}</p>
                  ) : (
                    <p className="text-xs text-red-500 mt-2">Stokda yoxdur</p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-20" data-testid="no-products-message">
              <ShoppingBag className="w-20 h-20 text-[#d4e8df] mx-auto mb-4" />
              <p className="text-[#5a7869] text-lg">Məhsul tapılmadı</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;