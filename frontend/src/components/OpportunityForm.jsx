import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../FormStyles.css';

function OpportunityForm({ onOpportunityAdded, onCancel }) {
  // Form field states
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('Qualification');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // --- NEW: File state ---
  const [selectedFile, setSelectedFile] = useState(null);

  // Customer dropdown states
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // General form states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { token } = useContext(AuthContext);

  // Fetch customers for the dropdown
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
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

  // --- NEW: Handler for file input change ---
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) {
      setError("Please select a customer.");
      return;
    }
    setLoading(true);
    setError(null);

    // --- STEP 1: CREATE THE OPPORTUNITY ---
    const newOpportunityData = {
      title,
      customer: customerId,
      value: Number(value),
      stage,
      expectedCloseDate,
      notes,
    };

    try {
      // First, create the opportunity record
      const oppResponse = await fetch('http://localhost:5001/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(newOpportunityData),
      });

      const savedOpportunity = await oppResponse.json();

      if (!oppResponse.ok) {
        throw new Error(savedOpportunity.msg || 'Failed to create opportunity');
      }

      // --- STEP 2: UPLOAD THE FILE IF ONE IS SELECTED ---
      if (selectedFile && savedOpportunity?._id) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('relatedTo', savedOpportunity._id);
        formData.append('relatedModel', 'Opportunity');

        const fileResponse = await fetch('http://localhost:5001/api/files/upload', {
          method: 'POST',
          headers: { 'x-auth-token': token },
          body: formData,
        });

        if (!fileResponse.ok) {
          toast.error('Opportunity created, but file upload failed.');
        }
      }
      
      toast.success("Opportunity added successfully!");
      if (onOpportunityAdded) {
        onOpportunityAdded(); // Refresh the list
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h3>Add New Opportunity</h3>
        <form onSubmit={handleSubmit}>
          {/* Customer, Title, Stage, Value, Date, and Notes fields remain the same... */}
          <div className="form-group">
            <label>Customer</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required disabled={loadingCustomers}>
              <option value="" disabled>{loadingCustomers ? 'Loading...' : '-- Select a Customer --'}</option>
              {customers.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
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
            <label>Value ($)</label>
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} required min="0" />
          </div>
          <div className="form-group">
            <label>Expected Close Date</label>
            <input type="date" value={expectedCloseDate} onChange={(e) => setExpectedCloseDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          {/* --- NEW: FILE INPUT FIELD --- */}
          <div className="form-group">
            <label htmlFor="file-upload">Attach File (Optional)</label>
            <input id="file-upload" type="file" onChange={handleFileChange} />
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}
          
          <div className="form-buttons">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Adding...' : 'Add Opportunity'}
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

export default OpportunityForm;
