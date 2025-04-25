import React, { useState } from 'react';
import './report.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function GenerateReports({ token }) {
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [otherCriteria, setOtherCriteria] = useState({});
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'reportType') {
      setReportType(value);
      setOtherCriteria({}); // Reset other criteria on report type change
    } else if (name === 'startDate') {
      setStartDate(value);
    } else if (name === 'endDate') {
      setEndDate(value);
    } else {
      setOtherCriteria((prevCriteria) => ({ ...prevCriteria, [name]: value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setReportData(null);
    setErrorMessage('');

    const payload = {
      reportType,
      startDate,
      endDate,
      ...otherCriteria,
    };

    try {
      const response = await fetch('http://localhost:5001/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate report.');
      }

      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${reportData.reportType}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    let yOffset = 40;

    if (reportType === 'Trial Balance') {
      doc.text(`Period: ${reportData.period}`, 14, yOffset);
      yOffset += 10;

      doc.autoTable({
        startY: yOffset,
        head: [['Account Name', 'Account Type', 'Debit', 'Credit']],
        body: reportData.data.map((entry) => [
          entry.accountName,
          entry.accountType,
          entry.debit.toFixed(2),
          entry.credit.toFixed(2),
        ]),
      });

      yOffset = doc.lastAutoTable.finalY + 10;
      doc.text(`Total Debit: ${reportData.totals.debit.toFixed(2)}`, 14, yOffset);
      yOffset += 10;
      doc.text(`Total Credit: ${reportData.totals.credit.toFixed(2)}`, 14, yOffset);
    } else if (reportType === 'Balance Sheet') {
      doc.text(`As of: ${reportData.asOf}`, 14, yOffset);
      yOffset += 10;

      doc.text('Assets', 14, yOffset);
      yOffset += 10;
      doc.autoTable({
        startY: yOffset,
        head: [['Account Name', 'Balance']],
        body: reportData.data.Assets.map((entry) => [entry.accountName, entry.balance.toFixed(2)]),
      });

      yOffset = doc.lastAutoTable.finalY + 10;
      doc.text(`Total Assets: ${reportData.totals.assets.toFixed(2)}`, 14, yOffset);
      yOffset += 10;

      doc.text('Liabilities', 14, yOffset);
      yOffset += 10;
      doc.autoTable({
        startY: yOffset,
        head: [['Account Name', 'Balance']],
        body: reportData.data.Liabilities.map((entry) => [entry.accountName, entry.balance.toFixed(2)]),
      });

      yOffset = doc.lastAutoTable.finalY + 10;
      doc.text(`Total Liabilities: ${reportData.totals.liabilities.toFixed(2)}`, 14, yOffset);
      yOffset += 10;

      doc.text('Equity', 14, yOffset);
      yOffset += 10;
      doc.autoTable({
        startY: yOffset,
        head: [['Account Name', 'Balance']],
        body: reportData.data.Equity.map((entry) => [entry.accountName, entry.balance.toFixed(2)]),
      });

      yOffset = doc.lastAutoTable.finalY + 10;
      doc.text(`Total Equity: ${reportData.totals.equity.toFixed(2)}`, 14, yOffset);
    } else if (reportType === 'Profit and Loss Statement') {
      doc.text(`Period: ${reportData.period}`, 14, yOffset);
      yOffset += 10;

      doc.text('Revenue', 14, yOffset);
      yOffset += 10;
      doc.autoTable({
        startY: yOffset,
        head: [['Account Name', 'Amount']],
        body: reportData.data.Revenue.map((entry) => [entry.accountName, entry.amount.toFixed(2)]),
      });

      yOffset = doc.lastAutoTable.finalY + 10;
      doc.text(`Total Revenue: ${reportData.totals.revenue.toFixed(2)}`, 14, yOffset);
      yOffset += 10;

      doc.text('Expenses', 14, yOffset);
      yOffset += 10;
      doc.autoTable({
        startY: yOffset,
        head: [['Account Name', 'Amount']],
        body: reportData.data.Expenses.map((entry) => [entry.accountName, entry.amount.toFixed(2)]),
      });

      yOffset = doc.lastAutoTable.finalY + 10;
      doc.text(`Total Expenses: ${reportData.totals.expenses.toFixed(2)}`, 14, yOffset);
      yOffset += 10;
      doc.text(`Net Income: ${reportData.totals.netIncome.toFixed(2)}`, 14, yOffset);
    } else if (reportType === 'Cash Flow Statement') {
      doc.text(`Period: ${reportData.period}`, 14, yOffset);
      yOffset += 10;

      doc.text('Operating Activities', 14, yOffset);
      yOffset += 10;
      doc.autoTable({
        startY: yOffset,
        head: [['Account Name', 'Cash Change']],
        body: reportData.data.OperatingActivities.map((entry) => [
          entry.accountName,
          entry.cashChange.toFixed(2),
        ]),
      });

      yOffset = doc.lastAutoTable.finalY + 10;
      doc.text(`Net Cash Flow: ${reportData.totals.netCashFlow.toFixed(2)}`, 14, yOffset);
    }

    doc.save(`${reportType.replace(/\s+/g, '-')}-Report.pdf`);
  };

  return (
    <div>
      <h2>Generate Reports</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="reportType">Report Type:</label>
          <select
            id="reportType"
            name="reportType"
            value={reportType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Report Type</option>
            <option value="Trial Balance">Trial Balance</option>
            <option value="Balance Sheet">Balance Sheet</option>
            <option value="Profit and Loss Statement">Profit and Loss Statement</option>
            <option value="Cash Flow Statement">Cash Flow Statement</option>
          </select>
        </div>

        {reportType !== '' && (
          <>
            <div>
              <label htmlFor="startDate">Start Date:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={startDate}
                onChange={handleInputChange}
                required={
                  reportType === 'Trial Balance' ||
                  reportType === 'Profit and Loss Statement' ||
                  reportType === 'Cash Flow Statement'
                }
              />
            </div>
            <div>
              <label htmlFor="endDate">End Date:</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={endDate}
                onChange={handleInputChange}
                required={
                  reportType === 'Trial Balance' ||
                  reportType === 'Profit and Loss Statement' ||
                  reportType === 'Cash Flow Statement'
                }
              />
            </div>
          </>
        )}

        {reportType === 'Trial Balance' && (
          <div>
            <label htmlFor="accountFilter">Account Filter:</label>
            <input
              type="text"
              id="accountFilter"
              name="accountFilter"
              value={otherCriteria.accountFilter || ''}
              onChange={handleInputChange}
              placeholder="e.g., Assets, Liabilities"
            />
          </div>
        )}

        {reportType === 'Balance Sheet' && (
          <div>
            <label htmlFor="asOfDate">As Of Date:</label>
            <input
              type="date"
              id="asOfDate"
              name="asOfDate"
              value={otherCriteria.asOfDate || ''}
              onChange={handleInputChange}
              required
            />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </form>

      {errorMessage && <p style={{ color: 'red' }}>Error: {errorMessage}</p>}

      {reportData && (
        <div>
          <h3>{reportData.reportType}</h3>
          <p>Generated on: {new Date().toLocaleDateString()}</p>

          {reportType === 'Trial Balance' && (
            <>
              <p>Period: {reportData.period}</p>
              <table border="1">
                <thead>
                  <tr>
                    <th>Account Name</th>
                    <th>Account Type</th>
                    <th>Debit</th>
                    <th>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.accountName}</td>
                      <td>{entry.accountType}</td>
                      <td>{entry.debit.toFixed(2)}</td>
                      <td>{entry.credit.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2">Totals</td>
                    <td>{reportData.totals.debit.toFixed(2)}</td>
                    <td>{reportData.totals.credit.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </>
          )}

          {reportType === 'Balance Sheet' && (
            <>
              <p>As of: {reportData.asOf}</p>
              <h4>Assets</h4>
              <table border="1">
                <thead>
                  <tr>
                    <th>Account Name</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.Assets.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.accountName}</td>
                      <td>{entry.balance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total Assets</td>
                    <td>{reportData.totals.assets.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>

              <h4>Liabilities</h4>
              <table border="1">
                <thead>
                  <tr>
                    <th>Account Name</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.Liabilities.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.accountName}</td>
                      <td>{entry.balance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total Liabilities</td>
                    <td>{reportData.totals.liabilities.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>

              <h4>Equity</h4>
              <table border="1">
                <thead>
                  <tr>
                    <th>Account Name</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.Equity.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.accountName}</td>
                      <td>{entry.balance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total Equity</td>
                    <td>{reportData.totals.equity.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </>
          )}

          {reportType === 'Profit and Loss Statement' && (
            <>
              <p>Period: {reportData.period}</p>
              <h4>Revenue</h4>
              <table border="1">
                <thead>
                  <tr>
                    <th>Account Name</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.Revenue.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.accountName}</td>
                      <td>{entry.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total Revenue</td>
                    <td>{reportData.totals.revenue.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>

              <h4>Expenses</h4>
              <table border="1">
                <thead>
                  <tr>
                    <th>Account Name</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.Expenses.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.accountName}</td>
                      <td>{entry.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total Expenses</td>
                    <td>{reportData.totals.expenses.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>

              <h4>Net Income</h4>
              <p>{reportData.totals.netIncome.toFixed(2)}</p>
            </>
          )}

          {reportType === 'Cash Flow Statement' && (
            <>
              <p>Period: {reportData.period}</p>
              <h4>Operating Activities</h4>
              <table border="1">
                <thead>
                  <tr>
                    <th>Account Name</th>
                    <th>Cash Change</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.OperatingActivities.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.accountName}</td>
                      <td>{entry.cashChange.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Net Cash Flow</td>
                    <td>{reportData.totals.netCashFlow.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </>
          )}

          <button onClick={downloadPDF} style={{ marginTop: '20px' }}>
            Download as PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default GenerateReports;