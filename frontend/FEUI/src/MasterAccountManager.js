import React, { useEffect, useState } from 'react';

function MasterAccountManager({ token, currentUser }) {
  const [accounts, setAccounts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name: '', openingAmount: '', closingAmount: '', GroupId: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchAccounts = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/master-accounts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch master accounts: ${res.status} ${errorText}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setAccounts(data);
      } else {
        setError('Unexpected response format');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch master accounts');
      console.error('Error fetching master accounts:', err);
    }
  };

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
        setError('No groups found');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch groups');
      console.error('Error fetching groups:', err);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchGroups();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `http://localhost:5001/api/master-accounts/${editingId}` : 'http://localhost:5001/api/master-accounts';
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          openingAmount: parseFloat(form.openingAmount),
          closingAmount: parseFloat(form.closingAmount),
          GroupId: form.GroupId
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Operation failed');
      }
      setForm({ name: '', openingAmount: '', closingAmount: '', GroupId: '' });
      setEditingId(null);
      fetchAccounts();
    } catch (err) {
      setError(err.message);
      console.error('Error submitting master account:', err);
    }
  };

  const handleEdit = (account) => {
    setForm({
      name: account.name,
      openingAmount: account.openingAmount.toString(),
      closingAmount: account.closingAmount.toString(),
      GroupId: account.GroupId || ''
    });
    setEditingId(account.id);
    setError('');
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      const res = await fetch(`http://localhost:5001/api/master-accounts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete master account');
      }
      fetchAccounts();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting master account:', err);
    }
  };

  return (
    <div className="user-section">
      <h2>Manage Master Accounts for {currentUser?.name || 'User'}</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="accountName">Account Name</label>
          <input
            id="accountName"
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="openingAmount">Opening Amount</label>
          <input
            id="openingAmount"
            type="number"
            step="0.01"
            value={form.openingAmount}
            onChange={e => setForm({ ...form, openingAmount: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="closingAmount">Closing Amount</label>
          <input
            id="closingAmount"
            type="number"
            step="0.01"
            value={form.closingAmount}
            onChange={e => setForm({ ...form, closingAmount: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="accountGroup">Account Group</label>
          <select
            id="accountGroup"
            value={form.GroupId}
            onChange={e => setForm({ ...form, GroupId: e.target.value })}
            required
          >
            <option value="">-- Select Group --</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">{editingId ? 'Update Account' : 'Add Account'}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Opening Amount</th>
            <th>Closing Amount</th>
            <th>Group</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map(account => (
            <tr key={account.id}>
              <td>{account.id}</td>
              <td>{account.name}</td>
              <td>{account.openingAmount.toFixed(2)}</td>
              <td>{account.closingAmount.toFixed(2)}</td>
              <td>{groups.find(g => g.id === account.GroupId)?.name || 'N/A'}</td>
              <td>
                <button
                  className="action-button"
                  onClick={() => handleEdit(account)}
                >
                  Edit
                </button>
                <button
                  className="action-button"
                  onClick={() => handleDelete(account.id)}
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

export default MasterAccountManager;