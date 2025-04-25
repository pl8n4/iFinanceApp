import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TransactionManager({ token, currentUser }) {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    date: '',
    description: '',
    lines: [
      { MasterAccountId: '', debitedAmount: '', creditedAmount: '', comment: '' }
    ]
  });
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Mode toggle and deposit state
  const [mode, setMode] = useState('journal');
  const [depositAccount, setDepositAccount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDesc, setDepositDesc] = useState('');

  // Running totals for journal entries
  const [debitTotal, setDebitTotal] = useState(0);
  const [creditTotal, setCreditTotal] = useState(0);

  const navigate = useNavigate();

  // Fetch master accounts
  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:5001/api/master-accounts', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAccounts(data))
      .catch(console.error);
  }, [token]);

  // Fetch account categories
  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:5001/api/categories', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, [token]);

  // Fetch existing transactions
  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:5001/api/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(console.error);
  }, [token]);

  // Recompute totals whenever journal lines change
  useEffect(() => {
    const d = form.lines.reduce((sum, l) => sum + (parseFloat(l.debitedAmount) || 0), 0);
    const c = form.lines.reduce((sum, l) => sum + (parseFloat(l.creditedAmount) || 0), 0);
    setDebitTotal(d);
    setCreditTotal(c);
  }, [form.lines]);

  // Handle journal entry submission
  const handleAdd = async e => {
    e.preventDefault();
    const payload = {
      date: form.date,
      description: form.description,
      lines: form.lines.map(l => ({
        MasterAccountId: l.MasterAccountId,
        debitedAmount: parseFloat(l.debitedAmount) || 0,
        creditedAmount: parseFloat(l.creditedAmount) || 0,
        comment: l.comment
      }))
    };
    const res = await fetch('http://localhost:5001/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.message);
      return;
    }
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

  // Handle simple deposit
  const handleDeposit = async e => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);

    //parameter check to see if the deposit account is valid and 
    //a valid amount is given
    if (!depositAccount || isNaN(amt)) {
      alert('Account and valid amount required');
      return;
    }
    const incomeCategory = categories.find(c => c.name === 'Income');
    const incomeAcct = accounts.find(
      a => a.accountGroup?.AccountCategoryId === incomeCategory?.id
    )?.id;
    if (!incomeAcct) {
      alert('No income account found; please create one');
      return;
    }
    const payload = {
      date: form.date || new Date().toISOString().slice(0, 10),
      description: depositDesc,
      lines: [
        { MasterAccountId: depositAccount, debitedAmount: amt, creditedAmount: 0, comment: depositDesc },
        { MasterAccountId: incomeAcct,      debitedAmount: 0, creditedAmount: amt, comment: depositDesc }
      ]
    };
    const res = await fetch('http://localhost:5001/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.message);
      return;
    }
    const newTx = await res.json();
    setTransactions([newTx, ...transactions]);
    setDepositAccount('');
    setDepositAmount('');
    setDepositDesc('');
  };

  // Lookup Assets category ID
  const assetsCategoryId = categories.find(c => c.name === 'Assets')?.id;

  //a go back function that will direct the user to the home page.
  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="manager">
      <div className="tabs">
        <button onClick={handleGoBack}>Go Back</button>
    </div>
      <h2>Transactions for {currentUser.name}</h2>

      {/* Mode Switcher */}
      <div style={{ margin: '1em 0' }}>
        <label>
          <input
            type="radio"
            value="journal"
            checked={mode === 'journal'}
            onChange={e => setMode(e.target.value)}
          /> Journal Entry
        </label>
        {' '}
        <label>
          <input
            type="radio"
            value="deposit"
            checked={mode === 'deposit'}
            onChange={e => setMode(e.target.value)}
          /> Deposit
        </label>
      </div>

      {mode === 'deposit' ? (
        <form onSubmit={handleDeposit} className="tx-form">
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required
          />
          <select
            value={depositAccount}
            onChange={e => setDepositAccount(e.target.value)}
            required
          >
            <option value="">Choose account…</option>
            {accounts
              .filter(ac => ac.accountGroup?.AccountCategoryId === assetsCategoryId)
              .map(ac => (
                <option key={ac.id} value={ac.id}>{ac.name}</option>
              ))
            }
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={depositAmount}
            onChange={e => setDepositAmount(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={depositDesc}
            onChange={e => setDepositDesc(e.target.value)}
          />
          <button type="submit">Deposit</button>
          <button type="button" onClick={handleGoBack}>Back</button>
        </form>
      ) : (
        <form onSubmit={handleAdd} className="tx-form">
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

          <div style={{ margin: '0.5em 0' }}>
            <strong>Totals:</strong> Debits = ${debitTotal.toFixed(2)} | Credits = ${creditTotal.toFixed(2)} | Difference = ${(debitTotal - creditTotal).toFixed(2)}
          </div>

          <button
            type="submit"
            disabled={debitTotal !== creditTotal}
            title={debitTotal !== creditTotal ? 'Debits must equal Credits' : undefined}
          >
            Add Transaction
          </button>
          
        </form>
      )}
    </div>
  );
}
