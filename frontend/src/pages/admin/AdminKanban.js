import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, Package, Plane, Warehouse, Truck, CheckCircle, ArrowLeft, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CANCELLATION_REASONS = [
  "Müştəri sifarişdən imtina etdi",
  "Məhsul stokda yoxdur",
  "Ödəniş problemi",
  "Çatdırılma ünvanı yanlışdır",
  "Müştəri əlaqə saxlamadı",
  "Texniki xəta",
  "Digər səbəb"
];

const STATUS_CONFIG = {
  confirmed: {
    label: 'Təsdiqləndi',
    icon: CheckCircle,
    color: '#3B82F6',
    bgColor: '#EFF6FF'
  },
  warehouse: {
    label: 'Anbarda',
    icon: Warehouse,
    color: '#F59E0B',
    bgColor: '#FEF3C7'
  },
  airplane: {
    label: 'Təyyarədə',
    icon: Plane,
    color: '#8B5CF6',
    bgColor: '#F3E8FF'
  },
  atabuy_warehouse: {
    label: 'AtaBuy Anbarı',
    icon: Package,
    color: '#EC4899',
    bgColor: '#FCE7F3'
  },
  delivered: {
    label: 'Çatdırıldı',
    icon: Truck,
    color: '#23B45D',
    bgColor: '#E8F5E9'
  }
};

const AdminKanban = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedOrder, setDraggedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const { data } = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Sifarişlər yüklənə bilmədi');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, order) => {
    setDraggedOrder(order);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    
    if (!draggedOrder || draggedOrder.status === newStatus) {
      setDraggedOrder(null);
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(
        `${API}/orders/${draggedOrder.id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setOrders(orders.map(order => 
        order.id === draggedOrder.id 
          ? { ...order, status: newStatus }
          : order
      ));

      toast.success('Sifariş statusu yeniləndi');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Status yenilənə bilmədi');
    } finally {
      setDraggedOrder(null);
    }
  };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#23B45D', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sifariş İdarəetməsi</h1>
                <p className="text-sm text-gray-600">Sifarişləri sürüklə-burax ilə idarə et</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Cəmi Sifarişlər: </span>
                <span className="font-bold text-gray-900">{orders.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 h-[calc(100vh-200px)]">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const Icon = config.icon;
            const statusOrders = getOrdersByStatus(status);

            return (
              <div
                key={status}
                className="flex flex-col rounded-xl border bg-white overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                {/* Column Header */}
                <div className="p-4 border-b" style={{ backgroundColor: config.bgColor }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" style={{ color: config.color }} />
                      <h3 className="font-bold text-gray-900">{config.label}</h3>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white" style={{ color: config.color }}>
                      {statusOrders.length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {statusOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Icon className="w-12 h-12 mb-2 opacity-30" />
                      <p className="text-sm">Sifariş yoxdur</p>
                    </div>
                  ) : (
                    statusOrders.map((order) => (
                      <div
                        key={order.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, order)}
                        className="bg-white border rounded-lg p-4 cursor-move hover:shadow-lg transition-all"
                        style={{
                          opacity: draggedOrder?.id === order.id ? 0.5 : 1
                        }}
                      >
                        {/* Order Card */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">#{order.id}</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {order.payment_status === 'paid' ? 'Ödənilib' : 'Gözləyir'}
                            </span>
                          </div>

                          <div className="text-sm">
                            <p className="font-semibold text-gray-800">{order.customer_name}</p>
                            <p className="text-gray-600">{order.customer_email}</p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="text-xs text-gray-500">
                              {order.items?.length || 0} məhsul
                            </div>
                            <div className="font-bold" style={{ color: config.color }}>
                              {order.total?.toFixed(2)} ₼
                            </div>
                          </div>

                          {order.tracking_number && (
                            <div className="text-xs text-gray-500 font-mono">
                              {order.tracking_number}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminKanban;
