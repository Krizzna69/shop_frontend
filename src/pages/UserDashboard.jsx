import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import UserSidebar from '../components/UserSidebar';
import ProductList from '../components/ProductList';
import Cart from '../components/Cart';
import Checkout from '../components/Checkout';
import Orders from '../components/Orders';
import '../styles/Dashboard.css';

const UserDashboard = () => {
  const { currentUser, logout } = useContext(AuthContext);

  return (
    <div className="dashboard-container">
      <UserSidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h2>Vijayalakshmi Coffee Works</h2>
          <div className="user-info">
            <span>Welcome, {currentUser?.name || 'User'}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </header>
        <div className="dashboard-main">
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            {/* Add more user routes as needed */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;