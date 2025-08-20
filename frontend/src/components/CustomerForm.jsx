import React, { useState } from 'react';
import '../FormStyles.css'; // Import the shared styles

function CustomerForm({ onCustomerAdded, onCancel }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    // --- Your existing handleSubmit logic remains unchanged ---
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const newCustomer = { name, email, phone, address, company };
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('http://localhost:5001/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(newCustomer),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to add customer');
      }
      const addedCustomer = await response.json();
      setSuccess(true);
      setName(''); setEmail(''); setPhone(''); setAddress(''); setCompany('');
      if (onCustomerAdded) {
        onCustomerAdded(addedCustomer);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error adding customer:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h3>Add New Customer</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Company</label>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>

          {error && <p className="error-message">Error: {error}</p>}
          {success && <p className="success-message">Customer added successfully!</p>}

          <div className="form-buttons">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Adding...' : 'Add Customer'}
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

export default CustomerForm;
