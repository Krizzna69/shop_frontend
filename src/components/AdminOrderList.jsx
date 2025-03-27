import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaSearch, FaSort, FaClipboardList, FaCheck, FaTruck, FaBan } from 'react-icons/fa';
import '../styles/AdminOrderList.css';

const AdminOrderList = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentDateTime] = useState('2025-03-27 04:32:32');
  const [currentUser] = useState('Krizzna69');
  
  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    
    try {
      // Try to fetch real orders from API
      try {
        const response = await fetch('http://localhost:5000/api/admin/orders', {
          headers: {
            'x-auth-token': token
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
          return;
        }
      } catch (err) {
        console.log("Admin API not available, checking localStorage for orders");
      }
      
      // Use orders from localStorage if API is not available
      const savedOrder = localStorage.getItem('lastOrder');
      if (savedOrder) {
        try {
          const parsedOrder = JSON.parse(savedOrder);
          setOrders([parsedOrder]);
        } catch (err) {
          console.error("Error parsing saved order", err);
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // In a real app, you would call the API to update the status
      // For now, just update locally
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      // If localStorage order, update it there too
      const savedOrder = localStorage.getItem('lastOrder');
      if (savedOrder) {
        try {
          const parsedOrder = JSON.parse(savedOrder);
          if (parsedOrder._id === orderId) {
            parsedOrder.status = newStatus;
            localStorage.setItem('lastOrder', JSON.stringify(parsedOrder));
          }
        } catch (err) {
          console.error("Error updating order in localStorage", err);
        }
      }
      
      alert(`Order ${orderId} status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating order status:", err);
      alert('Failed to update order status. Please try again.');
    }
  };
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };
  
  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      // Status filter
      if (statusFilter && order.status !== statusFilter) return false;
      
      // Search by ID or customer name
      if (searchTerm && 
          !order._id.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'date-desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'total-asc':
          return a.totalAmount - b.totalAmount;
        case 'total-desc':
          return b.totalAmount - a.totalAmount;
        default:
          return 0;
      }
    });
  
  if (loading) {
    return <div className="admin-loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="admin-orders-container">
      <div className="admin-orders-header">
        <h2>Order Management</h2>
        <div className="admin-info">
          <span className="current-time">{currentDateTime}</span>
          <span className="admin-name">Administrator: {currentUser}</span>
        </div>
      </div>
      
      <div className="admin-filter-section">
        <div className="admin-search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
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
          
          <div className="admin-filter-group">
            <label>Sort By:</label>
            <select 
              value={sortBy} 
              onChange={handleSortChange}
              className="admin-filter-select"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="total-desc">Total (Highest First)</option>
              <option value="total-asc">Total (Lowest First)</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="admin-no-orders">
          <FaClipboardList className="no-orders-icon" />
          <h3>No Orders Found</h3>
          <p>There are no orders matching your criteria.</p>
        </div>
      ) : (
        <div className="admin-orders-table-container">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  <td className="order-id">{order._id}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td className="customer-info">
                    <div>{order.shippingAddress.fullName}</div>
                    <div className="customer-address">{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                  </td>
                  <td className="item-count">{order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)</td>
                  <td className="order-total">{formatPrice(order.totalAmount)}</td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="order-actions-dropdown">
                      <button className="order-status-btn">Update Status</button>
                      <div className="order-actions-dropdown-content">
                        <button 
                          onClick={() => updateOrderStatus(order._id, 'Processing')}
                          className="processing-btn"
                        >
                          <FaClipboardList /> Processing
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(order._id, 'Shipped')}
                          className="shipped-btn"
                        >
                          <FaTruck /> Shipped
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(order._id, 'Delivered')}
                          className="delivered-btn"
                        >
                          <FaCheck /> Delivered
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(order._id, 'Cancelled')}
                          className="cancelled-btn"
                        >
                          <FaBan /> Cancelled
                        </button>
                      </div>
                    </div>
                    <button 
                      className="view-order-details-btn"
                      onClick={() => alert(`View details for order ${order._id}`)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrderList;