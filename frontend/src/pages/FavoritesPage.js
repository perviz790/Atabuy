import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Heart, Trash2 } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import ShareButton from '../components/ShareButton';

const FavoritesPage = () => {
  const { user, loading } = useAuth();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#23B45D', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" style={{ color: '#23B45D' }} />
                <span className="text-xl font-bold">ATABUY</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
                Ana səhifə
              </Link>
              <Link to="/cart">
                <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-gray-900" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8" style={{ color: '#23B45D' }} />
          <h1 className="text-3xl font-bold">Bəyənilən Məhsullar</h1>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Hələ bəyənilən məhsul yoxdur</h2>
            <p className="text-gray-600 mb-6">Bəyəndiyiniz məhsulları bura əlavə edin</p>
            <Link 
              to="/products" 
              className="inline-block px-6 py-3 rounded-lg text-white font-semibold"
              style={{ backgroundColor: '#23B45D' }}
            >
              Məhsullara bax
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">{favorites.length} məhsul</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {favorites.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden border hover:shadow-lg transition-shadow">
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      {product.images && product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(product);
                        }}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>

                      {/* Share button */}
                      <div className="absolute top-3 left-3">
                        <ShareButton product={product} className="shadow-md" />
                      </div>

                      {/* Category badge */}
                      {product.category && (
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-[#23B45D] text-white text-xs font-semibold px-3 py-1 rounded-full">
                            {product.category}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold" style={{ color: '#23B45D' }}>
                          ₼{product.price}
                        </div>
                        {product.rating && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <svg className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                            </svg>
                            {product.rating}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Add to cart button */}
                  <div className="px-4 pb-4">
                    <button 
                      onClick={() => {
                        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                        const existingItem = cart.find(item => item.product_id === product.id);
                        
                        if (existingItem) {
                          existingItem.quantity += 1;
                        } else {
                          cart.push({
                            product_id: product.id,
                            title: product.title,
                            price: product.price,
                            quantity: 1,
                            image: product.images ? product.images[0] : ''
                          });
                        }
                        
                        localStorage.setItem('cart', JSON.stringify(cart));
                        window.dispatchEvent(new Event('cartUpdated'));
                      }}
                      className="w-full py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#23B45D' }}
                    >
                      Səbətə at
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
