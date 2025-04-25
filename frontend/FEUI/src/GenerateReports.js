import React, { useState } from 'react';
import './report.css';

function GenerateReports() {
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
      setOtherCriteria(prevCriteria => ({ ...prevCriteria, [name]: value }));
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
      const response = await fetch('/api/generate-report', { // Adjust API endpoint as needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
            {/* Add more report types as needed */}
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
                required
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

        {errorMessage && <p style={{ color: 'red' }}>Error: {errorMessage}</p>}
        {reportData && (
          <div>
            <h3>Report Generated Successfully!</h3>
            <pre>{JSON.stringify(reportData, null, 2)}</pre>
            {/* You would likely want to render the report data in a more user-friendly way
                (e.g., a table or download link) depending on the format of the data. */}
          </div>
        )}
      </form>
    </div>
  );
}

export default GenerateReports;