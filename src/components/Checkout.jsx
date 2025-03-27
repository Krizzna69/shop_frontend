import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { FaArrowLeft, FaMapMarkerAlt, FaPhone, FaUser } from 'react-icons/fa';
import '../styles/Checkout.css';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentDateTime] = useState('2025-03-27 08:39:07');
  const [currentUserName] = useState('Krizzna69');
  
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    deliveryInstructions: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create the order object with a unique ID
      const orderId = 'ORD' + Date.now().toString();
      const userId = currentUser?.id || 'Krizzna69'; // Use consistent user ID
      
      console.log("Creating order for user:", userId);
      
      const order = {
        _id: orderId,
        userId: userId,
        userName: 'Krizzna69',
        items: cart.map(item => ({
          product: {
            _id: item._id,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl
          },
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          deliveryInstructions: formData.deliveryInstructions
        },
        paymentMethod: 'COD',
        totalAmount: cartTotal > 50 ? cartTotal : cartTotal + 10,
        status: 'Processing',
        createdAt: new Date().toISOString()
      };
      
      // Method 1: Store order in user-specific storage
      const userOrdersKey = `orders_${userId}`;
      let userOrders = [];
      
      try {
        const existingOrdersStr = localStorage.getItem(userOrdersKey);
        if (existingOrdersStr) {
          const parsedOrders = JSON.parse(existingOrdersStr);
          if (Array.isArray(parsedOrders)) {
            userOrders = parsedOrders;
          }
        }
      } catch (err) {
        console.error("Error parsing existing orders:", err);
      }
      
      userOrders.unshift(order);
      localStorage.setItem(userOrdersKey, JSON.stringify(userOrders));
      console.log("Order saved to user storage:", userOrdersKey);
      
      // Method 2: Also store in legacy "lastOrder" for backward compatibility
      localStorage.setItem('lastOrder', JSON.stringify(order));
      console.log("Order saved as lastOrder");
      
      // Method 3: Store in global "allOrders" for admin view
      let allOrders = [];
      try {
        const allOrdersStr = localStorage.getItem('allOrders');
        if (allOrdersStr) {
          const parsedOrders = JSON.parse(allOrdersStr);
          if (Array.isArray(parsedOrders)) {
            allOrders = parsedOrders;
          }
        }
      } catch (err) {
        console.error("Error parsing all orders:", err);
      }
      
      allOrders.unshift(order);
      localStorage.setItem('allOrders', JSON.stringify(allOrders));
      console.log("Order saved to allOrders");
      
      // Log all localStorage keys for debugging
      console.log("localStorage keys:", Object.keys(localStorage));
      
      // Clear the cart
      clearCart();
      
      // Navigate to orders page with the new order ID
      navigate('/user/orders', { state: { newOrderId: orderId } });
      
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };
  
  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <div className="user-info">
          <span>{currentDateTime}</span>
          <span>User: {currentUserName}</span>
        </div>
      </div>
      
      <div className="checkout-container">
        <div className="shipping-section">
          <h2>Shipping Information</h2>
          
          {error && <div className="checkout-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="shipping-form">
            <div className="form-group">
              <label htmlFor="fullName">
                <FaUser className="form-icon" /> Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phoneNumber">
                <FaPhone className="form-icon" /> Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">
                <FaMapMarkerAlt className="form-icon" /> Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="zipCode">Zip Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</label>
              <textarea
                id="deliveryInstructions"
                name="deliveryInstructions"
                value={formData.deliveryInstructions}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
            
            <div className="payment-method">
              <h3>Payment Method</h3>
              <div className="payment-option selected">
                <input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  value="COD"
                  checked
                  readOnly
                />
                <label htmlFor="cod">Cash on Delivery</label>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="back-btn"
                onClick={() => navigate('/user/cart')}
              >
                <FaArrowLeft /> Back to Cart
              </button>
              <button 
                type="submit" 
                className="place-order-btn"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="order-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-items">
            {cart.map(item => (
              <div key={item._id} className="summary-item">
                <div className="item-info">
                  <span className="item-quantity">{item.quantity}x</span>
                  <span className="item-name">{item.name}</span>
                </div>
                <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          
          <div className="summary-divider"></div>
          
          <div className="summary-row">
            <span>Subtotal:</span>
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
        </div>
      </div>
    </div>
  );
};

export default Checkout;