import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallbackPage = () => {
  const [status, setStatus] = useState('processing');
  const { processSessionId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get session_id from URL fragment
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          setStatus('error');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Process session_id
        const success = await processSessionId(sessionId);
        
        if (success) {
          setStatus('success');
          // Clear URL fragment
          window.history.replaceState(null, '', window.location.pathname);
          // Redirect to home
          setTimeout(() => navigate('/'), 1000);
        } else {
          setStatus('error');
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleCallback();
  }, [processSessionId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#23B45D', borderTopColor: 'transparent' }}></div>
            <p className="mt-4 text-gray-700">Giriş edilir...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full" style={{ backgroundColor: '#23B45D' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="mt-4 text-gray-700">Uğurla daxil oldunuz!</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-red-500 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <p className="mt-4 text-gray-700">Giriş uğursuz oldu. Yenidən cəhd edin...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;