import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, Lock, Mail } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLogin = ({ setToken }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const { data } = await axios.post(`${API}${endpoint}`, payload);
      
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      setToken(data.token);
      
      toast.success(isLogin ? 'Uğurla daxil oldunuz!' : 'Qeydiyyat tamamlandı!');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5FBF8] to-white flex items-center justify-center px-6">
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzJkNWY0YSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6" data-testid="logo-link">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2d5f4a] to-[#3d7a5f] flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display' }}>Atabuy</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2" data-testid="admin-login-title">Admin Panel</h1>
          <p className="text-[#5a7869]">
            {isLogin ? 'Hesabınıza daxil olun' : 'Yeni admin hesabı yaradın'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-[#d4e8df]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2 text-[#0d291e]">Tam Ad</label>
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Adınız və soyadınız"
                  required={!isLogin}
                  className="border-[#d4e8df] focus:border-[#2d5f4a]"
                  data-testid="fullname-input"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-[#0d291e]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#5a7869]" />
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@atabuy.az"
                  required
                  className="pl-10 border-[#d4e8df] focus:border-[#2d5f4a]"
                  data-testid="email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[#0d291e]">Şifrə</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#5a7869]" />
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="pl-10 border-[#d4e8df] focus:border-[#2d5f4a]"
                  data-testid="password-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-6 text-lg"
              data-testid="submit-btn"
            >
              {loading ? 'Gözləyin...' : (isLogin ? 'Daxil ol' : 'Qeydiyyat')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#2d5f4a] hover:text-[#3d7a5f] font-medium transition-colors"
              data-testid="toggle-auth-mode-btn"
            >
              {isLogin ? 'Hesabınız yoxdur? Qeydiyyat' : 'Hesabınız var? Daxil ol'}
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-[#5a7869] hover:text-[#2d5f4a] transition-colors" data-testid="back-home-link">
            ← Ana səhifəyə qayıt
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;