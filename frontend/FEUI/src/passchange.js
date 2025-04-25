//This page mainly handles password changes and requires a user to give the old password and the new password to 
//update in the system.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; //for navigation of pages

function ChangePassword({ token, currentUser, setCurrentUser }) {
  const [newPassword, setNewPassword] = useState('');
  const [form, setForm] = useState({ password: '' }); // Removed username as it's not used here
  const navigate = useNavigate(); //handles navigation requests

  //this handles the token passing with changing passwords and send that information to the back end
  //where the information will be changed
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/api/auth/change-password', {
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
      setForm({ password: '' });
      setNewPassword('');
      setCurrentUser(null); // Use the setCurrentUser prop passed down
    } catch (err) {
      alert('Error changing password');
    }
  };
  
  //function to handle the submission request to go to the home page
  const handleGoBack = () => {
    navigate('/');
  };

  //space to be rendered in the browser
  return (
    <div className="user-section">
      <h2>Change Password</h2>
      <form onSubmit={handleChangePassword}>
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Change Password</button>
      </form>
      <div className="tabs">
        <button onClick={handleGoBack}>Go Back</button>
      </div>
    </div>
  );
}

export default ChangePassword;