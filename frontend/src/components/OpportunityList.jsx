import toast from "react-hot-toast";
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import OpportunityForm from "./OpportunityForm";
import OpportunityEditForm from "./OpportunityEditForm";
import ConfirmModal from "./ConfirmModal";

// --- UTILITY COMPONENTS ---
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const TimeAgo = ({ date }) => {
    const [time, setTime] = useState('');
    useEffect(() => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) { setTime(Math.floor(interval) + " years ago"); return; }
        interval = seconds / 2592000;
        if (interval > 1) { setTime(Math.floor(interval) + " months ago"); return; }
        interval = seconds / 86400;
        if (interval > 1) { setTime(Math.floor(interval) + " days ago"); return; }
        interval = seconds / 3600;
        if (interval > 1) { setTime(Math.floor(interval) + " hours ago"); return; }
        interval = seconds / 60;
        if (interval > 1) { setTime(Math.floor(interval) + " minutes ago"); return; }
        setTime(Math.floor(seconds) + " seconds ago");
    }, [date]);
    return <span title={new Date(date).toLocaleString()}>{time}</span>;
};

function OpportunityList() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [refreshList, setRefreshList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [viewingFilesFor, setViewingFilesFor] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const [viewingActivityFor, setViewingActivityFor] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const { token } = useContext(AuthContext);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const fetchOpportunities = async () => {
        if (!token) {
          setError("Authentication token not found. Please log in.");
          setLoading(false);
          return;
        }
        try {
          setLoading(true);
          const url = `http://localhost:5001/api/opportunities?search=${searchTerm}&page=${currentPage}&limit=10`;
          const response = await fetch(url, { headers: { "x-auth-token": token } });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || "Failed to fetch opportunities");
          }
          const data = await response.json();
          setOpportunities(data.opportunities);
          setCurrentPage(data.currentPage);
          setTotalPages(data.totalPages);
          setError(null);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchOpportunities();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, refreshList, currentPage, token]);

  const handleViewFiles = async (opportunityId) => {
    if (viewingFilesFor === opportunityId) {
      setViewingFilesFor(null);
      return;
    }
    setViewingFilesFor(opportunityId);
    setLoadingFiles(true);
    setAttachedFiles([]);
    try {
      const response = await fetch(`http://localhost:5001/api/files/Opportunity/${opportunityId}`, {
        headers: { "x-auth-token": token },
      });
      if (!response.ok) throw new Error('Could not load attachments.');
      const files = await response.json();
      setAttachedFiles(files);
    } catch (err) {
      toast.error(err.message);
      setViewingFilesFor(null);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleViewActivity = async (opportunityId) => {
    if (viewingActivityFor === opportunityId) {
      setViewingActivityFor(null);
      return;
    }
    setViewingActivityFor(opportunityId);
    setLoadingActivities(true);
    try {
      const response = await fetch(`http://localhost:5001/api/activities/Opportunity/${opportunityId}`, {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error('Could not load activity feed.');
      const data = await response.json();
      setActivities(data);
    } catch (err) {
      toast.error(err.message);
      setViewingActivityFor(null);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleOpportunityAdded = () => {
    setShowForm(false);
    setCurrentPage(1);
    setRefreshList(!refreshList);
  };

  const handleOpportunityUpdated = (updatedOpportunity) => {
    setOpportunities(opportunities.map((opp) => (opp._id === updatedOpportunity._id ? updatedOpportunity : opp)));
    setEditingOpportunity(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingOpportunity(null);
  };

  const openDeleteModal = (opportunityId) => {
    setIdToDelete(opportunityId);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setIdToDelete(null);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    try {
      const response = await fetch(`http://localhost:5001/api/opportunities/${idToDelete}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to delete opportunity");
      }
      toast.success("Opportunity deleted successfully!");
      setRefreshList((prev) => !prev);
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
      <ConfirmModal isOpen={isModalOpen} message="Are you sure you want to delete this opportunity?" onConfirm={confirmDelete} onCancel={closeDeleteModal} />
      
      <div style={{ marginBottom: "20px" }}>
        {!showForm && !editingOpportunity && (
          <button className="btn btn-success" onClick={() => setShowForm(true)}>Add New Opportunity</button>
        )}
      </div>

      {showForm && !editingOpportunity && (
        <OpportunityForm onOpportunityAdded={handleOpportunityAdded} onCancel={handleCancelForm} />
      )}
      {editingOpportunity && (
        <OpportunityEditForm opportunity={editingOpportunity} onUpdateSuccess={handleOpportunityUpdated} onCancel={handleCancelForm} />
      )}

      <h3>Your Opportunities</h3>

      <div className="form-group" style={{ maxWidth: "400px", marginBottom: "20px" }}>
        <input type="text" placeholder="Search by title or stage..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{ width: "100%", boxSizing: "border-box" }} />
      </div>

      {loading ? <p>Loading opportunities...</p> : error ? <p className="error-message">{error}</p> : opportunities.length === 0 ? (
        <p>{searchTerm ? `No results for "${searchTerm}".` : "No opportunities found."}</p>
      ) : (
        <>
          <table className="table-styled">
            <thead>
              <tr>
                <th>Title</th>
                <th>Customer</th>
                <th>Value</th>
                <th>Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opportunity) => (
                <React.Fragment key={opportunity._id}>
                  <tr>
                    <td>{opportunity.title}</td>
                    <td>{opportunity.customer?.name || "N/A"}</td>
                    <td>${opportunity.value?.toLocaleString() || "N/A"}</td>
                    <td>{opportunity.stage}</td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => handleViewActivity(opportunity._id)} style={{ marginRight: "8px" }}>
                        {viewingActivityFor === opportunity._id ? 'Hide Log' : 'Activity'}
                      </button>
                      <button className="btn btn-info" onClick={() => handleViewFiles(opportunity._id)} style={{ marginRight: "8px" }}>
                        {viewingFilesFor === opportunity._id ? 'Hide Files' : 'Files'}
                      </button>
                      <button className="btn btn-primary" onClick={() => setEditingOpportunity(opportunity)} style={{ marginRight: "8px" }}>Edit</button>
                      <button className="btn btn-danger" onClick={() => openDeleteModal(opportunity._id)}>Delete</button>
                    </td>
                  </tr>
                  
                  {viewingFilesFor === opportunity._id && (
                    <tr className="details-row">
                      <td colSpan="5">
                        {loadingFiles ? <p>Loading attachments...</p> : attachedFiles.length > 0 ? (
                          <div className="file-list">
                            <h4>Attachments</h4>
                            <ul>
                              {attachedFiles.map(file => (
                                <li key={file._id}>
                                  <a href={`http://localhost:5001/${file.path}`} target="_blank" rel="noopener noreferrer">
                                    {file.originalname}
                                  </a>
                                  <span>({formatFileSize(file.size)})</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : <p>No attachments found.</p>}
                      </td>
                    </tr>
                  )}
                  
                  {viewingActivityFor === opportunity._id && (
                    <tr className="details-row">
                      <td colSpan="5">
                        {loadingActivities ? <p>Loading activity...</p> : activities.length > 0 ? (
                          <div className="activity-feed">
                            <h4>Activity Feed</h4>
                            <ul>
                              {activities.map(activity => (
                                <li key={activity._id}>
                                  <div className="activity-actor">{activity.user?.name || 'A user'}</div>
                                  <div className="activity-description">{activity.description}</div>
                                  <div className="activity-time"><TimeAgo date={activity.createdAt} /></div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : <p>No activity logged yet.</p>}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
            <button className="btn btn-secondary" onClick={handlePreviousPage} disabled={currentPage <= 1}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button className="btn btn-secondary" onClick={handleNextPage} disabled={currentPage >= totalPages}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

export default OpportunityList;
