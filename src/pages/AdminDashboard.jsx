import React, { useState, useContext } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AddProduct from '../components/AddProduct';
import ProductManagement from '../components/ManageProducts';
import OrderManagement from '../components/ManageOrders';
import UserManagement from '../components/ManageUsers';
import '../styles/AdminDashboard.css';

// Icons
import { FaHome, FaBoxOpen, FaShoppingCart, FaUsers, FaBars, FaTimes, FaSignOutAlt, FaUser } from 'react-icons/fa';

const AdminDashboard = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentDateTime] = useState('2025-03-26 15:04:42');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="admin-dashboard">
      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <h2>Grocery Shop</h2>
          <span className="admin-sidebar-role">ADMIN PANEL</span>
        </div>

        <div className="admin-sidebar-user">
          <div className="avatar-circle">
            <FaUser />
          </div>
          <div className="user-info">
            <h3>{currentUser?.name || 'Krizzna69'}</h3>
            <span>Administrator</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <ul>
            <li className={isActive('/admin') ? 'active' : ''}>
              <Link to="/admin" onClick={() => isMobile && setSidebarOpen(false)}>
                <FaHome /> <span>Dashboard</span>
              </Link>
            </li>
            <li className={isActive('/admin/add-product') ? 'active' : ''}>
              <Link to="/admin/add-product" onClick={() => isMobile && setSidebarOpen(false)}>
                <FaBoxOpen /> <span>Add Products</span>
              </Link>
            </li>
            <li className={isActive('/admin/products') ? 'active' : ''}>
              <Link to="/admin/products" onClick={() => isMobile && setSidebarOpen(false)}>
                <FaBoxOpen /> <span>Products</span>
              </Link>
            </li>
            <li className={isActive('/admin/orders') ? 'active' : ''}>
              <Link to="/admin/orders" onClick={() => isMobile && setSidebarOpen(false)}>
                <FaShoppingCart /> <span>Orders</span>
              </Link>
            </li>
            <li className={isActive('/admin/users') ? 'active' : ''}>
              <Link to="/admin/users" onClick={() => isMobile && setSidebarOpen(false)}>
                <FaUsers /> <span>Users</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {/* Top Bar */}
        <div className="admin-topbar">
          <div className="admin-breadcrumb">
            <h1>
              {location.pathname === '/admin' && 'Dashboard Overview'}
              {location.pathname === '/admin/products' && 'Product Management'}
              {location.pathname === '/admin/add-product' && 'Add New Product'}
              {location.pathname === '/admin/orders' && 'Order Management'}
              {location.pathname === '/admin/users' && 'User Management'}
            </h1>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-datetime">{currentDateTime}</div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="admin-main-content">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/users" element={<UserManagement />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Simple dashboard home component (you can replace this with your own DashboardHome component if you have one)
const AdminHome = () => (
  <div className="admin-home">
    <h2>Welcome to the Admin Dashboard</h2>
    <p>Use the sidebar navigation to manage your shop.</p>
    <div className="admin-quick-links">
      <Link to="/admin/products" className="admin-quick-link">
        <FaBoxOpen />
        <span>Manage Products</span>
      </Link>
      <Link to="/admin/orders" className="admin-quick-link">
        <FaShoppingCart />
        <span>View Orders</span>
      </Link>
      <Link to="/admin/users" className="admin-quick-link">
        <FaUsers />
        <span>Manage Users</span>
      </Link>
    </div>
  </div>
);

export default AdminDashboard;