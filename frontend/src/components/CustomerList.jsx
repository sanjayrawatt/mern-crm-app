import toast from "react-hot-toast";
import React, { useState, useEffect } from "react";
import CustomerForm from "./CustomerForm"; // Changed from LeadForm
import CustomerEditForm from "./CustomerEditForm"; // Changed from LeadEditForm
import ConfirmModal from "./ConfirmModal";

function CustomerList() {
  // State management mirrored for "customers"
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null); // Changed from editingLead
  const [refreshList, setRefreshList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // useEffect mirrored to fetch customers
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const fetchCustomers = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          if (!token) {
            setError("No authentication token found. Please log in.");
            setLoading(false);
            return;
          }

          // URL changed to fetch customers
          const url = `http://localhost:5001/api/customers?search=${searchTerm}&page=${currentPage}&limit=10`;

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || "Failed to fetch customers");
          }

          const data = await response.json();
          // State setters updated for customers
          setCustomers(data.customers);
          setCurrentPage(data.currentPage);
          setTotalPages(data.totalPages);
          setError(null);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchCustomers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, refreshList, currentPage]);

  // Handler functions mirrored for customers
  const handleCustomerAdded = () => {
    setShowForm(false);
    setCurrentPage(1);
    setRefreshList(!refreshList);
  };

  const handleCustomerUpdated = (updatedCustomer) => {
    setCustomers(
      customers.map((customer) =>
        customer._id === updatedCustomer._id ? updatedCustomer : customer
      )
    );
    setEditingCustomer(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  const openDeleteModal = (customerId) => {
    setIdToDelete(customerId);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setIdToDelete(null);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    
    try {
      const token = localStorage.getItem("token");
      // API path changed for customers
      const response = await fetch(
        `http://localhost:5001/api/customers/${idToDelete}`,
        {
          method: "DELETE",
          headers: { "x-auth-token": token },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to delete customer");
      }

      toast.success("Customer deleted successfully!");
      setRefreshList((prev) => !prev);
      setCurrentPage(1);
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      closeDeleteModal();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // JSX structure and logic mirrored for customers
  return (
    <div>
      <ConfirmModal
        isOpen={isModalOpen}
        message="Are you sure you want to delete this customer?"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
      <div style={{ marginBottom: "20px" }}>
        {!showForm && !editingCustomer && (
          <button className="btn btn-success" onClick={() => setShowForm(true)}>
            Add New Customer
          </button>
        )}
      </div>
      {showForm && !editingCustomer && (
        <CustomerForm
          onCustomerAdded={handleCustomerAdded}
          onCancel={handleCancelForm}
        />
      )}
      {editingCustomer && (
        <CustomerEditForm
          customer={editingCustomer}
          onUpdateSuccess={handleCustomerUpdated}
          onCancel={handleCancelForm}
        />
      )}

      <h3>Your Customers</h3>
      <div
        className="form-group"
        style={{ maxWidth: "400px", marginBottom: "20px" }}
      >
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{ width: "100%", boxSizing: "border-box" }}
        />
      </div>

      {loading ? (
        <p>Loading customers...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : customers.length === 0 ? (
        <p>
          {searchTerm
            ? `No results for "${searchTerm}".`
            : "No customers found."}
        </p>
      ) : (
        <>
          <table className="table-styled">
            <thead>
              <tr>
                <th>Name</th>
                <th>Customer ID</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Created On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{customer._id}</td>
                  <td>{customer.email || "N/A"}</td>
                  <td>{customer.phone || "N/A"}</td>
                  <td>{customer.company || "N/A"}</td>
                  <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => setEditingCustomer(customer)}
                      style={{ marginRight: "8px" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => openDeleteModal(customer._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
            }}
          >
            <button
              className="btn btn-secondary"
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CustomerList;
