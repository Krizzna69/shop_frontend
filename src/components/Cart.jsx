import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaTrash, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import '../styles/Cart.css';

const Cart = () => {
  const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [currentDateTime] = useState('2025-03-27 03:34:39');
  const [currentUser] = useState('Krizzna69');
  
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };
  
  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, parseInt(newQuantity));
  };
  
  const handleCheckout = () => {
    navigate('/user/checkout');
  };
  
  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <FaShoppingCart className="empty-cart-icon" />
        <h2>Your Cart is Empty</h2>
        <p>You haven't added any items to your cart yet.</p>
        <Link to="/user" className="continue-shopping-btn">
          <FaArrowLeft /> Continue Shopping
        </Link>
      </div>
    );
  }
  
  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Your Shopping Cart</h1>
        <div className="cart-user-info">
          <span>{currentDateTime}</span>
          <span>User: {currentUser}</span>
        </div>
      </div>
      
      <div className="cart-container">
        <div className="cart-items">
          <div className="cart-items-header">
            <span className="item-col">Item</span>
            <span className="price-col">Price</span>
            <span className="quantity-col">Quantity</span>
            <span className="total-col">Total</span>
            <span className="action-col">Action</span>
          </div>
          
          {cart.map(item => (
            <div className="cart-item" key={item._id}>
              <div className="item-col">
                <div className="item-details">
                  <img 
                    src={item.imageUrl || 'https://via.placeholder.com/80'} 
                    alt={item.name} 
                    className="item-image"
                  />
                  <div className="item-info">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-category">{item.category}</p>
                  </div>
                </div>
              </div>
              
              <div className="price-col">
                {formatPrice(item.price)}
              </div>
              
              <div className="quantity-col">
                <div className="quantity-control">
                  <button 
                    onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                    className="quantity-btn"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                    className="quantity-input"
                  />
                  <button 
                    onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="total-col">
                {formatPrice(item.price * item.quantity)}
              </div>
              
              <div className="action-col">
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item._id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-row">
            <span>Items ({cart.reduce((sum, item) => sum + item.quantity, 0)}):</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          
          <div className="summary-row">
            <span>Shipping:</span>
            <span>{cartTotal > 50 ? 'Free' : formatPrice(10)}</span>
          </div>
          
          <div className="summary-divider"></div>
          
          <div className="summary-row total">
            <span>Total:</span>
            <span>{formatPrice(cartTotal > 50 ? cartTotal : cartTotal + 10)}</span>
          </div>
          
          <div className="cart-actions">
            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
            
            <Link to="/user" className="continue-shopping-link">
              <FaArrowLeft /> Continue Shopping
            </Link>
            
            <button className="clear-cart-btn" onClick={clearCart}>
              <FaTrash /> Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;