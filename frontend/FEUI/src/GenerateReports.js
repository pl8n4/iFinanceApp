import React, { useState } from 'react';
import './report.css';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'; // Import autoTable as a standalone function
import { useNavigate } from 'react-router-dom'; //for navigation of pages

function GenerateReports({ token }) {

  const navigate = useNavigate(); //handles navigation requests
  // State for two reports
  const [report1, setReport1] = useState({
    reportType: '',
    startDate: '',
    endDate: '',
    otherCriteria: {},
    loading: false,
    reportData: null,
    errorMessage: '',
  });

  const [report2, setReport2] = useState({
    reportType: '',
    startDate: '',
    endDate: '',
    otherCriteria: {},
    loading: false,
    reportData: null,
    errorMessage: '',
  });

  // Generic handler for input changes for both reports
  const handleInputChange = (reportNum, event) => {
    const { name, value } = event.target;
    const setReport = reportNum === 1 ? setReport1 : setReport2;

    setReport((prev) => {
      if (name === 'reportType') {
        return { ...prev, reportType: value, otherCriteria: {} };
      } else if (name === 'startDate') {
        return { ...prev, startDate: value };
      } else if (name === 'endDate') {
        return { ...prev, endDate: value };
      } else {
        return {
          ...prev,
          otherCriteria: { ...prev.otherCriteria, [name]: value },
        };
      }
    });
  };

  // Generic handler for form submission
  const handleSubmit = async (reportNum, event) => {
    event.preventDefault();
    const setReport = reportNum === 1 ? setReport1 : setReport2;
    const report = reportNum === 1 ? report1 : report2;

    setReport((prev) => ({ ...prev, loading: true, reportData: null, errorMessage: '' }));

    const payload = {
      reportType: report.reportType,
      startDate: report.startDate,
      endDate: report.endDate,
      ...report.otherCriteria,
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
      setReport((prev) => ({ ...prev, reportData: data }));
    } catch (error) {
      console.error('Error generating report:', error);
      setReport((prev) => ({ ...prev, errorMessage: error.message }));
    } finally {
      setReport((prev) => ({ ...prev, loading: false }));
    }
  };

  // Generic PDF download function
  const downloadPDF = (reportData, reportType) => {
    if (!reportData) return;

    // Initialize jsPDF
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`${reportData.reportType}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    let yOffset = 40;

    if (reportType === 'Trial Balance') {
      doc.text(`Period: ${reportData.period}`, 14, yOffset);
      yOffset += 10;

      autoTable(doc, {
        startY: yOffset,
        head: [['Account Name', 'Account Type', 'Debit', 'Credit']],
        body: reportData.data.map((entry) => [
          entry.accountName,
          entry.accountType,
          entry.debit.toFixed(2),
          entry.credit.toFixed(2),
        ]),
      });

      // Get the final Y position after the table
      yOffset = doc.lastAutoTable.finalY + 10;
      doc.text(`Total Debit: ${reportData.totals.debit.toFixed(2)}`, 14, yOffset);
      yOffset += 10;
      doc.text(`Total Credit: ${reportData.totals.credit.toFixed(2)}`, 14, yOffset);
    } else if (reportType === 'Balance Sheet') {
      doc.text(`As of: ${reportData.asOf}`, 14, yOffset);
      yOffset += 10;

      doc.text('Assets', 14, yOffset);
      yOffset += 10;
      autoTable(doc, {
        startY: yOffset,
        head: [['Account Name', 'Balance']],
        body: reportData.data.Assets.map((entry) => [entry.accountName, entry.balance.toFixed(2)]),
      });

      yOffset = doc.lastAutoTable.finalY + 10;
      doc.text(`Total Assets: ${reportData.totals.assets.toFixed(2)}`, 14, yOffset);
      yOffset += 10;

      doc.text('Liabilities', 14, yOffset);
      yOffset += 10;
      autoTable(doc, {
        startY: yOffset,
        head: [['Account Name', 'Balance']],
        body: reportData.data.Liabilities.map((entry) => [entry.accountName, entry.balance.toFixed(2)]),
      });

      yOffset = doc.lastAutoTable.finalY + 10;
      doc.text(`Total Liabilities: ${reportData.totals.liabilities.toFixed(2)}`, 14, yOffset);
      yOffset += 10;

      doc.text('Equity', 14, yOffset);
      yOffset += 10;
      autoTable(doc, {
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
      autoTable(doc, {
        startY: yOffset,
        head: [['Account Name', 'Amount']],
        body: reportData.data.Revenue.map((entry) => [entry.accountName, entry.amount.toFixed(2)]),
      });

      yOffset = doc.lastAutoTable.finalY + 10;
      doc.text(`Total Revenue: ${reportData.totals.revenue.toFixed(2)}`, 14, yOffset);
      yOffset += 10;

      doc.text('Expenses', 14, yOffset);
      yOffset += 10;
      autoTable(doc, {
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
      autoTable(doc, {
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

    //function to handle the submission request to go to the home page
    const handleGoBack = () => {
      navigate('/');
    };

  // Generic render function for report form and results
  const renderReportSection = (reportNum) => {
    const report = reportNum === 1 ? report1 : report2;
    const handleChange = (e) => handleInputChange(reportNum, e);
    const handleFormSubmit = (e) => handleSubmit(reportNum, e);

    return (
      
      <div className="report-section">

        <h2>{`Generate Report ${reportNum}`}</h2>
        <form onSubmit={handleFormSubmit}>
          <div>
            <label htmlFor={`reportType${reportNum}`}>Report Type:</label>
            <select
              id={`reportType${reportNum}`}
              name="reportType"
              value={report.reportType}
              onChange={handleChange}
              required
            >
              <option value="">Select Report Type</option>
              <option value="Trial Balance">Trial Balance</option>
              <option value="Balance Sheet">Balance Sheet</option>
              <option value="Profit and Loss Statement">Profit and Loss Statement</option>
              <option value="Cash Flow Statement">Cash Flow Statement</option>
            </select>
          </div>

          {report.reportType !== '' && (
            <>
              <div>
                <label htmlFor={`startDate${reportNum}`}>Start Date:</label>
                <input
                  type="date"
                  id={`startDate${reportNum}`}
                  name="startDate"
                  value={report.startDate}
                  onChange={handleChange}
                  required={
                    report.reportType === 'Trial Balance' ||
                    report.reportType === 'Profit and Loss Statement' ||
                    report.reportType === 'Cash Flow Statement'
                  }
                />
              </div>
              <div>
                <label htmlFor={`endDate${reportNum}`}>End Date:</label>
                <input
                  type="date"
                  id={`endDate${reportNum}`}
                  name="endDate"
                  value={report.endDate}
                  onChange={handleChange}
                  required={
                    report.reportType === 'Trial Balance' ||
                    report.reportType === 'Profit and Loss Statement' ||
                    report.reportType === 'Cash Flow Statement'
                  }
                />
              </div>
            </>
          )}

          {report.reportType === 'Trial Balance' && (
            <div>
              <label htmlFor={`accountFilter${reportNum}`}>Account Filter:</label>
              <input
                type="text"
                id={`accountFilter${reportNum}`}
                name="accountFilter"
                value={report.otherCriteria.accountFilter || ''}
                onChange={handleChange}
                placeholder="e.g., Assets, Liabilities"
              />
            </div>
          )}

          {report.reportType === 'Balance Sheet' && (
            <div>
              <label htmlFor={`asOfDate${reportNum}`}>As Of Date:</label>
              <input
                type="date"
                id={`asOfDate${reportNum}`}
                name="asOfDate"
                value={report.otherCriteria.asOfDate || ''}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button type="submit" disabled={report.loading}>
            {report.loading ? 'Generating...' : 'Generate Report'}
          </button>
        </form>
        
        {report.errorMessage && <p style={{ color: 'red' }}>Error: {report.errorMessage}</p>}

        {report.reportData && (
          <div className="report-results">
            <h3>{report.reportData.reportType}</h3>
            <p>Generated on: {new Date().toLocaleDateString()}</p>

            {report.reportType === 'Trial Balance' && (
              <>
                <p>Period: {report.reportData.period}</p>
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
                    {report.reportData.data.map((entry, index) => (
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
                      <td>{report.reportData.totals.debit.toFixed(2)}</td>
                      <td>{report.reportData.totals.credit.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </>
            )}

            {report.reportType === 'Balance Sheet' && (
              <>
                <p>As of: {report.reportData.asOf}</p>
                <h4>Assets</h4>
                <table border="1">
                  <thead>
                    <tr>
                      <th>Account Name</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.reportData.data.Assets.map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.accountName}</td>
                        <td>{entry.balance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total Assets</td>
                      <td>{report.reportData.totals.assets.toFixed(2)}</td>
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
                    {report.reportData.data.Liabilities.map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.accountName}</td>
                        <td>{entry.balance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total Liabilities</td>
                      <td>{report.reportData.totals.liabilities.toFixed(2)}</td>
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
                    {report.reportData.data.Equity.map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.accountName}</td>
                        <td>{entry.balance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total Equity</td>
                      <td>{report.reportData.totals.equity.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </>
            )}

            {report.reportType === 'Profit and Loss Statement' && (
              <>
                <p>Period: {report.reportData.period}</p>
                <h4>Revenue</h4>
                <table border="1">
                  <thead>
                    <tr>
                      <th>Account Name</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.reportData.data.Revenue.map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.accountName}</td>
                        <td>{entry.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total Revenue</td>
                      <td>{report.reportData.totals.revenue.toFixed(2)}</td>
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
                    {report.reportData.data.Expenses.map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.accountName}</td>
                        <td>{entry.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total Expenses</td>
                      <td>{report.reportData.totals.expenses.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>

                <h4>Net Income</h4>
                <p>{report.reportData.totals.netIncome.toFixed(2)}</p>
              </>
            )}

            {report.reportType === 'Cash Flow Statement' && (
              <>
                <p>Period: {report.reportData.period}</p>
                <h4>Operating Activities</h4>
                <table border="1">
                  <thead>
                    <tr>
                      <th>Account Name</th>
                      <th>Cash Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.reportData.data.OperatingActivities.map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.accountName}</td>
                        <td>{entry.cashChange.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Net Cash Flow</td>
                      <td>{report.reportData.totals.netCashFlow.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </>
            )}

            <button onClick={() => downloadPDF(report.reportData, report.reportType)} style={{ marginTop: '20px' }}>
              Download as PDF
            </button>
          </div>
        )}

      </div>
    );

  };

  return (
    <div className="reports-container">
      {renderReportSection(1)}
      {renderReportSection(2)}
      <div className="tabs">
        <button onClick={handleGoBack}>Go Back</button>
      </div>
    </div>
  );
}

export default GenerateReports;