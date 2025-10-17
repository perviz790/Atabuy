// Placeholder pages
import React from 'react';
import { Link } from 'react-router-dom';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="min-h-screen bg-[#FAFFFE] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-[#5a7869] mb-6">Bu səhifə hazırda inkişaf mərhələsindədir</p>
        <Link to="/admin" className="btn-primary">Dashboard-a qayıt</Link>
      </div>
    </div>
  );
};

export const AdminProducts = () => <PlaceholderPage title="Məhsullar" />;
export const AdminOrders = () => <PlaceholderPage title="Sifarişlər" />;
export const AdminCoupons = () => <PlaceholderPage title="Kuponlar" />;
export const AdminReviews = () => <PlaceholderPage title="Rəylər" />;
export const AdminNotifications = () => <PlaceholderPage title="Bildirişlər" />;

export default PlaceholderPage;