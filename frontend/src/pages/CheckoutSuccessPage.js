import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Loader2, Package } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // checking, success, error
  const [orderData, setOrderData] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 10;

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      navigate('/checkout');
      return;
    }

    pollPaymentStatus();
  }, [sessionId]);

  const pollPaymentStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/checkout/status/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();
      
      if (data.payment_status === 'paid') {
        setStatus('success');
        setOrderData(data);
        // Clear cart
        localStorage.removeItem('cart');
        return;
      } else if (data.status === 'expired') {
        setStatus('error');
        return;
      }

      // Continue polling
      if (attempts < MAX_ATTEMPTS) {
        setAttempts(prev => prev + 1);
        setTimeout(pollPaymentStatus, 2000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setStatus('error');
    }
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 mx-auto animate-spin" style={{ color: '#23B45D' }} />
          <h2 className="text-2xl font-bold text-gray-900">Ödəniş yoxlanılır...</h2>
          <p className="text-gray-600">Zəhmət olmasa gözləyin</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Ödəniş xətası</h2>
          <p className="text-gray-600">Ödəniş təsdiqlənmədi. Zəhmət olmasa yenidən cəhd edin.</p>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full px-6 py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: '#23B45D' }}
          >
            Geri qayıt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: '#23B45D' }}>
          <Check className="w-12 h-12 text-white" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Ödəniş uğurlu!</h2>
          <p className="text-gray-600">Sifarişiniz təsdiqləndi</p>
        </div>

        {orderData && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Sifariş nömrəsi:</span>
              <span className="font-bold text-gray-900">{orderData.order_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Məbləğ:</span>
              <span className="font-bold text-gray-900">{orderData.amount_total} {orderData.currency.toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#E8F5E9', color: '#23B45D' }}>
                Ödənilib
              </span>
            </div>
          </div>
        )}

        <div className="pt-4 space-y-3">
          <button
            onClick={() => navigate('/track-order')}
            className="w-full px-6 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            style={{ backgroundColor: '#23B45D' }}
          >
            <Package className="w-5 h-5" />
            Sifarişi izlə
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 rounded-xl border-2 font-semibold"
            style={{ borderColor: '#23B45D', color: '#23B45D' }}
          >
            Ana səhifəyə qayıt
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;