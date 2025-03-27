import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

const UserSidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Shop Menu</h3>
      </div>
      <ul className="sidebar-menu">
        <li>
          <Link to="/user">Products</Link>
        </li>
        <li>
          <Link to="/user/cart">Shopping Cart</Link>
        </li>
        <li>
          <Link to="/user/orders">My Orders</Link>
        </li>
        <li>
          <Link to="/user/profile">My Profile</Link>
        </li>
      </ul>
    </div>
  );
};

export default UserSidebar;