import React, { useState } from 'react';
import '../FormStyles.css'; // Import the shared styles

function LeadForm({ onLeadAdded, onCancel }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('New'); // Default status
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const newLead = { name, email, phone, status, source, notes };
    const token = localStorage.getItem('token');

    if (!token) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(newLead),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to add lead');
      }

      const addedLead = await response.json();
      setSuccess(true);
      // Clear form fields after successful submission
      setName('');
      setEmail('');
      setPhone('');
      setStatus('New');
      setSource('');
      setNotes('');
      // Notify parent component that a lead was added
      if (onLeadAdded) {
        onLeadAdded(addedLead);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error adding lead:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- The UI structure below is updated with the correct CSS classes ---
  return (
    <div className="form-container">
      <div className="form-box">
        <h3>Add New Lead</h3>
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

          {error && <p className="error-message">Error: {error}</p>}
          {success && <p className="success-message">Lead added successfully!</p>}

          <div className="form-buttons">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Adding...' : 'Add Lead'}
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

export default LeadForm;
