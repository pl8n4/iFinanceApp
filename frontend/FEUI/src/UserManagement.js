import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; //for navigation of pages


function UserManagement({ token }) {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); //handles navigation requests

  // <mark> START: Wrap fetchUsers in useCallback </mark>
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        let errorMessage = `Failed to fetch users (Status: ${res.status})`;
        let errorText = '';
        try {
          errorText = await res.text();
          const errorData = JSON.parse(errorText);
          errorMessage += ` - ${errorData.message || 'No details provided'}`;
        } catch (jsonError) {
          errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const contentType = res.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await res.text();
        console.error('Unexpected Content-Type:', contentType, 'Response:', responseText);
        throw new Error(`Unexpected response from server (Content-Type: ${contentType || 'unknown'}). Check console for details.`);
      }

      const data = await res.json();
      setUsers(data);
      setLoading(false);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [token]);
  // <mark> END: Wrap fetchUsers in useCallback </mark>

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token, fetchUsers]);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({ name: user.name });
  };

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      if (!res.ok) {
        let errorMessage = `Failed to update user (Status: ${res.status})`;
        let errorText = '';
        try {
          errorText = await res.text();
          const errorData = JSON.parse(errorText);
          errorMessage += ` - ${errorData.message || 'No details provided'}`;
        } catch (jsonError) {
          errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      alert('User updated successfully!');
      setEditingUser(null);
      fetchUsers();

    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await fetch(`/api/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          let errorMessage = `Failed to delete user (Status: ${res.status})`;
          let errorText = '';
          try {
            errorText = await res.text();
            const errorData = JSON.parse(errorText);
            errorMessage += ` - ${errorData.message || 'No details provided'}`;
          } catch (jsonError) {
            errorMessage += ` - ${errorText}`;
          }
          throw new Error(errorMessage);
        }

        alert('User deleted successfully!');
        fetchUsers();

      } catch (err) { // <--- Added the catch block here
        setError(err.message);
      }
    }
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return <p>Error loading users: {error}</p>;
  }

    //function to handle the submission request to go to the home page
    const handleGoBack = () => {
      navigate('/');
    };

  return (
    <div className="user-management-container">
      <h2>Manage Users</h2>
      {users.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name || ''}
                      onChange={handleEditFormChange}
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>{user.shadow?.userName}</td>
                <td>{user.role}</td>
                <td>
                  {editingUser?.id === user.id ? (
                    <>
                      <button onClick={() => handleUpdateUser(user.id)}>Save</button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditUser(user)}>Edit</button>
                      <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users found.</p>
      )}
      <div className="tabs">
        <button onClick={handleGoBack}>Go Back</button>
      </div>
    </div>
  );
}

export default UserManagement;