import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, X, Users, Package, ShoppingCart, Bell, BarChart3 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminFloatingSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({
    newOrders: 0,
    lowStock: 0,
    newUsers: 0
  });

  useEffect(() => {
    if (isOpen) {
      fetchQuickStats();
    }
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      if (isOpen) {
        fetchQuickStats();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  const fetchQuickStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const { data } = await axios.get(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats({
        newOrders: data.pending_orders || 0,
        lowStock: data.low_stock_products || 0,
        newUsers: data.new_users_today || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-[#23B45D] to-[#1e9d4f] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
          title="Admin Alətləri"
        >
          <Settings className="w-6 h-6 animate-spin-slow" />
        </button>
      )}

      {/* Sidebar */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar Panel */}
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#23B45D] to-[#1e9d4f] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-6 h-6" />
                <span className="text-xl font-bold">Admin Panel</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="p-4 bg-gray-50 border-b">
              <p className="text-xs font-semibold text-gray-500 mb-3">REAL-TIME STATISTIKA</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-3 rounded-lg text-center">
                  <ShoppingCart className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-800">{stats.newOrders}</p>
                  <p className="text-xs text-gray-500">Yeni</p>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <Package className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-800">{stats.lowStock}</p>
                  <p className="text-xs text-gray-500">Az stok</p>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-800">{stats.newUsers}</p>
                  <p className="text-xs text-gray-500">İstifadəçi</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-xs font-semibold text-gray-500 mb-3">SÜRƏTLI GEDİŞ</p>
              <div className="space-y-2">
                <Link
                  to="/admin"
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <BarChart3 className="w-5 h-5 text-[#23B45D]" />
                  <span className="font-medium text-gray-700">Dashboard</span>
                </Link>
                
                <Link
                  to="/admin/products"
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Package className="w-5 h-5 text-[#23B45D]" />
                  <span className="font-medium text-gray-700">Məhsullar</span>
                </Link>
                
                <Link
                  to="/admin/kanban"
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <ShoppingCart className="w-5 h-5 text-[#23B45D]" />
                  <span className="font-medium text-gray-700">Sifarişlər</span>
                </Link>
                
                <Link
                  to="/admin/users"
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Users className="w-5 h-5 text-[#23B45D]" />
                  <span className="font-medium text-gray-700">İstifadəçilər</span>
                </Link>
                
                <Link
                  to="/admin/notifications"
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Bell className="w-5 h-5 text-[#23B45D]" />
                  <span className="font-medium text-gray-700">Bildirişlər</span>
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Son yenilənmə: {new Date().toLocaleTimeString('az-AZ')}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AdminFloatingSidebar;
