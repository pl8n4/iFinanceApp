import React, { useState } from 'react';
import './App.css';
import GroupManager from './GroupManager';

function App() {
  const [token, setToken] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState({ username: '', password: '' });
  const [newPassword, setNewPassword] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    userName: '',
    password: '1111',
    role: 'user', // Changed from 'non-admin' to 'user' to match database role
    email: '',
    address: ''
  });
  const [tab, setTab] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      setToken(data.token);
      setCurrentUser(data.user);
    } catch (err) {
      alert('Invalid login');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: form.password,
          newPassword
        })
      });
      if (!res.ok) throw new Error('Password change failed');
      alert('Password changed successfully!');
      setForm({ username: '', password: '' });
      setNewPassword('');
      setCurrentUser(null);
    } catch (err) {
      alert('Error changing password');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });
      if (!res.ok) throw new Error('Failed to create user');
      alert('User created successfully!');
      setNewUser({ name: '', userName: '', password: '1111', role: 'user', email: '', address: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>iFinanceApp Login</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {currentUser.name} ({currentUser.role})</h1>
        <button onClick={() => { setCurrentUser(null); setToken(''); }} className="logout-button">Logout</button>
      </div>

      <div className="user-section">
        <h2>Change Password</h2>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Change Password</button>
        </form>
      </div>

      {currentUser.role === 'admin' && (
        <div className="admin-section">
          <h2>Create New User</h2>
          <form onSubmit={handleCreateUser}>
            <div className="form-group">
              <label htmlFor="newName">Name</label>
              <input
                type="text"
                id="newName"
                value={newUser.name}
                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newUsername">Username</label>
              <input
                type="text"
                id="newUsername"
                value={newUser.userName}
                onChange={e => setNewUser({ ...newUser, userName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newUserPassword">Password</label>
              <input
                type="password"
                id="newUserPassword"
                value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newRole">Role</label>
              <select
                id="newRole"
                value={newUser.role}
                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {newUser.role === 'user' && (
              <>
                <div className="form-group">
                  <label htmlFor="newEmail">Email</label>
                  <input
                    type="email"
                    id="newEmail"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newAddress">Address</label>
                  <input
                    type="text"
                    id="newAddress"
                    value={newUser.address}
                    onChange={e => setNewUser({ ...newUser, address: e.target.value })}
                  />
                </div>
              </>
            )}
            <button type="submit">Create User</button>
          </form>
        </div>
      )}

      {currentUser.role === 'user' && (
        <>
          <div className="tabs">
            <button onClick={() => setTab('groups')}>Manage Groups</button>
          </div>
          {tab === 'groups' && <GroupManager token={token} />}
        </>
      )}
    </div>
  );
}

export default App;