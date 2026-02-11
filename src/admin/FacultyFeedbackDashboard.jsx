import "./FacultyFeedbackDashboard.css";
import React, { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const FacultyFeedbackDashboard = () => {
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [selectedFaculty, setSelectedFaculty] = useState("All");
  const [branches, setBranches] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [chartView, setChartView] = useState("faculty"); // "faculty" or "subject"

  useEffect(() => {
    fetchFacultyFeedback();
  }, []);

  const fetchFacultyFeedback = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/admin/feedback-report"
      );

      const data = await response.json();

      if (data.success && data.report) {
        const transformedData = transformFacultyData(data.report);
        setFacultyData(transformedData);

        const uniqueBranches = [
          ...new Set(transformedData.map((item) => item.branch)),
        ];
        const uniqueFaculties = [
          ...new Set(transformedData.map((item) => item.facultyName)),
        ];

        setBranches(["All", ...uniqueBranches]);
        setFaculties(["All", ...uniqueFaculties]);

      } else {
        setError(data.message || "Failed to fetch faculty feedback");
      }

    } catch (err) {
      setError("Error connecting to server");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const transformFacultyData = (apiData) => {
    const transformed = [];

    Object.keys(apiData).forEach((branch) => {
      Object.keys(apiData[branch]).forEach((subject) => {
        Object.keys(apiData[branch][subject]).forEach((faculty) => {
          const facultyData = apiData[branch][subject][faculty];
          const feedbacks = facultyData.feedbacks || [];
          const feedbackCount = feedbacks.length;
          
          // Calculate average rating from feedbacks
          let totalRating = 0;
          let validFeedbacks = 0;
          
          feedbacks.forEach((feedback) => {
            const rating = feedback.ratings?.overallSatisfaction;
            if (rating && !isNaN(rating)) {
              totalRating += rating;
              validFeedbacks++;
            }
          });
          
          const avgRating = validFeedbacks > 0 ? totalRating / validFeedbacks : 0;

          transformed.push({
            branch,
            subject,
            facultyName: faculty,
            totalFeedback: feedbackCount,
            averageRating: parseFloat(avgRating.toFixed(2)),
            facultyId: `${branch}-${subject}-${faculty}`.replace(/\s+/g, "-"),
          });
        });
      });
    });

    return transformed.sort((a, b) => b.averageRating - a.averageRating);
  };

  // Filter data based on selections
  const filteredData =
    selectedBranch === "All" && selectedFaculty === "All"
      ? facultyData
      : facultyData.filter((item) => {
          const branchMatch =
            selectedBranch === "All" || item.branch === selectedBranch;
          const facultyMatch =
            selectedFaculty === "All" || item.facultyName === selectedFaculty;
          return branchMatch && facultyMatch;
        });

  // Prepare chart data for faculty view
  const prepareFacultyChartData = () => {
    const facultyMap = new Map();
    
    filteredData.forEach((item) => {
      if (!facultyMap.has(item.facultyName)) {
        facultyMap.set(item.facultyName, {
          facultyName: item.facultyName,
          branch: item.branch,
          totalRating: 0,
          totalFeedback: 0,
          subjectCount: 0,
        });
      }
      
      const faculty = facultyMap.get(item.facultyName);
      faculty.totalRating += item.averageRating * item.totalFeedback;
      faculty.totalFeedback += item.totalFeedback;
      faculty.subjectCount += 1;
    });
    
    // Calculate weighted average for each faculty
    return Array.from(facultyMap.values())
      .map(faculty => ({
        name: faculty.facultyName,
        averageRating: faculty.totalFeedback > 0 
          ? parseFloat((faculty.totalRating / faculty.totalFeedback).toFixed(2))
          : 0,
        totalFeedback: faculty.totalFeedback,
        subjects: faculty.subjectCount,
        branch: faculty.branch,
      }))
      .sort((a, b) => b.averageRating - a.averageRating);
  };

  // Prepare chart data for subject view
  const prepareSubjectChartData = () => {
    const subjectMap = new Map();
    
    filteredData.forEach((item) => {
      const key = `${item.subject} (${item.branch})`;
      if (!subjectMap.has(key)) {
        subjectMap.set(key, {
          subjectName: key,
          totalRating: 0,
          totalFeedback: 0,
          facultyCount: 0,
        });
      }
      
      const subject = subjectMap.get(key);
      subject.totalRating += item.averageRating * item.totalFeedback;
      subject.totalFeedback += item.totalFeedback;
      subject.facultyCount += 1;
    });
    
    return Array.from(subjectMap.values())
      .map(subject => ({
        name: subject.subjectName,
        averageRating: subject.totalFeedback > 0 
          ? parseFloat((subject.totalRating / subject.totalFeedback).toFixed(2))
          : 0,
        totalFeedback: subject.totalFeedback,
        faculties: subject.facultyCount,
      }))
      .sort((a, b) => b.averageRating - a.averageRating);
  };

  const chartData = chartView === "faculty" 
    ? prepareFacultyChartData() 
    : prepareSubjectChartData();

  const getRatingColor = (rating) => {
    if (rating >= 4) return "#10B981"; // Green
    if (rating >= 3) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div>
          <p style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "14px" }}>
            {label}
          </p>
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
            <p style={{ margin: "4px 0", fontSize: "13px" }}>
              <span style={{ color: "#6B7280" }}>Avg. Rating:</span>{" "}
              <strong style={{ color: "#3B82F6", fontSize: "16px" }}>
                {data.averageRating}
              </strong>
            </p>
            <p style={{ margin: "4px 0", fontSize: "13px" }}>
              <span style={{ color: "#6B7280" }}>Total Feedback:</span>{" "}
              <strong>{data.totalFeedback}</strong>
            </p>
            {data.branch && (
              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                <span style={{ color: "#6B7280" }}>Branch:</span>{" "}
                <strong>{data.branch}</strong>
              </p>
            )}
            {data.subjects && (
              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                <span style={{ color: "#6B7280" }}>Subjects:</span>{" "}
                <strong>{data.subjects}</strong>
              </p>
            )}
            {data.faculties && (
              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                <span style={{ color: "#6B7280" }}>Faculties:</span>{" "}
                <strong>{data.faculties}</strong>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomBarLabel = ({ x, y, width, value }) => {
    return (
      <text
        x={x + width / 2}
        y={y - 10}
        fill="#374151"
        textAnchor="middle"
        fontSize={12}
        fontWeight="bold"
      >
        {value.toFixed(2)}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading faculty feedback data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{error}</p>
        <button
          className="retry-btn"
          onClick={fetchFacultyFeedback}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="faculty-feedback-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          <span className="title-icon">👨‍🏫</span> Faculty Performance Dashboard
        </h2>
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="branch-filter" className="filter-label">
              Filter by Branch:
            </label>
            <select
              id="branch-filter"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="filter-select"
            >
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="faculty-filter" className="filter-label">
              Filter by Faculty:
            </label>
            <select
              id="faculty-filter"
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="filter-select"
            >
              {faculties.map((faculty) => (
                <option key={faculty} value={faculty}>
                  {faculty}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Chart View:</label>
            <div className="view-toggle">
              <button
                className={`toggle-btn ${chartView === "faculty" ? "active" : ""}`}
                onClick={() => setChartView("faculty")}
              >
                By Faculty
              </button>
              <button
                className={`toggle-btn ${chartView === "subject" ? "active" : ""}`}
                onClick={() => setChartView("subject")}
              >
                By Subject
              </button>
            </div>
          </div>

          <button
            className="refresh-btn"
            onClick={fetchFacultyFeedback}
            title="Refresh data"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-content">
            <h3 className="stat-value">
              {new Set(filteredData.map((f) => f.facultyName)).size}
            </h3>
            <p className="stat-label">Total Faculty</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3 className="stat-value">
              {filteredData.length > 0
                ? (
                    filteredData.reduce((sum, f) => sum + (f.averageRating * f.totalFeedback), 0) /
                    filteredData.reduce((sum, f) => sum + f.totalFeedback, 1)
                  ).toFixed(2)
                : "0.00"}
            </h3>
            <p className="stat-label">Overall Avg. Rating</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3 className="stat-value">
              {filteredData.reduce((sum, f) => sum + f.totalFeedback, 0)}
            </h3>
            <p className="stat-label">Total Feedback</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3 className="stat-value">
              {new Set(filteredData.map((f) => f.subject)).size}
            </h3>
            <p className="stat-label">Subjects</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="chart-header">
          <h3 className="section-title">
            {chartView === "faculty" ? "Faculty Performance Ratings" : "Subject Performance Ratings"}
            {selectedBranch !== "All" && ` - ${selectedBranch}`}
          </h3>
          <div className="chart-info">
            <span className="data-count">
              Showing {chartData.length} {chartView === "faculty" ? "faculties" : "subjects"}
            </span>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData.slice(0, 15)} // Show top 15 for better visibility
            margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[0, 5]}
              tickCount={6}
              label={{
                value: "Average Rating",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
                offset: -10,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="averageRating"
              name="Average Rating"
              radius={[4, 4, 0, 0]}
              label={renderCustomBarLabel}
            >
              {chartData.slice(0, 15).map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getRatingColor(entry.averageRating)}
                  strokeWidth={2}
                  stroke={getRatingColor(entry.averageRating)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <div className="rating-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: "#EF4444" }}></span>
            <span>Below 3.0 (Needs Improvement)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: "#F59E0B" }}></span>
            <span>3.0 - 3.9 (Good)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: "#10B981" }}></span>
            <span>4.0+ (Excellent)</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-section">
        <h3 className="section-title">
          Detailed Faculty Feedback Summary
          <span className="result-count">
            ({filteredData.length} entries)
          </span>
        </h3>
        <div className="table-container">
          <table className="faculty-table">
            <thead>
              <tr>
                <th className="sticky-header">Branch</th>
                <th className="sticky-header">Subject</th>
                <th className="sticky-header">Faculty</th>
                <th className="sticky-header">Avg. Rating</th>
                <th className="sticky-header">Total Feedback</th>
                <th className="sticky-header">Performance</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No faculty feedback data found for selected filters
                  </td>
                </tr>
              ) : (
                filteredData.map((faculty, index) => (
                  <tr key={`${faculty.facultyId}-${index}`}>
                    <td data-label="Branch">
                      <span className={`branch-tag branch-${faculty.branch}`}>
                        {faculty.branch}
                      </span>
                    </td>
                    <td data-label="Subject">{faculty.subject}</td>
                    <td data-label="Faculty">
                      <span className="faculty-name">{faculty.facultyName}</span>
                    </td>
                    <td data-label="Avg. Rating">
                      <div className="rating-display">
                        <span
                          className="rating-badge"
                          style={{
                            backgroundColor: getRatingColor(faculty.averageRating),
                          }}
                        >
                          {faculty.averageRating.toFixed(2)}
                        </span>
                        <span className="rating-stars">
                          {"★".repeat(Math.floor(faculty.averageRating))}
                          {faculty.averageRating % 1 >= 0.5 && "⯨"}
                          {"☆".repeat(5 - Math.ceil(faculty.averageRating))}
                        </span>
                      </div>
                    </td>
                    <td data-label="Total Feedback">
                      <span className="feedback-count">
                        {faculty.totalFeedback}
                      </span>
                    </td>
                    <td data-label="Performance">
                      <div className="performance-indicator">
                        <div className="performance-bar-bg">
                          <div
                            className="performance-bar"
                            style={{
                              width: `${(faculty.averageRating / 5) * 100}%`,
                              backgroundColor: getRatingColor(faculty.averageRating),
                            }}
                          />
                        </div>
                        <span className="performance-text">
                          {faculty.averageRating >= 4
                            ? "Excellent"
                            : faculty.averageRating >= 3
                            ? "Good"
                            : "Needs Improvement"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx="true">{`
        .faculty-feedback-dashboard {
          background: #f8fafc;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .dashboard-title {
          color: #1e293b;
          font-size: 24px;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 300px;
        }

        .title-icon {
          font-size: 28px;
        }

        .filters-container {
          display: flex;
          gap: 16px;
          align-items: flex-end;
          flex-wrap: wrap;
          flex: 2;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 150px;
        }

        .filter-label {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
          white-space: nowrap;
        }

        .filter-select {
          padding: 8px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          color: #334155;
          font-size: 14px;
          min-width: 180px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .view-toggle {
          display: flex;
          gap: 2px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 6px;
          border: 2px solid #e2e8f0;
        }

        .toggle-btn {
          padding: 6px 12px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          transition: all 0.3s;
          white-space: nowrap;
        }

        .toggle-btn.active {
          background: white;
          color: #3b82f6;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .refresh-btn {
          padding: 8px 16px;
          background: #f1f5f9;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          color: #475569;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .refresh-btn:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
        }

        /* Stats Overview */
        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          font-size: 32px;
          opacity: 0.8;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          line-height: 1;
        }

        .stat-label {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 0 0;
        }

        /* Chart Section */
        .chart-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-title {
          color: #1e293b;
          font-size: 20px;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .data-count {
          font-size: 14px;
          color: #64748b;
          background: #f1f5f9;
          padding: 4px 12px;
          border-radius: 20px;
        }

        .rating-legend {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #64748b;
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          display: inline-block;
        }

        /* Table Section */
        .table-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .result-count {
          font-size: 14px;
          color: #64748b;
          font-weight: normal;
          margin-left: 10px;
        }

        .table-container {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          max-height: 500px;
          overflow-y: auto;
        }

        .faculty-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .faculty-table th {
          background: #f8fafc;
          padding: 16px;
          text-align: left;
          font-weight: 600;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .faculty-table td {
          padding: 16px;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
        }

        .faculty-table tr:hover {
          background: #f8fafc;
        }

        .branch-tag {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .branch-CSE {
          background: #dbeafe;
          color: #1e40af;
        }

        .branch-ME {
          background: #fef3c7;
          color: #92400e;
        }

        .branch-EE {
          background: #dcfce7;
          color: #166534;
        }

        .faculty-name {
          font-weight: 500;
          color: #1e293b;
        }

        .rating-display {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .rating-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          text-align: center;
          min-width: 60px;
        }

        .rating-stars {
          color: #fbbf24;
          font-size: 14px;
          letter-spacing: 1px;
        }

        .feedback-count {
          font-weight: 600;
          color: #3b82f6;
          background: #eff6ff;
          padding: 4px 12px;
          border-radius: 6px;
          display: inline-block;
          text-align: center;
        }

        .performance-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 200px;
        }

        .performance-bar-bg {
          flex: 1;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .performance-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .performance-text {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          min-width: 120px;
        }

        .no-data {
          text-align: center;
          padding: 40px !important;
          color: #94a3b8;
          font-style: italic;
        }

        /* Loading & Error States */
        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          text-align: center;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        .error-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .error-message {
          color: #ef4444;
          margin-bottom: 20px;
        }

        .retry-btn {
          padding: 8px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.3s;
        }

        .retry-btn:hover {
          background: #2563eb;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .faculty-feedback-dashboard {
            padding: 16px;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
          }

          .filters-container {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group {
            min-width: 100%;
          }

          .filter-select {
            min-width: 100%;
          }

          .view-toggle {
            width: 100%;
          }

          .toggle-btn {
            flex: 1;
            text-align: center;
          }

          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat-card {
            padding: 16px;
          }

          .stat-value {
            font-size: 24px;
          }

          .section-title {
            font-size: 18px;
          }

          .chart-section {
            padding: 16px;
          }

          .rating-legend {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }

        @media (max-width: 480px) {
          .stats-overview {
            grid-template-columns: 1fr;
          }

          .table-section {
            padding: 16px;
          }

          .faculty-table th,
          .faculty-table td {
            padding: 12px 8px;
            font-size: 14px;
          }
        }

        @media (max-width: 360px) {
          .faculty-feedback-dashboard {
            padding: 12px;
          }

          .dashboard-title {
            font-size: 20px;
          }

          .stat-card {
            flex-direction: column;
            text-align: center;
            padding: 12px;
            gap: 8px;
          }

          .stat-icon {
            font-size: 24px;
          }

          .stat-value {
            font-size: 20px;
          }

          .filter-select {
            font-size: 13px;
            padding: 6px 10px;
          }

          .refresh-btn {
            padding: 6px 12px;
            font-size: 13px;
          }

          .toggle-btn {
            font-size: 12px;
            padding: 4px 8px;
          }

          /* Make table more responsive for small screens */
          .faculty-table {
            display: block;
          }

          .faculty-table thead {
            display: none;
          }

          .faculty-table tr {
            display: block;
            margin-bottom: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
          }

          .faculty-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border: none;
          }

          .faculty-table td:before {
            content: attr(data-label);
            font-weight: 600;
            color: #475569;
            margin-right: 12px;
            flex: 0 0 100px;
          }

          .rating-display,
          .performance-indicator {
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
          }

          .rating-badge {
            min-width: 50px;
            font-size: 12px;
          }

          .performance-text {
            min-width: auto;
            font-size: 11px;
          }

          .branch-tag {
            font-size: 10px;
            padding: 2px 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default FacultyFeedbackDashboard;