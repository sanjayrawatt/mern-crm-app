import React, { useState, useEffect } from 'react';
import '../FormStyles.css'; // Import the shared styles

function CustomerEditForm({ customer, onUpdateSuccess, onCancel }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Pre-fill form fields when the component mounts or customer prop changes
  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setAddress(customer.address || '');
      setCompany(customer.company || '');
    }
  }, [customer]); // Dependency array: re-run if 'customer' prop changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const updatedCustomer = { name, email, phone, address, company };
    const token = localStorage.getItem('token');

    if (!token) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      // Make a PATCH request to the specific customer's ID
      const response = await fetch(`http://localhost:5001/api/customers/${customer._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(updatedCustomer),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update customer');
      }

      const data = await response.json(); // Backend should return the updated customer
      setSuccess(true);
      // Notify parent component (CustomerList) of the successful update, passing the updated data
      if (onUpdateSuccess) {
        onUpdateSuccess(data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating customer:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- UI structure updated with correct CSS classes ---
  return (
    <div className="form-container">
      <div className="form-box">
        <h3>Edit Customer</h3>
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
              required
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
            <label>Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          {error && <p className="error-message">Error: {error}</p>}
          {success && <p className="success-message">Customer updated successfully!</p>}

          <div className="form-buttons">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Updating...' : 'Update Customer'}
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

export default CustomerEditForm;
