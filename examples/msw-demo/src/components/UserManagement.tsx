/**
 * User Management Component Example
 * 
 * This example demonstrates how to use MSW (Mock Service Worker) in frontend components
 * for data operations. It shows:
 * - Data fetching with MSW-mocked APIs
 * - CRUD operations (Create, Read, Update, Delete)
 * - Error handling
 * - Loading states
 */

import React, { useState, useEffect } from 'react';

// User data interface
interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

/**
 * UserManagement Component
 * 
 * A complete example showing how to interact with MSW-mocked APIs
 * for managing user data in a frontend component.
 */
export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Fetch all users - MSW intercepts GET /api/v1/data/user
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/data/user');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Create new user - MSW intercepts POST /api/v1/data/user
  const createUser = async (userData: Omit<User, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/data/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      const newUser = await response.json();
      setUsers([...users, newUser]);
      
      // Reset form
      setFormData({ name: '', email: '', status: 'active' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  // Update user - MSW intercepts PATCH /api/v1/data/user/:id
  const updateUser = async (id: string, userData: Partial<User>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/data/user/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      const updatedUser = await response.json();
      setUsers(users.map(u => u.id === id ? updatedUser : u));
      setEditingUser(null);
      setFormData({ name: '', email: '', status: 'active' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  // Delete user - MSW intercepts DELETE /api/v1/data/user/:id
  const deleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/data/user/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }
    
    if (editingUser) {
      updateUser(editingUser.id, formData);
    } else {
      createUser(formData);
    }
  };

  // Handle edit click
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      status: user.status,
    });
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', status: 'active' });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>User Management</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        This component demonstrates CRUD operations using MSW-mocked APIs.
        All API calls are intercepted by MSW and handled locally.
      </p>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#FEE',
          border: '1px solid #C33',
          borderRadius: '4px',
          marginBottom: '16px',
          color: '#C33',
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Create/Edit Form */}
      <div style={{
        padding: '20px',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        marginBottom: '24px',
        backgroundColor: '#F8F9FA',
      }}>
        <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              Name:
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
              }}
              placeholder="Enter user name"
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              Email:
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
              }}
              placeholder="Enter user email"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              Status:
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
              }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
            </button>
            
            {editingUser && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6B7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Users List */}
      <div style={{
        padding: '20px',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>Users List</h2>
          <button
            onClick={fetchUsers}
            disabled={loading}
            style={{
              padding: '6px 12px',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loading && users.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Loading users...</p>
        ) : users.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No users found. Create one above!</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8F9FA', borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '12px' }}>{user.name}</td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: user.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                      color: user.status === 'active' ? '#065F46' : '#991B1B',
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleEdit(user)}
                      disabled={loading}
                      style={{
                        padding: '4px 8px',
                        marginRight: '8px',
                        backgroundColor: '#F59E0B',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      disabled={loading}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#EF4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Technical Notes */}
      <details style={{ marginTop: '24px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold', padding: '8px' }}>
          📚 Technical Implementation Notes
        </summary>
        <div style={{
          marginTop: '12px',
          padding: '16px',
          backgroundColor: '#F8F9FA',
          borderRadius: '4px',
          fontSize: '14px',
          lineHeight: '1.6',
        }}>
          <h3>MSW Integration Points:</h3>
          <ol>
            <li>
              <strong>GET /api/v1/data/user</strong> - Fetches all users
              <pre style={{ backgroundColor: '#E5E7EB', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
{`const response = await fetch('/api/v1/data/user');
const users = await response.json();`}
              </pre>
            </li>
            <li>
              <strong>POST /api/v1/data/user</strong> - Creates a new user
              <pre style={{ backgroundColor: '#E5E7EB', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
{`const response = await fetch('/api/v1/data/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(userData)
});`}
              </pre>
            </li>
            <li>
              <strong>PATCH /api/v1/data/user/:id</strong> - Updates a user
              <pre style={{ backgroundColor: '#E5E7EB', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
{`const response = await fetch(\`/api/v1/data/user/\${id}\`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updates)
});`}
              </pre>
            </li>
            <li>
              <strong>DELETE /api/v1/data/user/:id</strong> - Deletes a user
              <pre style={{ backgroundColor: '#E5E7EB', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
{`const response = await fetch(\`/api/v1/data/user/\${id}\`, {
  method: 'DELETE'
});`}
              </pre>
            </li>
          </ol>
          <p><strong>Note:</strong> All these API calls are automatically intercepted and handled by MSW when the worker is running.</p>
        </div>
      </details>
    </div>
  );
};

UserManagement.displayName = 'UserManagement';
