import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import '../FormStyles.css'; // Import shared styles

function LeadEditForm({ lead, onUpdateSuccess, onCancel }) {
  // State for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('New');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  
  // General form states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effect to pre-fill the form with existing lead data
  useEffect(() => {
    if (lead) {
      setName(lead.name || '');
      setEmail(lead.email || '');
      setPhone(lead.phone || '');
      setStatus(lead.status || 'New');
      setSource(lead.source || '');
      setNotes(lead.notes || '');
    }
  }, [lead]);

  // Handler to submit the updated data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const updatedLead = { name, email, phone, status, source, notes };
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Authentication token not found.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/leads/${lead._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(updatedLead),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update lead');
      }

      const data = await response.json();
      toast.success('Lead updated successfully!');
      
      if (onUpdateSuccess) {
        onUpdateSuccess(data); // Pass the updated data back to the parent list
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
        <h3>Edit Lead</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Unqualified">Unqualified</option>
              <option value="Converted">Converted</option>
            </select>
          </div>
          <div className="form-group">
            <label>Source</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="form-buttons">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Updating...' : 'Update Lead'}
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

export default LeadEditForm;
