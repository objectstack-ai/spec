/**
 * User List Component - Using Custom Hooks
 * 
 * This is a simpler example showing how to use custom hooks
 * for MSW data operations in React components.
 */

import React from 'react';
import { useObjectData, useDeleteData } from '../hooks/useObjectData';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

/**
 * UserList Component
 * 
 * Demonstrates using custom hooks for cleaner, more maintainable code.
 */
export const UserList: React.FC = () => {
  // Use the custom hook for data fetching
  const { data: users, loading, error, refetch } = useObjectData<User[]>('user');
  
  // Use the custom hook for deletion
  const { execute: deleteUser, loading: deleting } = useDeleteData('user', {
    onSuccess: () => {
      console.log('User deleted successfully');
      refetch(); // Refresh the list
    },
    onError: (err) => {
      alert(`Failed to delete user: ${err}`);
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
      } catch (err) {
        // Error already handled by hook's onError callback
        console.error('Delete failed:', err);
      }
    }
  };

  if (loading && !users) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{
          padding: '12px',
          backgroundColor: '#FEE',
          border: '1px solid #C33',
          borderRadius: '4px',
          color: '#C33',
        }}>
          <strong>Error:</strong> {error}
        </div>
        <button
          onClick={() => refetch()}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1>User List (with Hooks)</h1>
        <button
          onClick={() => refetch()}
          disabled={loading}
          style={{
            padding: '8px 16px',
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

      <p style={{ color: '#666', marginBottom: '24px' }}>
        This component uses custom hooks (<code>useObjectData</code> and <code>useDeleteData</code>)
        for cleaner, more maintainable code.
      </p>

      {!users || users.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
          No users found.
        </p>
      ) : (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
        }}>
          <thead>
            <tr style={{ backgroundColor: '#F8F9FA', borderBottom: '2px solid #E5E7EB' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                  {user.id}
                </td>
                <td style={{ padding: '12px', fontWeight: 500 }}>{user.name}</td>
                <td style={{ padding: '12px', color: '#666' }}>{user.email}</td>
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
                    onClick={() => handleDelete(user.id)}
                    disabled={deleting}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#EF4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: deleting ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      opacity: deleting ? 0.6 : 1,
                    }}
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Code Example */}
      <details style={{ marginTop: '24px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold', padding: '8px' }}>
          💡 View Component Source Code
        </summary>
        <pre style={{
          marginTop: '12px',
          padding: '16px',
          backgroundColor: '#F8F9FA',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '12px',
          lineHeight: '1.5',
        }}>
{`// Fetching data with custom hook
const { data: users, loading, error, refetch } = useObjectData<User[]>('user');

// Deleting data with custom hook
const { execute: deleteUser } = useDeleteData('user', {
  onSuccess: () => refetch(),
  onError: (err) => alert(err),
});

// Using the hooks
await deleteUser(userId);
await refetch();
`}
        </pre>
      </details>
    </div>
  );
};

UserList.displayName = 'UserList';
