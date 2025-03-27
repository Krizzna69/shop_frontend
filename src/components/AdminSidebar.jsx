import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

const AdminSidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Admin Panel</h3>
      </div>
      <ul className="sidebar-menu">
        <li>
          <Link to="/admin">Dashboard</Link>
        </li>
        <li>
          <Link to="/admin/add-product">Add Product</Link>
        </li>
        <li>
          <Link to="/admin/manage-products">Manage Products</Link>
        </li>
        <li>
          <Link to="/admin/orders">Orders</Link>
        </li>
        <li>
          <Link to="/admin/users">Manage Users</Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;