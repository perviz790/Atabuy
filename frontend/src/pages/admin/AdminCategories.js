import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Package, ShoppingCart, Tag, Star, Bell, LogOut, Menu, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminSidebar = ({ active }) => {
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login';
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-[#1a3d2e] to-[#2d5f4a] text-white p-6 z-50">
      <div className="mb-10"><h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display' }}>Atabuy Admin</h1></div>
      <nav className="space-y-2">
        <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 ${active === 'dashboard' ? 'bg-white/20' : 'hover:bg-white/10'} rounded-lg transition-colors`}>
          <LayoutDashboard className="w-5 h-5" /><span>Dashboard</span>
        </Link>
        <Link to="/admin/categories" className={`flex items-center gap-3 px-4 py-3 ${active === 'categories' ? 'bg-white/20' : 'hover:bg-white/10'} rounded-lg transition-colors`} data-testid="nav-categories">
          <Menu className="w-5 h-5" /><span>Kateqoriyalar</span>
        </Link>
        <Link to="/admin/products" className={`flex items-center gap-3 px-4 py-3 ${active === 'products' ? 'bg-white/20' : 'hover:bg-white/10'} rounded-lg transition-colors`} data-testid="nav-products">
          <Package className="w-5 h-5" /><span>Məhsullar</span>
        </Link>
        <Link to="/admin/orders" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
          <ShoppingCart className="w-5 h-5" /><span>Sifarişlər</span>
        </Link>
        <Link to="/admin/coupons" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
          <Tag className="w-5 h-5" /><span>Kuponlar</span>
        </Link>
        <Link to="/admin/reviews" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
          <Star className="w-5 h-5" /><span>Rəylər</span>
        </Link>
        <Link to="/admin/notifications" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
          <Bell className="w-5 h-5" /><span>Bildirişlər</span>
        </Link>
      </nav>
      <button onClick={handleLogout} className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
        <LogOut className="w-5 h-5" /><span>Çıxış</span>
      </button>
    </aside>
  );
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', name_az: '', description: '', icon: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

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
    const token = localStorage.getItem('admin_token');

    try {
      if (editItem) {
        await axios.put(`${API}/categories/${editItem.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Yeniləndi');
      } else {
        await axios.post(`${API}/categories`, { ...formData, is_active: true }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Əlavə edildi');
      }
      setIsOpen(false);
      setEditItem(null);
      setFormData({ name: '', name_az: '', description: '', icon: '' });
      fetchCategories();
    } catch (error) {
      toast.error('Xəta');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Silməyə əminsiniz?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await axios.delete(`${API}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Silindi');
      fetchCategories();
    } catch (error) {
      toast.error('Xəta');
    }
  };

  const openEdit = (cat) => {
    setEditItem(cat);
    setFormData({ name: cat.name, name_az: cat.name_az, description: cat.description || '', icon: cat.icon || '' });
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFFFE]">
      <AdminSidebar active="categories" />
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2" data-testid="categories-title">Kateqoriyalar</h2>
            <p className="text-[#5a7869]">Kateqoriya idarəetməsi</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary" onClick={() => { setEditItem(null); setFormData({ name: '', name_az: '', description: '', icon: '' }); }} data-testid="add-category-btn">
                <Plus className="w-5 h-5 mr-2" />Əlavə et
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editItem ? 'Redaktə' : 'Yeni Kateqoriya'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ad (EN)</label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required data-testid="category-name-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ad (AZ)</label>
                  <Input value={formData.name_az} onChange={(e) => setFormData({ ...formData, name_az: e.target.value })} required data-testid="category-name-az-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Təsvir</label>
                  <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} data-testid="category-description-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Emoji/Icon</label>
                  <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="📦" data-testid="category-icon-input" />
                </div>
                <Button type="submit" className="w-full btn-primary" data-testid="save-category-btn">Yadda saxla</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl p-6 border border-[#d4e8df]" data-testid={`category-item-${cat.id}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{cat.icon || '📦'}</div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(cat)} className="p-2 hover:bg-[#F5FBF8] rounded-lg transition-colors" data-testid={`edit-category-${cat.id}`}>
                    <Edit2 className="w-4 h-4 text-[#2d5f4a]" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" data-testid={`delete-category-${cat.id}`}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-1">{cat.name_az}</h3>
              {cat.description && <p className="text-sm text-[#5a7869]">{cat.description}</p>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminCategories;