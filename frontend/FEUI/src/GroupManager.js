import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

//general function for group manager that accepts a token from the app.js and the currently logged in user
function GroupManager({ token, currentUser }) {
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', AccountCategoryId: '', parentId: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  //will populate the space with all groups currently saved in the database under that user
  const fetchGroups = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch groups: ${res.status} ${errorText}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setGroups(data);
      } else {
        setError('Unexpected response format');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch groups');
      console.error('Error fetching groups:', err);
    }
  };

  //fetches all the categories saved within the database
  //it should be noted that the backend must be seeded with appropriate categories for the 
  //dropdown box to work
  //there should be a note in the README section, but here is the code for seeding
  //you run this in the backend terminal
  //node scripts/seedCategories.js
  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch categories: ${res.status} ${errorText}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setError('No account categories found');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchCategories();
  }, [token]);

  //this handles submissions from the form and sends them to the back using middleware and routing
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `http://localhost:5001/api/groups/${editingId}` : 'http://localhost:5001/api/groups';
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          AccountCategoryId: form.AccountCategoryId,
          parentId: form.parentId || null
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Operation failed');
      }
      setForm({ name: '', AccountCategoryId: '', parentId: '' });
      setEditingId(null);
      //once updated, we must fetch the new list of groups
      fetchGroups();
    } catch (err) {
      setError(err.message);
      console.error('Error submitting group:', err);
    }
  };

  //handles and edit submissions
  const handleEdit = (group) => {
    setForm({
      name: group.name,
      AccountCategoryId: group.AccountCategoryId || '',
      parentId: group.parentId || ''
    });
    setEditingId(group.id);
    setError('');
  };

  //handles deletion of a group by users
  const handleDelete = async (id) => {
    setError('');
    try {
      const res = await fetch(`http://localhost:5001/api/groups/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete group');
      }
      //updates the group list after deletion
      fetchGroups();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting group:', err);
    }
  };

  //this simply handles going back to the home page
  const handleGoBack = () => {
    navigate('/');
  };


  //html to be rendered
  return (
    <div className="user-section">
      <div className="tabs">
        <button onClick={handleGoBack}>Go Back</button>
      </div>
      <h2>Manage Account Groups for {currentUser?.name || 'User'}</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="groupName">Group Name</label>
          <input
            id="groupName"
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="accountCategory">Account Category (Element)</label>
          <select
            id="accountCategory"
            value={form.AccountCategoryId}
            onChange={e => setForm({ ...form, AccountCategoryId: e.target.value })}
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.type})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="parentGroup">Parent Group (optional)</label>
          <select
            id="parentGroup"
            value={form.parentId}
            onChange={e => setForm({ ...form, parentId: e.target.value })}
          >
            <option value="">-- None --</option>
            {groups
              .filter(g => g.id !== editingId)
              .map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
          </select>
        </div>
        <button type="submit">{editingId ? 'Update Group' : 'Add Group'}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Parent Group</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(group => (
            <tr key={group.id}>
              <td>{group.id}</td>
              <td>{group.name}</td>
              <td>{categories.find(c => c.id === group.AccountCategoryId)?.name || 'N/A'}</td>
              <td>
                {group.parentId
                  ? groups.find(g => g.id === group.parentId)?.name || group.parentId
                  : '-'}
              </td>
              <td>
                <button
                  className="action-button"
                  onClick={() => handleEdit(group)}
                >
                  Edit
                </button>
                <button
                  className="action-button"
                  onClick={() => handleDelete(group.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GroupManager;