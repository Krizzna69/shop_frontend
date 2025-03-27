import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import AddToCartButton from './AddToCartButton';
import { FaShoppingCart, FaUser, FaClock } from 'react-icons/fa';
import '../styles/ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);
  const { cartCount, addToCart } = useContext(CartContext);
  const [currentDateTime] = useState('2025-03-27 03:26:39');
  const [currentUser] = useState('Krizzna69');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }

      // If product data returned successfully
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      
      // Fallback to mock data in case the API isn't available
      const mockProducts = [
        {
          _id: '1',
          name: 'Fresh Organic Apples',
          description: 'Sweet and juicy organic apples.',
          price: 3.99,
          category: 'Fruits',
          imageUrl: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=300',
          stockQuantity: 50
        },
        {
          _id: '2',
          name: 'Whole Grain Bread',
          description: 'Nutritious whole grain bread.',
          price: 4.50,
          category: 'Bakery',
          imageUrl: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=300',
          stockQuantity: 30
        },
        {
          _id: '3',
          name: 'Organic Milk',
          description: 'Fresh organic milk from grass-fed cows.',
          price: 3.75,
          category: 'Dairy',
          imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300',
          stockQuantity: 40
        },
        {
          _id: '4',
          name: 'Fresh Spinach',
          description: 'Farm fresh spinach, washed and ready to eat.',
          price: 2.99,
          category: 'Vegetables',
          imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=300',
          stockQuantity: 25
        }
      ];
      
      setProducts(mockProducts);
      setError('Using mock data. API connection failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h2>Available Products</h2>
        <div className="user-info">
          <div className="cart-info">
            <FaShoppingCart className="info-icon" />
            <span className="cart-count">{cartCount}</span>
          </div>
        </div>
      </div>
      
      {error && <div className="api-warning">{error}</div>}
      
      <div className="product-grid">
        {products.length === 0 ? (
          <div className="no-products">No products available.</div>
        ) : (
          products.map(product => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <p className="product-price">${product.price.toFixed(2)}</p>
                <p className="product-stock">
                  {product.stockQuantity > 0 
                    ? `In Stock: ${product.stockQuantity}` 
                    : 'Out of Stock'}
                </p>
                <AddToCartButton 
                  product={product}
                  onAddToCart={handleAddToCart}
                  disabled={product.stockQuantity <= 0}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;