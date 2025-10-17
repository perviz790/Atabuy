import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setFavoriteIds(new Set());
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data } = await axios.get(`${API}/user/favorites`, { withCredentials: true });
      setFavorites(data);
      setFavoriteIds(new Set(data.map(p => p.id)));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (product) => {
    if (!user) {
      toast.error('Favorilərə əlavə etmək üçün daxil olun');
      return;
    }

    const isFavorite = favoriteIds.has(product.id);

    try {
      if (isFavorite) {
        await axios.delete(`${API}/user/favorites/${product.id}`, { withCredentials: true });
        setFavorites(favorites.filter(p => p.id !== product.id));
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(product.id);
          return newSet;
        });
        toast.success('Favorilərdən çıxarıldı');
      } else {
        await axios.post(`${API}/user/favorites/${product.id}`, {}, { withCredentials: true });
        setFavorites([...favorites, product]);
        setFavoriteIds(prev => new Set([...prev, product.id]));
        toast.success('Favorilərə əlavə edildi');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Xəta baş verdi');
    }
  };

  const isFavorite = (productId) => {
    return favoriteIds.has(productId);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      favoriteIds,
      toggleFavorite,
      isFavorite,
      fetchFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};
