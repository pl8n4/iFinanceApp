//This page manages the Master account and allows the users to add them into there user information. 

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MasterAccountManager({ token, currentUser }) {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name: '', openingAmount: '', closingAmount: '', GroupId: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  // Fetch categories to populate the drop down bar.
  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:5001/api/categories', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setCategories)
      .catch(console.error);
  }, [token]);
  const navigate = useNavigate();

  // Fetch all lines for one account (with its parent Transaction)
  const fetchHistory = async acctId => {
    setSelected(acctId);
    try {
      const res = await fetch(
        `http://localhost:5001/api/master-accounts/${acctId}/transactions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Couldn’t load history');
      const lines = await res.json();
      setHistory(lines);
    } catch (err) {
      setError(err.message);
      console.error('Error loading history:', err);
    }
  };
  
  //gets all the accounts from the database by making a query to the backend and populates it to the table
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
      if (Array.isArray(data)) { //populates an array with accounts fetched from the DB and checks if it did so successfully
        setAccounts(data);
      } else {
        setError('Unexpected response format');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch master accounts');
      console.error('Error fetching master accounts:', err);
    }
  };

  //gets the groups and populates the drop down bar
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
      if (Array.isArray(data)) { //populates an array with the groups fetched from DB and checks if it was successful
        setGroups(data);
      } else {
        setError('No groups found');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch groups');
      console.error('Error fetching groups:', err);
    }
  };

  //should use this upon rendering the page to get information to display
  useEffect(() => {
    if (!token) return;
    fetchAccounts();
    fetchGroups();
  }, [token]);

  //handles submissions made on the submission form
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `http://localhost:5001/api/master-accounts/${editingId}`
      : 'http://localhost:5001/api/master-accounts';
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
      fetchAccounts(); //repopulates the page with the newly updated account list
    } catch (err) {
      setError(err.message);
      console.error('Error submitting master account:', err);
    }
  };

  //will send an updated version of the account backend then the changes are committed and save to the database
  const handleEdit = account => {
    setForm({
      name: account.name,
      openingAmount: account.openingAmount.toString(),
      closingAmount: account.closingAmount.toString(),
      GroupId: account.GroupId || ''
    });
    setEditingId(account.id);
    setError('');
  };

  //sends a request to delete an account from the backend
  const handleDelete = async id => {
    setError('');
    try {
      const res = await fetch(`http://localhost:5001/api/master-accounts/${id}`, {
        method: 'DELETE', //method it will try to use from the controller
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete master account');
      }
      fetchAccounts(); //if delete successful, it will repopulate the page with the newly updated account list
    } catch (err) {
      setError(err.message);
      console.error('Error deleting master account:', err);
    }
  };
  
  //function to handle navigating back to the home page
  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <>
      <div className="user-section">
      <div className="tabs">
        <button onClick={handleGoBack}>Go Back</button>
      </div>
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
          <button type="submit">
            {editingId ? 'Update Account' : 'Add Account'}
          </button>
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
              <th>History</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(account => (
              <tr key={account.id}>
                <td>{account.id}</td>
                <td>{account.name}</td>
                <td>{account.openingAmount.toFixed(2)}</td>
                <td>
                  {(() => {
                    const cat = categories.find(
                      c => c.id === account.accountGroup.AccountCategoryId
                    );
                    const bal = account.closingAmount || 0;
                    const display = Math.abs(bal).toFixed(2);
                    return cat?.type === 'Credit'
                      ? `${display} Cr`
                      : `${display} Dr`;
                  })()}
                </td>
                <td>
                  {groups.find(g => g.id === account.GroupId)?.name || 'N/A'}
                </td>
                <td>
                  <button onClick={() => handleEdit(account)}>Edit</button>{' '}
                  <button onClick={() => handleDelete(account.id)}>Delete</button>
                </td>
                <td>
                  <button onClick={() => fetchHistory(account.id)}>View History</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="history-panel">
          <h3>Transactions for {accounts.find(a => a.id === selected)?.name || '—'}</h3>
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
              </tr>
            </thead>
            <tbody>
              {history.map(line => (
                <tr key={line.id}>
                  <td>{new Date(line.Transaction.date).toLocaleDateString()}</td>
                  <td>{line.Transaction.description}</td>
                  <td>{line.debitedAmount}</td>
                  <td>{line.creditedAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setSelected(null)}>Close History</button>
        </div>
      )}
    </>
  );
}

export default MasterAccountManager;
