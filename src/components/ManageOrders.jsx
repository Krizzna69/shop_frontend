import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/ManageOrders.css';

const ManageOrders = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentDateTime] = useState('2025-03-27 08:43:20');
  const [currentUser] = useState('Krizzna69');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    // Define function inside useEffect to avoid dependency issues
    const fetchAllOrders = async () => {
      try {
        setLoading(true);
        console.log("Admin: Fetching all orders");
        
        // Collect all orders from all localStorage sources
        let allOrders = [];
        
        // 1. Check allOrders key first
        try {
          const allOrdersStr = localStorage.getItem('allOrders');
          if (allOrdersStr) {
            const parsedOrders = JSON.parse(allOrdersStr);
            if (Array.isArray(parsedOrders)) {
              allOrders = parsedOrders;
              console.log(`Admin: Found ${allOrders.length} orders in allOrders`);
            }
          }
        } catch (err) {
          console.error("Admin: Error reading allOrders:", err);
        }
        
        // 2. Look for user-specific order collections
        const userSpecificOrders = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('orders_')) {
            try {
              const userOrdersStr = localStorage.getItem(key);
              if (userOrdersStr) {
                const userOrders = JSON.parse(userOrdersStr);
                if (Array.isArray(userOrders)) {
                  userSpecificOrders.push(...userOrders);
                  console.log(`Admin: Found ${userOrders.length} orders in ${key}`);
                }
              }
            } catch (err) {
              console.error(`Admin: Error reading ${key}:`, err);
            }
          }
        }
        
        // 3. Check lastOrder as final fallback
        if (allOrders.length === 0 && userSpecificOrders.length === 0) {
          try {
            const lastOrderStr = localStorage.getItem('lastOrder');
            if (lastOrderStr) {
              const lastOrder = JSON.parse(lastOrderStr);
              if (lastOrder && lastOrder._id) {
                allOrders = [lastOrder];
                console.log("Admin: Found order in lastOrder");
              }
            }
          } catch (err) {
            console.error("Admin: Error reading lastOrder:", err);
          }
        } else if (userSpecificOrders.length > 0) {
          // Combine all orders, avoiding duplicates by order ID
          const orderMap = new Map();
          
          // Add allOrders first
          allOrders.forEach(order => {
            if (order && order._id) {
              orderMap.set(order._id, order);
            }
          });
          
          // Then add user-specific orders (may override allOrders)
          userSpecificOrders.forEach(order => {
            if (order && order._id) {
              orderMap.set(order._id, order);
            }
          });
          
          // Convert back to array
          allOrders = Array.from(orderMap.values());
        }
        
        // Sort by date (most recent first)
        allOrders.sort((a, b) => {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
        
        console.log(`Admin: Setting ${allOrders.length} orders in state`);
        console.log("First order sample:", allOrders.length > 0 ? JSON.stringify(allOrders[0]).substring(0, 100) : "No orders");
        setOrders(allOrders);
      } catch (err) {
        setError("Failed to fetch orders: " + (err.message || "Unknown error"));
        console.error("Admin error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllOrders();
  }, [token]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Update order in state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // Update in localStorage - need to check all possible user order stores
      // First check allOrders
      try {
        const allOrdersStr = localStorage.getItem('allOrders');
        if (allOrdersStr) {
          const allOrders = JSON.parse(allOrdersStr);
          if (Array.isArray(allOrders)) {
            const updatedAllOrders = allOrders.map(order => 
              order._id === orderId ? { ...order, status: newStatus } : order
            );
            localStorage.setItem('allOrders', JSON.stringify(updatedAllOrders));
          }
        }
      } catch (err) {
        console.error("Error updating allOrders:", err);
      }
      
      // Now check all user-specific order stores
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('orders_')) {
          try {
            const userOrdersStr = localStorage.getItem(key);
            if (userOrdersStr) {
              const userOrders = JSON.parse(userOrdersStr);
              if (Array.isArray(userOrders)) {
                // Check if this order exists in this user's orders
                const orderExists = userOrders.some(order => order._id === orderId);
                if (orderExists) {
                  const updatedUserOrders = userOrders.map(order => 
                    order._id === orderId ? { ...order, status: newStatus } : order
                  );
                  localStorage.setItem(key, JSON.stringify(updatedUserOrders));
                }
              }
            }
          } catch (err) {
            console.error(`Error updating orders for key ${key}:`, err);
          }
        }
      }
      
      // If selected order is open, update it too
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      setSuccessMessage(`Order status updated to ${newStatus}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      return 'Invalid date';
    }
  };
  
  const formatPrice = (price) => {
    // Add null check before calling toFixed
    return typeof price === 'number' ? `$${price.toFixed(2)}` : '$0.00';
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    // Skip invalid orders
    if (!order || !order._id) return false;
    
    // Apply status filter
    if (statusFilter && order.status !== statusFilter) return false;
    
    // Apply search filter (search by order ID, customer name, or user name)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const orderId = (order._id || '').toLowerCase();
      const customerName = (order.shippingAddress?.fullName || '').toLowerCase();
      const userName = (order.userName || '').toLowerCase();
      
      if (!orderId.includes(searchLower) && 
          !customerName.includes(searchLower) &&
          !userName.includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  console.log("Rendering ManageOrders with", orders.length, "total orders and", filteredOrders.length, "filtered orders");

  return (
    <div className="manage-orders-container" style={{display: 'block', visibility: 'visible'}}>
      <div className="orders-header">
        <h2>Manage Orders</h2>
        <div className="admin-info">
          <span>{currentDateTime}</span>
          <span>Administrator: {currentUser}</span>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      {!selectedOrder && (
        <div className="admin-filter-section">
          <div className="admin-search-container">
            <input
              type="text"
              placeholder="Search by order ID, customer name or username..."
              value={searchTerm}
              onChange={handleSearch}
              className="admin-search-input"
            />
          </div>
          
          <div className="admin-filter-options">
            <div className="admin-filter-group">
              <label>Status:</label>
              <select 
                value={statusFilter} 
                onChange={handleStatusFilter}
                className="admin-filter-select"
              >
                <option value="">All Statuses</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {selectedOrder ? (
        <div className="order-details">
          <div className="order-details-header">
            <h3>Order Details</h3>
            <button className="close-btn" onClick={closeOrderDetails}>×</button>
          </div>
          
          <div className="order-info">
            <p><strong>Order ID:</strong> {selectedOrder._id}</p>
            <p><strong>Date:</strong> {selectedOrder.createdAt ? formatDate(selectedOrder.createdAt) : 'Unknown date'}</p>
            <p><strong>Customer:</strong> {selectedOrder.shippingAddress?.fullName || 'N/A'}</p>
            <p><strong>User Account:</strong> {selectedOrder.userName || selectedOrder.userEmail || 'N/A'}</p>
            <p><strong>Status:</strong> <span className={`status-${(selectedOrder.status || '').toLowerCase()}`}>{selectedOrder.status || 'Unknown'}</span></p>
            <p><strong>Total Amount:</strong> {formatPrice(selectedOrder.totalAmount)}</p>
          </div>

          {selectedOrder.shippingAddress && (
            <div className="shipping-address">
              <h4>Shipping Address</h4>
              <p>{selectedOrder.shippingAddress.address || 'N/A'}</p>
              <p>
                {selectedOrder.shippingAddress.city || 'N/A'}, 
                {selectedOrder.shippingAddress.state || 'N/A'} 
                {selectedOrder.shippingAddress.zipCode || 'N/A'}
              </p>
              {selectedOrder.shippingAddress.phoneNumber && (
                <p>Phone: {selectedOrder.shippingAddress.phoneNumber}</p>
              )}
            </div>
          )}
          
          <h4>Products</h4>
          {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
            <table className="order-products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, index) => {
                  if (!item || !item.product) return null;
                  
                  const itemPrice = typeof item.price === 'number' ? item.price : 0;
                  const itemQuantity = typeof item.quantity === 'number' ? item.quantity : 0;
                  
                  return (
                    <tr key={index}>
                      <td>{item.product.name || 'Unknown Product'}</td>
                      <td>{formatPrice(itemPrice)}</td>
                      <td>{itemQuantity}</td>
                      <td>{formatPrice(itemPrice * itemQuantity)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No product information available</p>
          )}
          
          <div className="update-status">
            <h4>Update Order Status</h4>
            <div className="status-buttons">
              <button 
                className={`status-btn processing ${selectedOrder.status === 'Processing' ? 'active' : ''}`}
                onClick={() => handleStatusChange(selectedOrder._id, 'Processing')}
                disabled={selectedOrder.status === 'Processing'}
              >
                Processing
              </button>
              <button 
                className={`status-btn shipped ${selectedOrder.status === 'Shipped' ? 'active' : ''}`}
                onClick={() => handleStatusChange(selectedOrder._id, 'Shipped')}
                disabled={selectedOrder.status === 'Shipped'}
              >
                Shipped
              </button>
              <button 
                className={`status-btn delivered ${selectedOrder.status === 'Delivered' ? 'active' : ''}`}
                onClick={() => handleStatusChange(selectedOrder._id, 'Delivered')}
                disabled={selectedOrder.status === 'Delivered'}
              >
                Delivered
              </button>
              <button 
                className={`status-btn cancelled ${selectedOrder.status === 'Cancelled' ? 'active' : ''}`}
                onClick={() => handleStatusChange(selectedOrder._id, 'Cancelled')}
                disabled={selectedOrder.status === 'Cancelled'}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="orders-table-container" style={{display: 'block', visibility: 'visible'}}>
          <table className="orders-table" style={{display: 'table', visibility: 'visible'}}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>User</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-orders">No orders available</td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  if (!order || !order._id) return null;
                  
                  return (
                    <tr key={order._id} style={{display: 'table-row', visibility: 'visible'}}>
                      <td className="order-id">{order._id}</td>
                      <td>{order.shippingAddress?.fullName || 'N/A'}</td>
                      <td>{order.userName || 'N/A'}</td>
                      <td>{order.createdAt ? formatDate(order.createdAt) : 'Unknown date'}</td>
                      <td className="order-total">{formatPrice(order.totalAmount)}</td>
                      <td className="order-status">
                        <span className={`status-badge ${(order.status || '').toLowerCase()}`}>
                          {order.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="view-btn"
                          onClick={() => viewOrderDetails(order)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;