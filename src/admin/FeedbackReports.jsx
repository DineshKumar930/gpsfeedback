import "./FeedbackReports.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const FeedbackReports = () => {
  const navigate = useNavigate()
  const [selectedBranch, setSelectedBranch] = useState('ALL')
  const [dateRange, setDateRange] = useState('week')
  const [exporting, setExporting] = useState(false)

  const branches = ['ALL', 'CSE', 'ME', 'EE']
  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'This Quarter' }
  ]

  // Sample data for charts
  const dailyData = [
    { day: 'Mon', feedback: 42, avgRating: 4.2 },
    { day: 'Tue', feedback: 56, avgRating: 4.3 },
    { day: 'Wed', feedback: 38, avgRating: 4.1 },
    { day: 'Thu', feedback: 67, avgRating: 4.4 },
    { day: 'Fri', feedback: 45, avgRating: 4.0 },
    { day: 'Sat', feedback: 23, avgRating: 4.2 }
  ]

  const subjectData = [
    { subject: 'Mathematics-II', rating: 4.5, feedback: 156 },
    { subject: 'Applied Physics', rating: 4.2, feedback: 142 },
    { subject: 'FEEE', rating: 4.3, feedback: 138 },
    { subject: 'IT Systems', rating: 4.1, feedback: 124 },
    { subject: 'Environmental Science', rating: 3.1, feedback: 122 },
    { subject: 'Engineering Mechanics', rating: 4.4, feedback: 118 }
  ]

  const facultyData = [
    { name: 'Sandeep Kumar', subjects: 2, avgRating: 4.6, feedback: 280 },
    { name: 'Ankit Gupta', subjects: 1, avgRating: 4.4, feedback: 250 },
    { name: 'Abhishek Singh', subjects: 3, avgRating: 4.3, feedback: 320 },
    { name: 'Narendra Singh', subjects: 2, avgRating: 4.2, feedback: 190 },
    { name: 'Prince Kumar', subjects: 1, avgRating: 4.5, feedback: 145 }
  ]

  const handleExport = (format) => {
    setExporting(true)
    setTimeout(() => {
      alert(`${format.toUpperCase()} export started. Check downloads folder.`)
      setExporting(false)
    }, 1000)
  }

  const handleBack = () => {
    navigate('/admin/dashboard')
  }

  return (
    <div className="feedback-reports">
      {/* Header */}
      <div className="reports-header">
        <button className="btn btn-back" onClick={handleBack}>
          ← Back
        </button>
        <div className="header-content">
          <h1 className="reports-title">
            <span className="reports-icon">📊</span>
            Feedback Reports & Analytics
          </h1>
          <p className="reports-subtitle">
            Detailed analysis of student feedback data
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label className="filter-label">
            <span className="filter-icon">🏛️</span>
            Branch Filter
          </label>
          <div className="branch-filters">
            {branches.map((branch) => (
              <button
                key={branch}
                className={`branch-filter ${selectedBranch === branch ? 'active' : ''}`}
                onClick={() => setSelectedBranch(branch)}
              >
                {branch === 'ALL' ? 'All Branches' : branch}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <span className="filter-icon">📅</span>
            Date Range
          </label>
          <div className="date-filters">
            {dateRanges.map((range) => (
              <button
                key={range.value}
                className={`date-filter ${dateRange === range.value ? 'active' : ''}`}
                onClick={() => setDateRange(range.value)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="export-buttons">
          <button 
            className="btn btn-export excel"
            onClick={() => handleExport('excel')}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : '📊 Export Excel'}
          </button>
          <button 
            className="btn btn-export pdf"
            onClick={() => handleExport('pdf')}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : '📄 Export PDF'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon total">📈</div>
          <div className="summary-content">
            <h3 className="summary-value">1,245</h3>
            <p className="summary-label">Total Feedback</p>
          </div>
          <div className="summary-change positive">+12%</div>
        </div>

        <div className="summary-card">
          <div className="summary-icon avg">⭐</div>
          <div className="summary-content">
            <h3 className="summary-value">4.3</h3>
            <p className="summary-label">Average Rating</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon subjects">📚</div>
          <div className="summary-content">
            <h3 className="summary-value">30</h3>
            <p className="summary-label">Subjects Covered</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon faculty">👨‍🏫</div>
          <div className="summary-content">
            <h3 className="summary-value">25</h3>
            <p className="summary-label">Faculty Members</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-container">
          <h3 className="chart-title">Daily Feedback Trends</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="feedback" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="avgRating" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Subject-wise Performance</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="subject" stroke="#64748b" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Bar dataKey="rating" fill="#10b981" name="Average Rating" radius={[4, 4, 0, 0]} />
                <Bar dataKey="feedback" fill="#4f46e5" name="Feedback Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Faculty Performance Table */}
      <div className="table-section">
        <h3 className="table-title">
          <span className="table-icon">👨‍🏫</span>
          Faculty Performance Summary
        </h3>
        <div className="performance-table">
          <div className="table-header">
            <div className="table-cell">Faculty Name</div>
            <div className="table-cell">Subjects</div>
            <div className="table-cell">Avg. Rating</div>
            <div className="table-cell">Feedback</div>
            <div className="table-cell">Performance</div>
          </div>
          {facultyData.map((faculty, index) => (
            <div key={index} className="table-row">
              <div className="table-cell name">{faculty.name}</div>
              <div className="table-cell">{faculty.subjects}</div>
              <div className="table-cell rating">
                <div className="rating-value">{faculty.avgRating.toFixed(1)}</div>
                <div className="stars-small">
                  {'★'.repeat(Math.floor(faculty.avgRating))}
                  {'☆'.repeat(5 - Math.floor(faculty.avgRating))}
                </div>
              </div>
              <div className="table-cell">{faculty.feedback}</div>
              <div className="table-cell">
                <div className={`performance-badge ${faculty.avgRating >= 4.5 ? 'excellent' : faculty.avgRating >= 4.0 ? 'good' : 'average'}`}>
                  {faculty.avgRating >= 4.5 ? 'Excellent' : faculty.avgRating >= 4.0 ? 'Good' : 'Average'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="reports-grid">
        <div className="report-card">
          <h4 className="report-title">📋 Detailed Reports</h4>
          <ul className="report-list">
            <li>• Complete feedback dataset</li>
            <li>• Branch-wise analysis</li>
            <li>• Subject comparison</li>
            <li>• Trend analysis</li>
          </ul>
          <button className="btn btn-view">View Full Report →</button>
        </div>

        <div className="report-card">
          <h4 className="report-title">📈 Insights</h4>
          <ul className="report-list">
            <li>• Highest rated subject: Mathematics-II</li>
            <li>• Most feedback: CSE Branch</li>
            <li>• Peak time: 11AM - 2PM</li>
            <li>• Response rate: 85%</li>
          </ul>
        </div>

        <div className="report-card">
          <h4 className="report-title">🎯 Recommendations</h4>
          <ul className="report-list">
            <li>• Improve workshop facilities</li>
            <li>• Increase practical sessions</li>
            <li>• Enhance faculty training</li>
            <li>• Update lab equipment</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="reports-footer">
        <div className="footer-info">
          <span className="footer-icon">📅</span>
          <span>Report Generated: {new Date().toLocaleDateString()}</span>
        </div>
        <div className="footer-info">
          <span className="footer-icon">👤</span>
          <span>Generated by: Admin</span>
        </div>
      </div>
    </div>
  )
}

export default FeedbackReports