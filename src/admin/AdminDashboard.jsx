import "./AdminDashboard.css";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { useNavigate } from "react-router-dom";

import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(true);
  const [allFeedback, setAllFeedback] = useState([]);
  const [latestFiveFeedback, setLatestFiveFeedback] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [selectedRoll, setSelectedRoll] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [searchRoll, setSearchRoll] = useState("");
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [viewMode, setViewMode] = useState("latest"); // "latest", "all", or "search"

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  useEffect(() => {
    fetchFeedbackData();
  }, [navigate, refreshKey]);

  useEffect(() => {
    if (viewMode === "search" && searchRoll.trim()) {
      const filtered = allFeedback.filter(fb => 
        fb.studentRoll.toLowerCase().includes(searchRoll.toLowerCase())
      );
      setFilteredFeedback(filtered);
    } else if (viewMode === "all") {
      setFilteredFeedback(allFeedback);
    } else {
      setFilteredFeedback(latestFiveFeedback);
    }
  }, [viewMode, searchRoll, allFeedback, latestFiveFeedback]);

  const fetchFeedbackData = () => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin");
      return;
    }

    const username = localStorage.getItem("adminUsername") || "Admin";
    setAdminName(username);

    setLoading(true);
    fetch("https://gpsfeedbackend.onrender.com/api/admin/feedback-report")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.report) {
          setReportData(data.report);
          
          const feedbackList = [];
          
          Object.keys(data.report).forEach((branch) => {
            Object.keys(data.report[branch]).forEach((subject) => {
              Object.keys(data.report[branch][subject]).forEach((faculty) => {
                const facultyObj = data.report[branch][subject][faculty];
                (facultyObj.feedbacks || []).forEach((fb) => {
                  feedbackList.push({
                    id: fb._id || fb.id || Math.random().toString(),
                    studentRoll: fb.studentRoll || "N/A",
                    branch: branch || "N/A",
                    subject: subject || "N/A",
                    faculty: faculty || "N/A",
                    overallSatisfaction: fb.ratings?.overallSatisfaction || "N/A",
                    comment: fb.comment || "",
                    timestamp: fb.timestamp || new Date().toISOString()
                  });
                });
              });
            });
          });
          
          setAllFeedback(feedbackList);
          
          const latestFive = [...feedbackList]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
          
          setLatestFiveFeedback(latestFive);
          setFilteredFeedback(latestFive);
          
        } else {
          console.error("Invalid data format from backend:", data);
        }
      })
      .catch((err) => console.error("Failed to fetch feedback:", err))
      .finally(() => setLoading(false));
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminUsername");
    navigate("/admin");
  };

  const handleDeleteClick = (feedback) => {
    setSelectedFeedback(feedback);
    setShowDeleteModal(true);
  };

  const handleBulkDeleteClick = () => {
    setShowBulkDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedFeedback) return;
    
    setDeleteLoading(prev => ({ ...prev, [selectedFeedback.id]: true }));
    
    try {
      const response = await fetch(`https://gpsfeedbackend.onrender.com/api/feedback/admin/${selectedFeedback.id}`, {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  },
});


      const data = await response.json();
      
      if (data.success) {
        setRefreshKey(prev => prev + 1);
        alert("Feedback deleted successfully!");
      } else {
        alert(data.message || "Failed to delete feedback");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting feedback. Please try again.");
    } finally {
      setDeleteLoading(prev => ({ ...prev, [selectedFeedback.id]: false }));
      setShowDeleteModal(false);
      setSelectedFeedback(null);
    }
  };

  const confirmBulkDelete = async () => {
    if (!selectedRoll.trim()) {
      alert("Please enter a roll number");
      return;
    }
    
    setBulkDeleteLoading(true);
    
    try {
      const response = await fetch(`https://gpsfeedbackend.onrender.com/api/feedback/admin/by-roll/${selectedRoll}`, {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  },
});


      const data = await response.json();
      
      if (data.success) {
        setRefreshKey(prev => prev + 1);
        setSelectedRoll("");
        alert(`Successfully deleted ${data.deletedCount || 0} feedback entries for roll number ${selectedRoll}`);
      } else {
        alert(data.message || "Failed to delete feedback");
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("Error deleting feedback. Please try again.");
    } finally {
      setBulkDeleteLoading(false);
      setShowBulkDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedFeedback(null);
  };

  const cancelBulkDelete = () => {
    setShowBulkDeleteModal(false);
    setSelectedRoll("");
  };

  const handleSearch = () => {
    if (searchRoll.trim()) {
      setViewMode("search");
    } else {
      setViewMode("latest");
    }
  };

  const handleClearSearch = () => {
    setSearchRoll("");
    setViewMode("latest");
  };

  const downloadPDF = () => {
    const doc = new jsPDF('landscape');
    
    const tableColumn = ["Roll", "Branch", "Subject", "Faculty", "Rating", "Comment"];
    
    const tableRows = [];
    
    const sortedFeedback = [...allFeedback].sort((a, b) => {
      if (a.studentRoll !== b.studentRoll) return a.studentRoll.localeCompare(b.studentRoll);
      if (a.branch !== b.branch) return a.branch.localeCompare(b.branch);
      return 0;
    });
    
    sortedFeedback.forEach((fb, index) => {
      const prev = sortedFeedback[index - 1];
      const isNewStudent = !prev || 
        fb.studentRoll !== prev.studentRoll || 
        fb.branch !== prev.branch;
      
      tableRows.push([
        isNewStudent ? fb.studentRoll : "",
        isNewStudent ? fb.branch : "",
        fb.subject || "",
        fb.faculty || "",
        fb.overallSatisfaction || "",
        fb.comment || ""
      ]);
    });
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Feedback Report", doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const date = new Date().toLocaleDateString();
    doc.text(`Generated on: ${date}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 80 }
      },
      margin: { left: 15, right: 15 }
    });
    
    doc.save(`feedback-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const branchChartData = Object.keys(reportData).map((branch) => {
    let totalFeedbacks = 0;
    Object.values(reportData[branch]).forEach((subjectObj) => {
      Object.values(subjectObj).forEach((facultyObj) => {
        totalFeedbacks += facultyObj.feedbacks?.length || 0;
      });
    });
    return { name: branch, feedback: totalFeedbacks };
  });

  const ratingDistribution = [1, 2, 3, 4, 5].map((star) => {
    let count = 0;
    Object.values(reportData).forEach((branchObj) => {
      Object.values(branchObj).forEach((subjectObj) => {
        Object.values(subjectObj).forEach((facultyObj) => {
          (facultyObj.feedbacks || []).forEach((fb) => {
            if (fb.ratings?.overallSatisfaction === star) count++;
          });
        });
      });
    });
    return { name: `${star} Stars`, value: count };
  });

  const csvData = allFeedback.map(fb => ({
    "Roll": fb.studentRoll,
    "Branch": fb.branch,
    "Subject": fb.subject,
    "Faculty": fb.faculty,
    "Rating": fb.overallSatisfaction,
    "Comment": fb.comment
  }));

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner large"></div>
        <p>Loading feedback report...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Individual Delete Modal */}
      {showDeleteModal && selectedFeedback && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this feedback?</p>
              <div className="feedback-details">
                <p><strong>Roll:</strong> {selectedFeedback.studentRoll}</p>
                <p><strong>Faculty:</strong> {selectedFeedback.faculty}</p>
                <p><strong>Subject:</strong> {selectedFeedback.subject}</p>
                <p><strong>Rating:</strong> {selectedFeedback.overallSatisfaction} ★</p>
                {selectedFeedback.comment && (
                  <p><strong>Comment:</strong> "{selectedFeedback.comment}"</p>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-cancel" 
                onClick={cancelDelete}
                disabled={deleteLoading[selectedFeedback.id]}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmDelete}
                disabled={deleteLoading[selectedFeedback.id]}
              >
                {deleteLoading[selectedFeedback.id] ? (
                  <>
                    <span className="spinner"></span> Deleting...
                  </>
                ) : (
                  "Delete Feedback"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Delete All Feedback by Roll Number</h3>
            </div>
            <div className="modal-body">
              <p>This will delete <strong>ALL</strong> feedback entries for the specified roll number.</p>
              <div className="input-group">
                <label htmlFor="rollNumber">Enter Roll Number:</label>
                <input
                  type="text"
                  id="rollNumber"
                  value={selectedRoll}
                  onChange={(e) => setSelectedRoll(e.target.value)}
                  placeholder="e.g., 21BCS001"
                  className="roll-input"
                />
              </div>
              <div className="warning-message">
                ⚠️ Warning: This action cannot be undone. All feedback from this student will be permanently deleted.
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-cancel" 
                onClick={cancelBulkDelete}
                disabled={bulkDeleteLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmBulkDelete}
                disabled={bulkDeleteLoading || !selectedRoll.trim()}
              >
                {bulkDeleteLoading ? (
                  <>
                    <span className="spinner"></span> Deleting...
                  </>
                ) : (
                  "Delete All Feedback"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-header">
        <div className="header-left">
          <h1 className="dashboard-title">
            <span className="dashboard-icon">📊</span> Admin Dashboard
          </h1>
          <p className="welcome-text">
            Welcome back, <span className="admin-name">{adminName}</span>
          </p>
        </div>
        <div className="header-right">
          <button 
            className="btn btn-refresh" 
            onClick={() => setRefreshKey(prev => prev + 1)}
            title="Refresh data"
          >
            🔄 Refresh
          </button>
          <button className="btn btn-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3 className="stat-value">{allFeedback.length}</h3>
            <p className="stat-label">Total Feedbacks</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏫</div>
          <div className="stat-content">
            <h3 className="stat-value">{Object.keys(reportData).length}</h3>
            <p className="stat-label">Total Branches</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-content">
            <h3 className="stat-value">
              {(() => {
                const faculties = new Set();
                Object.values(reportData).forEach((branchObj) => {
                  Object.values(branchObj).forEach((subjectObj) => {
                    Object.keys(subjectObj).forEach(faculty => {
                      faculties.add(faculty);
                    });
                  });
                });
                return faculties.size;
              })()}
            </h3>
            <p className="stat-label">Total Faculty</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3 className="stat-value">
              {(() => {
                const students = new Set();
                allFeedback.forEach(fb => {
                  students.add(fb.studentRoll);
                });
                return students.size;
              })()}
            </h3>
            <p className="stat-label">Unique Students</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3 className="chart-title">Feedback by Branch</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={branchChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="feedback" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                {branchChartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Overall Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={ratingDistribution}
                cx="50%"
                cy="50%"
                label={({ name, percent }) =>
                  percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ratingDistribution.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="export-section">
        <h2 className="section-title">Export Reports</h2>
        <div className="export-buttons">
          <CSVLink 
            data={csvData} 
            filename={`feedback-report-${new Date().toISOString().split('T')[0]}.csv`} 
            className="btn btn-success"
          >
            📥 Download CSV
          </CSVLink>
          <button className="btn btn-primary" onClick={downloadPDF}>
            📄 Download PDF (Landscape)
          </button>
          <button 
            className="btn btn-danger" 
            onClick={handleBulkDeleteClick}
          >
            🗑️ Delete by Roll
          </button>
        </div>
        <p className="export-note">
          CSV includes all data. PDF shows formatted table with merged roll & branch cells.
          <br />
          <strong>Delete by Roll:</strong> Remove all feedback entries for a specific student roll number.
        </p>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">
            {viewMode === "search" ? "Search Results" : 
             viewMode === "all" ? "All Feedbacks" : "Latest 5 Feedbacks"}
            {viewMode === "search" && searchRoll && (
              <span className="search-query"> for "{searchRoll}"</span>
            )}
          </h2>
          
          <div className="view-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by roll number..."
                value={searchRoll}
                onChange={(e) => setSearchRoll(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
              <button 
                className="btn btn-search" 
                onClick={handleSearch}
              >
                🔍 Search
              </button>
              {viewMode === "search" && (
                <button 
                  className="btn btn-clear" 
                  onClick={handleClearSearch}
                >
                  ✕ Clear
                </button>
              )}
            </div>
            
            <div className="view-toggles">
              <button 
                className={`view-toggle ${viewMode === "latest" ? "active" : ""}`}
                onClick={() => {
                  setViewMode("latest");
                  setSearchRoll("");
                }}
              >
                Latest
              </button>
              <button 
                className={`view-toggle ${viewMode === "all" ? "active" : ""}`}
                onClick={() => {
                  setViewMode("all");
                  setSearchRoll("");
                }}
              >
                View All
              </button>
            </div>
          </div>
        </div>
        
        {filteredFeedback.length === 0 ? (
          <div className="no-data-message">
            <p>No feedback data found.</p>
            {viewMode === "search" && (
              <button 
                className="btn btn-secondary" 
                onClick={handleClearSearch}
              >
                View All Feedbacks
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-info">
              <span className="result-count">
                Showing {filteredFeedback.length} feedback{filteredFeedback.length !== 1 ? 's' : ''}
              </span>
              {viewMode === "search" && (
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    setSelectedRoll(searchRoll);
                    setShowBulkDeleteModal(true);
                  }}
                >
                  🗑️ Delete All for "{searchRoll}"
                </button>
              )}
            </div>
            
            <div className="recent-table">
              <div className="table-header">
                <div className="table-cell">Roll</div>
                <div className="table-cell">Branch</div>
                <div className="table-cell">Subject</div>
                <div className="table-cell">Faculty</div>
                <div className="table-cell">Rating</div>
                <div className="table-cell">Comment</div>
                <div className="table-cell">Date</div>
                <div className="table-cell">Actions</div>
              </div>
              {filteredFeedback.map((item, index) => (
                <div key={index} className="table-row">
                  <div className="table-cell roll-cell">{item.studentRoll}</div>
                  <div className="table-cell branch-cell">{item.branch}</div>
                  <div className="table-cell subject-cell">{item.subject}</div>
                  <div className="table-cell faculty-cell">{item.faculty}</div>
                  <div className="table-cell rating-cell">
                    <span className={`rating-badge rating-${item.overallSatisfaction}`}>
                      {item.overallSatisfaction} ★
                    </span>
                  </div>
                  <div className="table-cell comment-cell">{item.comment}</div>
                  <div className="table-cell date-cell">
                    {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : "N/A"}
                  </div>
                  <div className="table-cell action-cell">
                    <button 
                      className="btn btn-delete-small"
                      onClick={() => handleDeleteClick(item)}
                      disabled={deleteLoading[item.id]}
                      title="Delete this feedback"
                    >
                      {deleteLoading[item.id] ? (
                        <span className="small-spinner"></span>
                      ) : (
                        "🗑️"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx="true">{`
        .admin-dashboard {
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          border-radius: 10px;
          padding: 25px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .modal-header {
          margin-bottom: 20px;
        }
        
        .modal-header h3 {
          margin: 0;
          color: #2d3748;
          font-size: 20px;
        }
        
        .modal-body {
          margin-bottom: 25px;
        }
        
        .modal-body p {
          margin: 0 0 15px 0;
          color: #4a5568;
        }
        
        .input-group {
          margin: 20px 0;
        }
        
        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2d3748;
        }
        
        .roll-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          font-size: 16px;
          transition: border-color 0.3s;
        }
        
        .roll-input:focus {
          outline: none;
          border-color: #4299e1;
        }
        
        .warning-message {
          background-color: #fff5f5;
          border: 1px solid #fed7d7;
          color: #c53030;
          padding: 12px;
          border-radius: 6px;
          margin-top: 20px;
          font-size: 14px;
        }
        
        .feedback-details {
          background: #f7fafc;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #4299e1;
        }
        
        .feedback-details p {
          margin: 5px 0;
          font-size: 14px;
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
        }
        
        .btn-cancel {
          background-color: #e2e8f0;
          color: #4a5568;
        }
        
        .btn-cancel:hover {
          background-color: #cbd5e0;
        }
        
        .btn-danger {
          background-color: #f56565;
          color: white;
        }
        
        .btn-danger:hover {
          background-color: #e53e3e;
        }
        
        .btn-danger:disabled {
          background-color: #fc8181;
          cursor: not-allowed;
        }
        
        .spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
          margin-right: 8px;
        }
        
        .small-spinner {
          display: inline-block;
          width: 10px;
          height: 10px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .dashboard-title {
          color: #2d3748;
          margin: 0;
          font-size: 28px;
        }
        
        .dashboard-icon {
          margin-right: 10px;
        }
        
        .welcome-text {
          color: #718096;
          margin: 5px 0 0 0;
        }
        
        .admin-name {
          font-weight: bold;
          color: #4a5568;
        }
        
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .btn-sm {
          padding: 6px 12px;
          font-size: 13px;
        }
        
        .btn-secondary {
          background-color: #e2e8f0;
          color: #4a5568;
        }
        
        .btn-secondary:hover {
          background-color: #cbd5e0;
        }
        
        .btn-refresh {
          background-color: #edf2f7;
          color: #4a5568;
          margin-right: 10px;
        }
        
        .btn-refresh:hover {
          background-color: #e2e8f0;
        }
        
        .btn-logout {
          background-color: #f56565;
          color: white;
        }
        
        .btn-logout:hover {
          background-color: #e53e3e;
        }
        
        .btn-success {
          background-color: #48bb78;
          color: white;
        }
        
        .btn-success:hover {
          background-color: #38a169;
        }
        
        .btn-primary {
          background-color: #4299e1;
          color: white;
          margin-left: 10px;
        }
        
        .btn-primary:hover {
          background-color: #3182ce;
        }
        
        .btn-search {
          background-color: #38a169;
          color: white;
          margin-left: 10px;
        }
        
        .btn-clear {
          background-color: #e2e8f0;
          color: #4a5568;
          margin-left: 5px;
        }
        
        .btn-delete-small {
          background-color: #fc8181;
          color: white;
          padding: 6px 12px;
          font-size: 14px;
          border-radius: 4px;
        }
        
        .btn-delete-small:hover {
          background-color: #f56565;
        }
        
        .btn-delete-small:disabled {
          background-color: #fed7d7;
          cursor: not-allowed;
        }
        
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
        }
        
        .stat-icon {
          font-size: 40px;
          margin-right: 20px;
        }
        
        .stat-value {
          font-size: 32px;
          margin: 0;
          color: #2d3748;
        }
        
        .stat-label {
          margin: 5px 0 0 0;
          color: #718096;
          font-size: 14px;
        }
        
        .charts-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .chart-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .chart-title {
          margin-top: 0;
          margin-bottom: 20px;
          color: #2d3748;
          font-size: 18px;
        }
        
        .export-section {
          background: white;
          border-radius: 10px;
          padding: 25px;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .section-title {
          margin-top: 0;
          color: #2d3748;
          font-size: 22px;
          margin-bottom: 20px;
        }
        
        .export-buttons {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .export-note {
          color: #718096;
          font-size: 14px;
          margin: 0;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .search-query {
          color: #4299e1;
          font-weight: 600;
          margin-left: 10px;
        }
        
        .view-controls {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        
        .search-box {
          display: flex;
          gap: 5px;
        }
        
        .search-input {
          padding: 8px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          min-width: 200px;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #4299e1;
        }
        
        .view-toggles {
          display: flex;
          gap: 5px;
          background: #f7fafc;
          padding: 4px;
          border-radius: 6px;
        }
        
        .view-toggle {
          padding: 6px 12px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          color: #718096;
        }
        
        .view-toggle.active {
          background: white;
          color: #4299e1;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .table-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding: 0 10px;
        }
        
        .result-count {
          color: #718096;
          font-size: 14px;
        }
        
        .recent-table {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .table-header {
          display: grid;
          grid-template-columns: 1fr 1fr 1.5fr 1.5fr 0.8fr 2fr 1fr 0.8fr;
          background-color: #f7fafc;
          color: #2d3748;
          font-weight: 600;
          padding: 15px;
          font-size: 14px;
        }
        
        .table-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1.5fr 1.5fr 0.8fr 2fr 1fr 0.8fr;
          padding: 12px 15px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
          align-items: center;
        }
        
        .table-row:last-child {
          border-bottom: none;
        }
        
        .table-row:hover {
          background-color: #f7fafc;
        }
        
        .table-cell {
          padding: 8px 5px;
          word-break: break-word;
        }
        
        .action-cell {
          display: flex;
          justify-content: center;
        }
        
        .rating-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          min-width: 40px;
          text-align: center;
        }
        
        .rating-5 {
          background-color: #c6f6d5;
          color: #22543d;
        }
        
        .rating-4 {
          background-color: #bee3f8;
          color: #2a4365;
        }
        
        .rating-3 {
          background-color: #fed7d7;
          color: #742a2a;
        }
        
        .rating-2 {
          background-color: #fed7d7;
          color: #742a2a;
        }
        
        .rating-1 {
          background-color: #fed7d7;
          color: #742a2a;
        }
        
        .comment-cell {
          font-style: italic;
          color: #4a5568;
        }
        
        .loading-screen {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f7fafc;
        }
        
        .loading-spinner {
          border: 4px solid #e2e8f0;
          border-top: 4px solid #4299e1;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        
        .loading-spinner.large {
          width: 60px;
          height: 60px;
          border-width: 5px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .no-data-message {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 10px;
          color: #718096;
          font-size: 16px;
        }
        
        .no-data-message .btn {
          margin-top: 15px;
        }
        
        @media (max-width: 1200px) {
          .section-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .view-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
        }
        
        @media (max-width: 768px) {
          .stats-section {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .charts-section {
            grid-template-columns: 1fr;
          }
          
          .export-buttons {
            flex-direction: column;
          }
          
          .table-header,
          .table-row {
            grid-template-columns: repeat(4, 1fr);
            grid-auto-flow: dense;
          }
          
          .table-header .table-cell:nth-child(5),
          .table-header .table-cell:nth-child(6),
          .table-header .table-cell:nth-child(7),
          .table-header .table-cell:nth-child(8),
          .table-row .table-cell:nth-child(5),
          .table-row .table-cell:nth-child(6),
          .table-row .table-cell:nth-child(7),
          .table-row .table-cell:nth-child(8) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
