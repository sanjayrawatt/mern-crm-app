import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../FormStyles.css'; // Import shared styles

function OpportunityEditForm({ opportunity, onUpdateSuccess, onCancel }) {
  // Form field states
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('Qualification');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // State for the customer dropdown
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // General form states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { token } = useContext(AuthContext);

  // Effect to fetch customers for the dropdown
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const response = await fetch('http://localhost:5001/api/customers', {
          headers: { 'x-auth-token': token },
        });
        if (!response.ok) throw new Error('Could not load customers');
        const data = await response.json();
        setCustomers(data.customers || []);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoadingCustomers(false);
      }
    };
    if (token) fetchCustomers();
  }, [token]);

  // Effect to pre-fill the form with existing opportunity data
  useEffect(() => {
    if (opportunity) {
      setTitle(opportunity.title || '');
      // The customer object might be populated, so we check for _id
      setCustomerId(opportunity.customer?._id || opportunity.customer || '');
      setValue(opportunity.value?.toString() || '');
      setStage(opportunity.stage || 'Qualification');
      // Format the date to YYYY-MM-DD for the date input
      setExpectedCloseDate(opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toISOString().split('T')[0] : '');
      setNotes(opportunity.notes || '');
    }
  }, [opportunity]);

  // Handler to submit the updated data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const updatedOpportunity = {
      title,
      customer: customerId,
      value: Number(value),
      stage,
      expectedCloseDate,
      notes,
    };

    try {
      const response = await fetch(`http://localhost:5001/api/opportunities/${opportunity._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(updatedOpportunity),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update opportunity');
      }

      const data = await response.json();
      toast.success('Opportunity updated successfully!');
      if (onUpdateSuccess) {
        onUpdateSuccess(data); // Pass updated data back to the parent list
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h3>Edit Opportunity</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          
          <div className="form-group">
            <label>Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              disabled={loadingCustomers}
            >
              <option value="" disabled>{loadingCustomers ? 'Loading customers...' : '-- Select a Customer --'}</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Value ($)</label>
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} required min="0" />
          </div>

          <div className="form-group">
            <label>Stage</label>
            <select value={stage} onChange={(e) => setStage(e.target.value)}>
              <option value="Qualification">Qualification</option>
              <option value="Needs Analysis">Needs Analysis</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>

          <div className="form-group">
            <label>Expected Close Date</label>
            <input type="date" value={expectedCloseDate} onChange={(e) => setExpectedCloseDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="form-buttons">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Updating...' : 'Update Opportunity'}
            </button>
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OpportunityEditForm;
