import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaSearch, FaUserEdit, FaUserLock, FaUserCheck, FaExclamationTriangle } from 'react-icons/fa';
import '../styles/ManageUsers.css';

const ManageUsers = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  // Updated timestamp as provided
  const [currentDateTime] = useState('2025-03-26 15:56:07');
  const [currentUser] = useState('Krizzna69');

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Try API call first (this will fail with 404 until backend is implemented)
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        // If API fails, use mock data temporarily
        console.log("API not available yet, using mock data");
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      
      // Fallback to mock data while API is being developed
      const mockUsers = [
        {
          _id: '1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          role: 'user',
          createdAt: '2025-02-15T10:30:00Z'
        },
        {
          _id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          role: 'user',
          createdAt: '2025-02-20T14:45:00Z'
        },
        {
          _id: '3',
          name: currentUser,
          email: 'admin@groceryshop.com',
          role: 'admin',
          createdAt: '2025-01-10T09:15:00Z'
        },
        {
          _id: '4',
          name: 'Emily Davis',
          email: 'emily.davis@example.com',
          role: 'user',
          createdAt: '2025-03-05T16:20:00Z'
        },
        {
          _id: '5',
          name: 'David Wilson',
          email: 'david.wilson@example.com',
          role: 'user',
          createdAt: '2025-03-12T11:10:00Z'
        }
      ];
      setUsers(mockUsers);
      
      // Only show error banner if it's not a 404 (which is expected until API is built)
      if (!err.message.includes('404')) {
        setError('Error connecting to server. Using mock data temporarily.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      // First try to make the API call (this will fail until backend is implemented)
      let success = false;
      
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({ role: newRole })
        });

        if (response.ok) {
          success = true;
        }
      } catch (apiErr) {
        console.log("API endpoint not available yet:", apiErr);
      }

      // If API call failed, just update local state for demo purposes
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        )
      );

      if (!success) {
        console.log("API not available, role change simulated locally");
      }
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <div className="loading-message">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <div className="admin-info">
          <span className="current-time">{currentDateTime}</span>
          <span className="admin-name">Administrator: {currentUser}</span>
        </div>
        
        {error && (
          <div className="api-warning">
            <FaExclamationTriangle /> {error}
          </div>
        )}
        
        <div className="search-and-filter">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <select 
              value={roleFilter} 
              onChange={handleRoleFilter}
              className="role-filter"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="no-users-message">
          No users found. {searchTerm || roleFilter ? 'Try adjusting your filters.' : ''}
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td className="actions-cell">
                    <button 
                      className="edit-role-btn"
                      onClick={() => handleRoleChange(
                        user._id, 
                        user.role === 'admin' ? 'user' : 'admin'
                      )}
                      disabled={user.email === 'admin@groceryshop.com' || user.name === currentUser} // Prevent changing own role
                    >
                      {user.role === 'admin' ? (
                        <>
                          <FaUserLock /> Make User
                        </>
                      ) : (
                        <>
                          <FaUserCheck /> Make Admin
                        </>
                      )}
                    </button>
                    <button
                      className="edit-user-btn"
                      onClick={() => {
                        setSelectedUser(user);
                        setEditMode(true);
                      }}
                    >
                      <FaUserEdit /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Edit Modal */}
      {selectedUser && editMode && (
        <div className="user-edit-modal">
          <div className="user-edit-content">
            <div className="user-edit-header">
              <h3>Edit User</h3>
              <button className="close-modal" onClick={() => setEditMode(false)}>×</button>
            </div>
            <div className="user-edit-body">
              <p>Editing user: {selectedUser.name}</p>
              <p>This feature is under development.</p>
            </div>
            <div className="user-edit-footer">
              <button className="close-btn" onClick={() => setEditMode(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;