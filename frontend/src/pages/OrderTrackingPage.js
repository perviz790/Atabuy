import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, Package, Truck, CheckCircle, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('id')) {
      trackOrder();
    }
  }, []);

  const trackOrder = async () => {
    if (!orderId.trim()) {
      toast.error('Sifariş ID daxil edin');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/orders/${orderId}`);
      setOrder(data);
    } catch (error) {
      toast.error('Sifariş tapılmadı');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statuses = {
      confirmed: { text: 'Sifariş təsdiqləndi', icon: CheckCircle, color: 'text-[#23B45D]', bg: 'bg-green-100' },
      warehouse: { text: 'Anbardan çıxdı', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
      airplane: { text: 'Təyyarəyə verildi', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100' },
      atabuy_warehouse: { text: 'AtaBuy anbarına gətirildi', icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' },
      delivered: { text: 'Ünvana çatdırıldı', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
      cancelled: { text: 'Ləğv edildi', icon: Package, color: 'text-red-600', bg: 'bg-red-100' }
    };
    return statuses[status] || statuses.confirmed;
  };

  const getCurrentStatus = (order) => {
    if (!order.status_history) return 'confirmed';
    
    const now = new Date();
    for (let i = order.status_history.length - 1; i >= 0; i--) {
      const statusDate = new Date(order.status_history[i].date);
      if (now >= statusDate) {
        return order.status_history[i].status;
      }
    }
    return 'confirmed';
  };

  const getDaysRemaining = (targetDate) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const StatusIcon = order ? getStatusInfo(order.status).icon : Package;
  const statusInfo = order ? getStatusInfo(order.status) : null;

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
              <Link to="/track-order" className="text-[#2d5f4a] font-semibold" data-testid="nav-track">Sifariş izləmə</Link>
              <Link to="/cart" className="text-[#5a7869] hover:text-[#2d5f4a] font-medium transition-colors" data-testid="nav-cart">Səbət</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center" data-testid="tracking-title">Sifariş İzləmə</h1>

          {/* Search */}
          <div className="bg-white rounded-2xl p-8 border border-[#d4e8df] mb-8">
            <label className="block text-sm font-medium mb-3 text-[#0d291e]">Sifariş ID</label>
            <div className="flex gap-3">
              <Input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Sifariş ID-ni daxil edin"
                className="flex-1 border-[#d4e8df] focus:border-[#2d5f4a]"
                data-testid="order-id-input"
              />
              <Button
                onClick={trackOrder}
                disabled={loading}
                className="btn-primary"
                data-testid="track-order-btn"
              >
                <Search className="w-5 h-5 mr-2" />
                {loading ? 'Axtarılır...' : 'Axtar'}
              </Button>
            </div>
          </div>

          {/* Order Details */}
          {order && (
            <div className="space-y-6 fade-in">
              {/* Status */}
              <div className="bg-white rounded-2xl p-8 border border-[#E0F2E9] shadow-lg" data-testid="order-status-card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Sifariş Nömrəsi</p>
                    <p className="text-2xl font-bold text-[#23B45D]" data-testid="order-id-display">{order.id}</p>
                  </div>
                  <div className={`${getStatusInfo(getCurrentStatus(order)).bg} ${getStatusInfo(getCurrentStatus(order)).color} px-6 py-3 rounded-full flex items-center gap-2`}>
                    <span className="font-semibold text-sm" data-testid="order-status">{getStatusInfo(getCurrentStatus(order)).text}</span>
                  </div>
                </div>

                {order.tracking_number && (
                  <div className="bg-[#F8FFF9] rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-1">İzləmə Nömrəsi</p>
                    <p className="text-lg font-mono font-bold text-[#23B45D]" data-testid="tracking-number">{order.tracking_number}</p>
                  </div>
                )}

                {/* Real-time Timeline */}
                {order.status_history && order.status_history.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold mb-6">Çatdırılma Mərhələləri</h3>
                    <div className="space-y-6">
                      {order.status_history.map((item, idx) => {
                        const isPast = new Date() >= new Date(item.date);
                        const isCurrent = getCurrentStatus(order) === item.status;
                        const daysRemaining = getDaysRemaining(item.date);
                        
                        return (
                          <div key={idx} className="flex gap-4 relative">
                            {idx < order.status_history.length - 1 && (
                              <div className={`absolute left-5 top-12 w-0.5 h-full ${isPast ? 'bg-[#23B45D]' : 'bg-gray-200'}`}></div>
                            )}
                            
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isPast ? 'bg-[#23B45D]' : 'bg-gray-200'} ${isCurrent ? 'ring-4 ring-[#23B45D]/20' : ''}`}>
                              {isPast ? (
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                              )}
                            </div>
                            
                            <div className="flex-1 pb-6">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className={`font-semibold ${isPast ? 'text-[#23B45D]' : 'text-gray-600'}`}>{item.message}</p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {new Date(item.date).toLocaleDateString('az-AZ', { 
                                      day: 'numeric', 
                                      month: 'long',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                {!isPast && daysRemaining > 0 && (
                                  <div className="bg-gray-100 px-3 py-1 rounded-full">
                                    <p className="text-xs font-semibold text-gray-600">{daysRemaining} gün sonra</p>
                                  </div>
                                )}
                                {isCurrent && (
                                  <div className="bg-[#23B45D] px-3 py-1 rounded-full">
                                    <p className="text-xs font-semibold text-white">Cari mərhələ</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="bg-white rounded-2xl p-8 border border-[#d4e8df]">
                <h3 className="text-xl font-bold mb-4">Çatdırılma Məlumatı</h3>
                <div className="space-y-3 text-[#5a7869]">
                  <p><span className="font-medium text-[#0d291e]">Ad:</span> {order.customer_name}</p>
                  <p><span className="font-medium text-[#0d291e]">Email:</span> {order.customer_email}</p>
                  <p><span className="font-medium text-[#0d291e]">Telefon:</span> {order.customer_phone}</p>
                  <p><span className="font-medium text-[#0d291e]">Ünvan:</span> {order.delivery_address}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-2xl p-8 border border-[#d4e8df]">
                <h3 className="text-xl font-bold mb-4">Məhsullar</h3>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 pb-4 border-b border-[#d4e8df] last:border-0" data-testid={`order-item-${idx}`}>
                      <div className="w-16 h-16 bg-[#F5FBF8] rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-[#d4e8df]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#0d291e]">{item.title}</p>
                        <p className="text-sm text-[#5a7869]">{item.quantity || 0} x {item.price || 0} ₼</p>
                      </div>
                      <p className="font-semibold text-[#2d5f4a]">{((item.quantity || 0) * (item.price || 0)).toFixed(2)} ₼</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-[#d4e8df]">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#5a7869]">Ara Cəm</span>
                      <span className="font-semibold">{(order.subtotal || 0).toFixed(2)} ₼</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-[#2d5f4a]">
                        <span>Endirim</span>
                        <span className="font-semibold">-{(order.discount || 0).toFixed(2)} ₼</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold">
                      <span>Cəm</span>
                      <span className="text-[#2d5f4a]" data-testid="order-total">{(order.total || 0).toFixed(2)} ₼</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;