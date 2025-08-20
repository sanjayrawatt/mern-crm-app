import React, { useState, useEffect } from 'react';
// Step 1: Import Chart.js components
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Step 2: Register the components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      // ... (fetchSummary logic remains the same)
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
              setError('No authentication token found. Please log in.');
              setLoading(false);
              return;
            }
            const response = await fetch('http://localhost:5001/api/analytics/summary', {
              headers: { 'x-auth-token': token },
            });
            if (!response.ok) throw new Error('Failed to fetch dashboard data');
            const data = await response.json();
            setSummary(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    fetchSummary();
  }, []);

  // Step 3: Prepare data for the chart
  const pipelineData = {
    labels: summary?.salesPipeline.map(item => item._id) || [], // e.g., ['Proposal', 'Closed Won']
    datasets: [
      {
        label: 'Total Value ($)',
        data: summary?.salesPipeline.map(item => item.totalValue) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue bars
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales Pipeline by Stage',
      },
    },
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;
  if (!summary) return <p>No summary data available.</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>A high-level overview of your CRM activity.</p>

      {/* Statistics Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Total Customers</h3>
          <p className="stat-number">{summary.totalCounts.customers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Leads</h3>
          <p className="stat-number">{summary.totalCounts.leads}</p>
        </div>
        <div className="stat-card">
          <h3>Total Opportunities</h3>
          <p className="stat-number">{summary.totalCounts.opportunities}</p>
        </div>
      </div>

      {/* Bar Chart */}
      {summary.salesPipeline.length > 0 ? (
        <div className="chart-container">
          <Bar options={chartOptions} data={pipelineData} />
        </div>
      ) : (
        <div className="chart-container" style={{ textAlign: 'center' }}>
          <h3>Sales Pipeline</h3>
          <p>No opportunity data available to display a chart.</p>
        </div>
      )}

      {/* Recent Activity List */}
      <div className="recent-activity-card" style={{ marginTop: '30px' }}>
        <h3>Recently Added Customers</h3>
        {summary.recentCustomers.length > 0 ? (
          <ul>
            {summary.recentCustomers.map(customer => (
              <li key={customer._id}>
                <strong>{customer.name}</strong> ({customer.company || 'N/A'})
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent customers to display.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
