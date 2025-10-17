import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Package, ShoppingCart, Tag, Star, Bell, LogOut, Menu, Grid, Users, Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image_url: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const { data } = await axios.get(`${API}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Məhsullar yüklənə bilmədi');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API}/categories`);
      setCategories(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Məhsul yeniləndi');
      } else {
        await axios.post(`${API}/products`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Məhsul əlavə edildi');
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', category: '', stock: '', image_url: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Əməliyyat uğursuz oldu');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image_url: product.image_url || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Bu məhsulu silmək istədiyinizə əminsiniz?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Məhsul silindi');
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Məhsul silinə bilmədi');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#23B45D', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFFFE]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-[#1a3d2e] to-[#2d5f4a] text-white p-6 z-50">
        <div className="mb-10">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display' }}>Atabuy Admin</h1>
        </div>
        
        <nav className="space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/categories" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <Grid className="w-5 h-5" />
            <span>Kateqoriyalar</span>
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <Users className="w-5 h-5" />
            <span>İstifadəçilər</span>
          </Link>
          <Link to="/admin/products" className="flex items-center gap-3 px-4 py-3 bg-white/20 rounded-lg">
            <Package className="w-5 h-5" />
            <span>Məhsullar</span>
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <ShoppingCart className="w-5 h-5" />
            <span>Sifarişlər</span>
          </Link>
          <Link to="/admin/kanban" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span>Kanban Board</span>
          </Link>
          <Link to="/admin/payments" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <Tag className="w-5 h-5" />
            <span>Ödənişlər</span>
          </Link>
          <Link to="/admin/reviews" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <Star className="w-5 h-5" />
            <span>Rəylər</span>
          </Link>
          <Link to="/admin/notifications" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span>Bildirişlər</span>
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Çıxış</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Məhsullar</h2>
            <p className="text-[#5a7869]">Məhsulları idarə edin</p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({ name: '', description: '', price: '', category: '', stock: '', image_url: '' });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#23B45D] text-white rounded-lg hover:bg-[#1e9d4f] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Məhsul</span>
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-[#d4e8df] p-6 hover:shadow-lg transition-shadow">
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-xl font-bold mb-2">{product.name}</h3>
              <p className="text-[#5a7869] mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-[#23B45D]">{product.price} ₼</span>
                <span className="text-sm text-[#5a7869]">Stok: {product.stock}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Redaktə</span>
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Sil</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-500">Məhsul yoxdur</p>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? 'Məhsulu Redaktə Et' : 'Yeni Məhsul Əlavə Et'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Məhsul Adı</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23B45D] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Təsvir</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23B45D] focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Qiymət (₼)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23B45D] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stok</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23B45D] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kateqoriya</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23B45D] focus:border-transparent"
                  required
                >
                  <option value="">Kateqoriya seçin</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Şəkil URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23B45D] focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    setFormData({ name: '', description: '', price: '', category: '', stock: '', image_url: '' });
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#23B45D] text-white rounded-lg hover:bg-[#1e9d4f] transition-colors"
                >
                  {editingProduct ? 'Yenilə' : 'Əlavə et'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
