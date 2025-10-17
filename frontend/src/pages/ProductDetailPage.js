import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, ShoppingCart, Star, Check, Truck, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`${API}/products/${id}`);
      setProduct(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Məhsul tapılmadı');
      navigate('/products');
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`${API}/reviews/${id}`);
      setReviews(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.product_id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        product_id: product.id,
        title: product.title,
        price: product.price,
        quantity: quantity,
        image: product.images[0] || ''
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Məhsul səbətə əlavə edildi!');
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#2d5f4a] border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
              <Link to="/track-order" className="text-[#5a7869] hover:text-[#2d5f4a] font-medium transition-colors" data-testid="nav-track">Sifariş izləmə</Link>
              <Link to="/cart" className="text-[#5a7869] hover:text-[#2d5f4a] font-medium transition-colors" data-testid="nav-cart">Səbət</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-[#5a7869]">
          <Link to="/" className="hover:text-[#2d5f4a]">Ana səhifə</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-[#2d5f4a]">Məhsullar</Link>
          <span className="mx-2">/</span>
          <span className="text-[#0d291e]">{product.title}</span>
        </div>

        {/* Product Details */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-[#F5FBF8] rounded-2xl overflow-hidden">
              {product.images && product.images[selectedImage] ? (
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                  data-testid="product-main-image"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-32 h-32 text-[#d4e8df]" />
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square bg-[#F5FBF8] rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? 'border-[#2d5f4a]' : 'border-transparent'
                    }`}
                    data-testid={`thumbnail-${idx}`}
                  >
                    <img src={img} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.brand && (
              <p className="text-sm text-[#5a7869] mb-2 uppercase tracking-wide">{product.brand}</p>
            )}
            <h1 className="text-4xl font-bold mb-4" data-testid="product-title">{product.title}</h1>
            
            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating) ? 'fill-[#f4c430] text-[#f4c430]' : 'text-[#d4e8df]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[#5a7869] text-sm">({product.review_count} rəy)</span>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <p className="text-5xl font-bold text-[#2d5f4a]" data-testid="product-price">{product.price} ₼</p>
                {product.discount_percent > 0 && (
                  <>
                    <p className="text-2xl text-[#5a7869] line-through">{product.original_price} ₼</p>
                    <span className="badge badge-success text-lg px-4">-{product.discount_percent}%</span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-[#5a7869] mb-6 leading-relaxed" data-testid="product-description">{product.description}</p>

            {/* Specs */}
            <div className="space-y-2 mb-6">
              {product.size && (
                <div className="flex items-center gap-2">
                  <span className="text-[#5a7869] text-sm">Ölçü:</span>
                  <span className="font-medium">{product.size}</span>
                </div>
              )}
              {product.color && (
                <div className="flex items-center gap-2">
                  <span className="text-[#5a7869] text-sm">Rəng:</span>
                  <span className="font-medium">{product.color}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-[#5a7869] text-sm">Stok:</span>
                <span className={`font-medium ${product.stock > 0 ? 'text-[#2d5f4a]' : 'text-red-500'}`}>
                  {product.stock > 0 ? `${product.stock} ədəd` : 'Stokda yoxdur'}
                </span>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center border-2 border-[#d4e8df] rounded-full overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-6 py-3 hover:bg-[#F5FBF8] transition-colors"
                    data-testid="decrease-quantity-btn"
                  >
                    -
                  </button>
                  <span className="px-6 py-3 font-semibold" data-testid="quantity-display">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-6 py-3 hover:bg-[#F5FBF8] transition-colors"
                    data-testid="increase-quantity-btn"
                  >
                    +
                  </button>
                </div>
                <Button
                  onClick={addToCart}
                  className="flex-1 btn-primary py-6 text-lg"
                  data-testid="add-to-cart-btn"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Səbətə əlavə et
                </Button>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-[#F5FBF8] rounded-2xl">
              <div className="text-center">
                <Truck className="w-6 h-6 text-[#2d5f4a] mx-auto mb-2" />
                <p className="text-xs text-[#5a7869]">Pulsuz çatdırılma</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-[#2d5f4a] mx-auto mb-2" />
                <p className="text-xs text-[#5a7869]">Təhlükəsiz ödəniş</p>
              </div>
              <div className="text-center">
                <Check className="w-6 h-6 text-[#2d5f4a] mx-auto mb-2" />
                <p className="text-xs text-[#5a7869]">Keyfiyyət zəmanəti</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold" data-testid="reviews-title">Rəylər ({reviews.length})</h2>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating) ? 'fill-[#f4c430] text-[#f4c430]' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{product.rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-white p-6 rounded-2xl border border-[#E0F2E9] shadow-sm hover:shadow-md transition-shadow" data-testid={`review-${review.id}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D084] to-[#00A86B] flex items-center justify-center text-white font-bold">
                        {review.customer_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1B5E20]">{review.customer_name}</p>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'fill-[#f4c430] text-[#f4c430]' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('az-AZ')}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;