import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TransactionManager({ token, currentUser }) {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    date: '', 
    description: '',
    lines: [
        { MasterAccountId: '', debitedAmount: '', creditedAmount: '', comment: '' }
    ]
});
const [accounts, setAccounts] = useState([]);

// Fetch master accounts
useEffect(() => {
  if (!token) return;
  fetch('http://localhost:5001/api/master-accounts', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(r => r.json())
    .then(setAccounts)
    .catch(console.error);
}, [token]);

  // Fetch existing transactions once we have a token
  useEffect(() => {
    if (!token) return;
    fetch('/api/transactions', {
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    })
      .then(res => res.json())
      .then(setTransactions)
      .catch(console.error);
  }, [token]);

  // 2) Handle new-transaction submits
  const handleAdd = async e => {
    e.preventDefault();
  
    // 1) Build payload: include date, description, and lines
    const payload = {
      date: form.date,
      description: form.description,
      lines: form.lines.map(l => ({
        MasterAccountId: l.MasterAccountId,                   // UUID of account
        debitedAmount: parseFloat(l.debitedAmount) || 0,      // numeric debit
        creditedAmount: parseFloat(l.creditedAmount) || 0,    // numeric credit
        comment: l.comment                                    // optional note
      }))
    };
  
    // 2) Send to your transactions endpoint
    const res = await fetch('http://localhost:5001/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
  
    // 3) Error handling
    if (!res.ok) {
      const err = await res.json();
      return alert(err.message);
    }
  
    // 4) On success, prepend and reset form
    const newTx = await res.json();
    setTransactions([newTx, ...transactions]);
    setForm({
      date: '',
      description: '',
      lines: [
        { MasterAccountId: '', debitedAmount: '', creditedAmount: '', comment: '' }
      ]
    });
    navigate('/chartofaccounts');
  };

  return (
    <div className="manager">
      <h2>Transactions for {currentUser.name}</h2>

      {/* 2) Hook handleAdd up here */}
      <form onSubmit={handleAdd} className="tx-form">
        {/* Master fields */}
        <input
          type="date"
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          required
        />

        <h4>Entries</h4>
        {form.lines.map((line, i) => (
          <div key={i} className="tx-line">
            <select
              value={line.MasterAccountId}
              onChange={e => {
                const newLines = [...form.lines];
                newLines[i].MasterAccountId = e.target.value;
                setForm({ ...form, lines: newLines });
              }}
              required
            >
              <option value="" disabled>Choose account…</option>
              {accounts.map(ac => (
                <option key={ac.id} value={ac.id}>{ac.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Debit"
              value={line.debitedAmount}
              onChange={e => {
                const newLines = [...form.lines];
                newLines[i].debitedAmount = e.target.value;
                setForm({ ...form, lines: newLines });
              }}
            />
            <input
              type="number"
              placeholder="Credit"
              value={line.creditedAmount}
              onChange={e => {
                const newLines = [...form.lines];
                newLines[i].creditedAmount = e.target.value;
                setForm({ ...form, lines: newLines });
              }}
            />
            <input
              type="text"
              placeholder="Comment"
              value={line.comment}
              onChange={e => {
                const newLines = [...form.lines];
                newLines[i].comment = e.target.value;
                setForm({ ...form, lines: newLines });
              }}
            />
            <button
              type="button"
              onClick={() => {
                const newLines = form.lines.filter((_, idx) => idx !== i);
                setForm({ ...form, lines: newLines });
              }}
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setForm({
            ...form,
            lines: [
              ...form.lines,
              { MasterAccountId: '', debitedAmount: '', creditedAmount: '', comment: '' }
            ]
          })}
        >
          Add Line
        </button>

        {/* 3) And this submit button actually invokes handleAdd */}
        <button type="submit">Add Transaction</button>
      </form>

      {/* (Optional) display a list of transactions below… */}
    </div>
  )
}