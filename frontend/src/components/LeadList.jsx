import toast from "react-hot-toast";
import React, { useState, useEffect } from "react";
import LeadForm from "./LeadForm";
import LeadEditForm from "./LeadEditForm";
import ConfirmModal from "./ConfirmModal";

function LeadList() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [refreshList, setRefreshList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // New state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const fetchLeads = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          if (!token) {
            setError("No authentication token found. Please log in.");
            setLoading(false);
            return;
          }

          const url = `http://localhost:5001/api/leads?search=${searchTerm}&page=${currentPage}&limit=10`;

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || "Failed to fetch leads");
          }

          const data = await response.json();
          setLeads(data.leads);
          setCurrentPage(data.currentPage);
          setTotalPages(data.totalPages);
          setError(null);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchLeads();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, refreshList, currentPage]);

  const handleLeadAdded = () => {
    setShowForm(false);
    setCurrentPage(1);
    setRefreshList(!refreshList);
  };

  const handleLeadUpdated = (updatedLead) => {
    setLeads(
      leads.map((lead) => (lead._id === updatedLead._id ? updatedLead : lead))
    );
    setEditingLead(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingLead(null);
  };

  const openDeleteModal = (leadId) => {
    setIdToDelete(leadId);
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
      // --- Note the change to the API path ---
      const response = await fetch(
        `http://localhost:5001/api/leads/${idToDelete}`,
        {
          method: "DELETE",
          headers: { "x-auth-token": token },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to delete lead");
      }

      toast.success("Lead deleted successfully!");
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

  return (
    <div>
      {/* Add/Edit Form Logic */}
      <ConfirmModal
        isOpen={isModalOpen}
        message="Are you sure you want to delete this lead?"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
      <div style={{ marginBottom: "20px" }}>
        {!showForm && !editingLead && (
          <button className="btn btn-success" onClick={() => setShowForm(true)}>
            Add New Lead
          </button>
        )}
      </div>
      {showForm && !editingLead && (
        <LeadForm onLeadAdded={handleLeadAdded} onCancel={handleCancelForm} />
      )}
      {editingLead && (
        <LeadEditForm
          lead={editingLead}
          onUpdateSuccess={handleLeadUpdated}
          onCancel={handleCancelForm}
        />
      )}

      <h3>Your Leads</h3>

      {/* Search Input */}
      <div
        className="form-group"
        style={{ maxWidth: "400px", marginBottom: "20px" }}
      >
        <input
          type="text"
          placeholder="Search by name, email, or source..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{ width: "100%", boxSizing: "border-box" }}
        />
      </div>

      {/* Loading/Error/Data Display */}
      {loading ? (
        <p>Loading leads...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : leads.length === 0 ? (
        <p>
          {searchTerm ? `No results for "${searchTerm}".` : "No leads found."}
        </p>
      ) : (
        <>
          <table className="table-styled">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Source</th>
                <th>Created On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id}>
                  <td>{lead.name}</td>
                  <td>{lead.email || "N/A"}</td>
                  <td>{lead.phone || "N/A"}</td>
                  <td>{lead.status}</td>
                  <td>{lead.source || "N/A"}</td>
                  <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => setEditingLead(lead)}
                      style={{ marginRight: "8px" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => openDeleteModal(lead._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
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

export default LeadList;
