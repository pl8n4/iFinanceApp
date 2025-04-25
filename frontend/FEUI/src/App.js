import React, { useState } from 'react';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import GroupManager from './GroupManager';
import GenerateReports from './GenerateReports';
import UserManagement from './UserManagement';
import MasterAccountManager from './MasterAccountManager'; 
import TransactionManager from './TransactionManager';
import ChangePassword from './passchange';


function App() {
  const [token, setToken] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState({ username: '', password: '' });
  const [newUser, setNewUser] = useState({
    name: '',
    userName: '',
    password: '1111',
    role: 'user',
    email: '',
    address: ''
  });

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/api/auth/login', { // Updated URL to match backend port
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

  
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create user');
      }
      alert('User created successfully!');
      setNewUser({ name: '', userName: '', password: '1111', role: 'user', email: '', address: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          !currentUser ? (
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
          ) : (
            <div className="dashboard-container">
              <div className="dashboard-header">
                <h1>Welcome, {currentUser.name} ({currentUser.role})</h1>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    setToken('');
                  }}
                  className="logout-button"
                >
                  Logout
                </button>
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
                  <h2>User Administration</h2>
                  <button onClick={() => navigate('/users')}>Manage Existing Users</button>
                </div>
              )}

              {currentUser.role === 'user' && (
                <>
                  <div className="tabs">
                    <button onClick={() => navigate('/groupmanager')}>Manage Groups</button>
                    <button onClick={() => navigate('/chartofaccounts')}>Manage Master Accounts</button>
                    <button onClick={() => navigate('/generatereports')}>Generate Reports</button>
                    <button onClick={() => navigate('/transactions')}>Manage Transactions</button>
                    <button onClick={() => navigate('/passchange')}>Change Password</button>
                  </div>
                </>
              )}
            </div>
          )
        }
      />
      <Route path="/groupmanager" element={<GroupManager token={token} currentUser={currentUser} />} />
      <Route path="/chartofaccounts" element={<MasterAccountManager token={token} currentUser={currentUser} />} />
      <Route path="/generatereports" element={<GenerateReports />} />
      <Route path="/users" element={<UserManagement token={token} />} />
      <Route path="/transactions" element={<TransactionManager token={token} currentUser={currentUser}/>}/>
      <Route path="/passchange" element={<ChangePassword token={token} currentUser={currentUser} setCurrentUser={setCurrentUser} />}/>
    </Routes>
  );
}

export default App;