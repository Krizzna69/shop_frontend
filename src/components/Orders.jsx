import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaBox, FaArrowLeft } from 'react-icons/fa';
import '../styles/Orders.css';

const Orders = () => {
  const { currentUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDateTime] = useState('2025-03-27 08:39:07');
  const [currentUserName] = useState('Krizzna69');
  const location = useLocation();
  
  // Check if a new order was just placed
  const newOrderId = location.state?.newOrderId;
  
  useEffect(() => {
    // This function is defined inside useEffect to avoid dependency issues
    const fetchOrders = async () => {
      setLoading(true);
      
      try {
        // Get user ID from context or use username as fallback
        const userId = currentUser?.id || 'Krizzna69'; // Use consistent user ID
        console.log('Fetching orders for user:', userId);
        
        let userOrders = [];
        
        // Method 1: Try user-specific storage
        const userOrdersKey = `orders_${userId}`;
        
        try {
          const userOrdersStr = localStorage.getItem(userOrdersKey);
          console.log(`Checking ${userOrdersKey}:`, Boolean(userOrdersStr));
          
          if (userOrdersStr) {
            const parsedOrders = JSON.parse(userOrdersStr);
            if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
              userOrders = parsedOrders;
              console.log(`Found ${parsedOrders.length} orders in ${userOrdersKey}`);
            }
          }
        } catch (err) {
          console.error(`Error reading from ${userOrdersKey}:`, err);
        }
        
        // Method 2: Try allOrders if user-specific storage is empty
        if (userOrders.length === 0) {
          console.log("Checking allOrders as fallback");
          try {
            const allOrdersStr = localStorage.getItem('allOrders');
            if (allOrdersStr) {
              const allOrders = JSON.parse(allOrdersStr);
              if (Array.isArray(allOrders)) {
                // Filter to get orders for this user
                userOrders = allOrders.filter(order => 
                  order.userId === userId ||
                  order.userName === 'Krizzna69'
                );
                console.log(`Found ${userOrders.length} orders for user in allOrders`);
              }
            }
          } catch (err) {
            console.error("Error reading from allOrders:", err);
          }
        }
        
        // Method 3: Try lastOrder as final fallback
        if (userOrders.length === 0) {
          console.log("Checking lastOrder as final fallback");
          try {
            const lastOrderStr = localStorage.getItem('lastOrder');
            if (lastOrderStr) {
              const lastOrder = JSON.parse(lastOrderStr);
              if (lastOrder && lastOrder._id) {
                // Only add if it belongs to this user or has no user info
                if (!lastOrder.userId || 
                    lastOrder.userId === userId || 
                    lastOrder.userName === 'Krizzna69') {
                  userOrders = [lastOrder];
                  console.log("Found order in lastOrder");
                }
              }
            }
          } catch (err) {
            console.error("Error reading from lastOrder:", err);
          }
        }
        
        // Log keys for debugging
        console.log("All localStorage keys:", Object.keys(localStorage));
        console.log(`Setting ${userOrders.length} orders in state`);
        
        // Set the orders in state
        setOrders(userOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [currentUser, newOrderId]); // Dependencies: currentUser and newOrderId
  
  const formatDate = (dateString) => {
    try {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      return 'Unknown date';
    }
  };
  
  const formatPrice = (price) => {
    // Add null check before calling toFixed
    return typeof price === 'number' ? `$${price.toFixed(2)}` : '$0.00';
  };
  
  // Calculate item total safely
  const calculateItemTotal = (item) => {
    if (!item) return 0;
    const price = typeof item.price === 'number' ? item.price : 0;
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
    return price * quantity;
  };
  
  // Calculate order subtotal safely
  const calculateOrderSubtotal = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };
  
  if (loading) {
    return <div className="loading">Loading your orders...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!orders || orders.length === 0) {
    return (
      <div className="no-orders">
        <FaBox className="no-orders-icon" />
        <h2>No Orders Found</h2>
        <p>You haven't placed any orders yet.</p>
        <Link to="/user" className="shop-now-btn">
          <FaArrowLeft /> Shop Now
        </Link>
      </div>
    );
  }
  
  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>My Orders</h1>
        <div className="orders-user-info">
          <span>{currentDateTime}</span>
          <span>User: {currentUserName}</span>
        </div>
      </div>
      
      <div className="orders-list">
        {orders.map((order, index) => {
          // Skip invalid orders
          if (!order || !order._id) {
            return null;
          }
          
          const orderSubtotal = calculateOrderSubtotal(order.items);
          const shippingCost = (typeof order.totalAmount === 'number' && order.totalAmount > orderSubtotal) 
            ? order.totalAmount - orderSubtotal 
            : 0;
          
          return (
            <div 
              key={order._id} 
              className={`order-card ${newOrderId === order._id ? 'new-order' : ''}`}
              id={newOrderId === order._id ? 'new-order' : undefined}
            >
              {newOrderId === order._id && (
                <div className="new-order-badge">New Order</div>
              )}
              
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order._id}</h3>
                  <p className="order-date">
                    Placed on {order.createdAt ? formatDate(order.createdAt) : 'Unknown date'}
                  </p>
                </div>
                <div className="order-status">
                  <span className={`status-badge ${(order.status || '').toLowerCase()}`}>
                    {order.status || 'Processing'}
                  </span>
                  <span className="order-total">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
              
              <div className="order-items">
                {Array.isArray(order.items) && order.items.map((item, itemIndex) => {
                  if (!item || !item.product) {
                    return null;
                  }
                  
                  return (
                    <div key={itemIndex} className="order-item">
                      <div className="item-image">
                        <img 
                          src={item.product.imageUrl || 'https://via.placeholder.com/60'} 
                          alt={item.product.name || 'Product'} 
                        />
                      </div>
                      <div className="item-details">
                        <h4>{item.product.name || 'Unknown Product'}</h4>
                        <p className="item-price">
                          {formatPrice(item.price)} x {item.quantity || 1}
                        </p>
                      </div>
                      <div className="item-total">
                        {formatPrice(calculateItemTotal(item))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="order-footer">
                {order.shippingAddress && (
                  <div className="shipping-info">
                    <h4>Shipping Address</h4>
                    <p>{order.shippingAddress.fullName || 'N/A'}</p>
                    <p>{order.shippingAddress.address || 'N/A'}</p>
                    <p>
                      {order.shippingAddress.city || 'N/A'}, 
                      {' '}{order.shippingAddress.state || 'N/A'} 
                      {' '}{order.shippingAddress.zipCode || 'N/A'}
                    </p>
                    {order.shippingAddress.phoneNumber && (
                      <p>Phone: {order.shippingAddress.phoneNumber}</p>
                    )}
                  </div>
                )}
                
                <div className="payment-info">
                  <h4>Payment Method</h4>
                  <p>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : (order.paymentMethod || 'N/A')}</p>
                  
                  <h4 className="order-summary-title">Order Summary</h4>
                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Items Total:</span>
                      <span>{formatPrice(orderSubtotal)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping:</span>
                      <span>{shippingCost > 0 ? formatPrice(shippingCost) : 'Free'}</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;