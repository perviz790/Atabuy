import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    // 4 saniyə sonra splash screen-i gizlət
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <h1 className="neon-intro">AtaBuy</h1>
      
      <style jsx>{`
        .splash-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #0a0e0f;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          animation: fadeOut 0.5s ease-out 3.5s forwards;
        }

        @keyframes fadeOut {
          to {
            opacity: 0;
            pointer-events: none;
          }
        }

        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes neonPulse {
          0% {
            text-shadow:
              0 0 5px #23b45d,
              0 0 10px #23b45d,
              0 0 20px #23b45d,
              0 0 40px #23b45d;
            color: #ffffff;
          }
          50% {
            text-shadow:
              0 0 10px #00ff80,
              0 0 20px #00ff80,
              0 0 40px #00ff80,
              0 0 80px #00ff80;
            color: #e6ffe6;
          }
          100% {
            text-shadow:
              0 0 5px #23b45d,
              0 0 10px #23b45d,
              0 0 20px #23b45d,
              0 0 40px #23b45d;
            color: #ffffff;
          }
        }

        .neon-intro {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 64px;
          text-transform: uppercase;
          color: #fff;
          text-align: center;
          opacity: 0;
          animation:
            fadeIn 2s ease-out forwards,
            neonPulse 2.5s infinite ease-in-out 2s;
        }

        @media (max-width: 768px) {
          .neon-intro {
            font-size: 48px;
          }
        }

        @media (max-width: 480px) {
          .neon-intro {
            font-size: 32px;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
