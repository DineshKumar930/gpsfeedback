import "./FacultyAnalysis.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts";

const FacultyAnalysis = () => {
  const navigate = useNavigate()
  const [selectedFaculty, setSelectedFaculty] = useState('all')
  const [timePeriod, setTimePeriod] = useState('semester')

  // Sample faculty data
  const facultyList = [
    { id: 'all', name: 'All Faculty', subjects: 6, branch: 'ALL' },
    { id: 'sk', name: 'Sandeep Kumar', subjects: 2, branch: 'CSE,ME,EE' },
    { id: 'akg', name: 'Ankit Kumar Gupta', subjects: 1, branch: 'ALL' },
    { id: 'ay', name: 'Abhimanyu Yadav', subjects: 3, branch: 'CSE,ME,EC' },
    { id: 'as', name: 'Abhishek Singh', subjects: 3, branch: 'ALL' },
    { id: 'ns', name: 'Narendra Singh', subjects: 2, branch: 'ME,EE' },
    { id: 'pk', name: 'Prince Kumar', subjects: 1, branch: 'CSE,EE' }
  ]

  // Sample performance data
  const performanceData = [
    { parameter: 'Teaching Quality', value: 4.5 },
    { parameter: 'Subject Knowledge', value: 4.7 },
    { parameter: 'Interaction', value: 4.3 },
    { parameter: 'Punctuality', value: 4.8 },
    { parameter: 'Overall', value: 4.6 }
  ]

  // Sample subject-wise data
  const subjectData = [
    { subject: 'Mathematics-II', rating: 4.6, feedback: 156 },
    { subject: 'Applied Physics', rating: 4.4, feedback: 142 },
    { subject: 'FEEE', rating: 4.3, feedback: 138 }
  ]

  // Sample time series data
  const trendData = [
    { month: 'Jan', rating: 4.2 },
    { month: 'Feb', rating: 4.3 },
    { month: 'Mar', rating: 4.5 },
    { month: 'Apr', rating: 4.4 },
    { month: 'May', rating: 4.6 },
    { month: 'Jun', rating: 4.7 }
  ]

  const handleBack = () => {
    navigate('/admin/dashboard')
  }

  const handleSendReport = (faculty) => {
    alert(`Performance report sent to ${faculty.name}`)
  }

  const handleDownloadCertificate = (faculty) => {
    alert(`Certificate downloaded for ${faculty.name}`)
  }

  return (
    <div className="faculty-analysis">
      {/* Header */}
      <div className="analysis-header">
        <button className="btn btn-back" onClick={handleBack}>
          ← Back
        </button>
        <div className="header-content">
          <h1 className="analysis-title">
            <span className="analysis-icon">👨‍🏫</span>
            Faculty Performance Analysis
          </h1>
          <p className="analysis-subtitle">
            Detailed performance metrics and improvement insights
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label className="filter-label">
            <span className="filter-icon">👨‍🏫</span>
            Select Faculty
          </label>
          <select 
            className="faculty-select"
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
          >
            {facultyList.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name} ({faculty.branch})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <span className="filter-icon">📅</span>
            Time Period
          </label>
          <div className="period-filters">
            {['week', 'month', 'semester', 'year'].map((period) => (
              <button
                key={period}
                className={`period-filter ${timePeriod === period ? 'active' : ''}`}
                onClick={() => setTimePeriod(period)}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="performance-summary">
        <div className="summary-card main">
          <div className="summary-header">
            <h3 className="summary-title">Performance Overview</h3>
            <div className="summary-rating">
              <span className="rating-value">4.6</span>
              <span className="rating-label">/5.0</span>
            </div>
          </div>
          <div className="rating-breakdown">
            <div className="breakdown-item">
              <span className="breakdown-label">Teaching Quality</span>
              <div className="breakdown-bar">
                <div className="bar-fill" style={{ width: '90%' }}></div>
              </div>
              <span className="breakdown-value">4.5</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Subject Knowledge</span>
              <div className="breakdown-bar">
                <div className="bar-fill" style={{ width: '94%' }}></div>
              </div>
              <span className="breakdown-value">4.7</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Interaction</span>
              <div className="breakdown-bar">
                <div className="bar-fill" style={{ width: '86%' }}></div>
              </div>
              <span className="breakdown-value">4.3</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Punctuality</span>
              <div className="breakdown-bar">
                <div className="bar-fill" style={{ width: '96%' }}></div>
              </div>
              <span className="breakdown-value">4.8</span>
            </div>
          </div>
        </div>

        <div className="summary-card stats">
          <h3 className="summary-title">Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <div className="stat-value">2</div>
                <div className="stat-label">Subjects</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">💬</div>
              <div className="stat-content">
                <div className="stat-value">156</div>
                <div className="stat-label">Feedback</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-value">+12%</div>
                <div className="stat-label">Improvement</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <div className="stat-value">4.6</div>
                <div className="stat-label">Avg. Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <h3 className="chart-title">Performance Radar</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="parameter" />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                <Radar 
                  name="Performance" 
                  dataKey="value" 
                  stroke="#4f46e5" 
                  fill="#4f46e5" 
                  fillOpacity={0.6} 
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Rating Trend</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[3, 5]} />
                <Tooltip />
                <Bar dataKey="rating" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject-wise Performance */}
      <div className="subject-performance">
        <h3 className="section-title">Subject-wise Performance</h3>
        <div className="subject-grid">
          {subjectData.map((subject, index) => (
            <div key={index} className="subject-card">
              <div className="subject-header">
                <h4 className="subject-name">{subject.subject}</h4>
                <div className="subject-rating">
                  <span className="rating-value">{subject.rating}</span>
                  <div className="stars">
                    {'★'.repeat(Math.floor(subject.rating))}
                    {'☆'.repeat(5 - Math.floor(subject.rating))}
                  </div>
                </div>
              </div>
              <div className="subject-stats">
                <div className="stat">
                  <span className="stat-label">Feedback</span>
                  <span className="stat-value">{subject.feedback}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Branch</span>
                  <span className="stat-value">All</span>
                </div>
              </div>
              <div className="subject-actions">
                <button className="btn btn-details">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Cards */}
      <div className="action-cards">
        <div className="action-card">
          <div className="action-icon">📧</div>
          <h4 className="action-title">Send Performance Report</h4>
          <p className="action-description">
            Email detailed performance report to faculty member
          </p>
          <button 
            className="btn btn-action"
            onClick={() => handleSendReport({ name: 'Selected Faculty' })}
          >
            Send Report
          </button>
        </div>

        <div className="action-card">
          <div className="action-icon">🏆</div>
          <h4 className="action-title">Generate Certificate</h4>
          <p className="action-description">
            Create performance certificate for excellent faculty
          </p>
          <button 
            className="btn btn-action"
            onClick={() => handleDownloadCertificate({ name: 'Selected Faculty' })}
          >
            Download Certificate
          </button>
        </div>

        <div className="action-card">
          <div className="action-icon">📋</div>
          <h4 className="action-title">Training Recommendations</h4>
          <ul className="recommendation-list">
            <li>• Advanced teaching methodology</li>
            <li>• Student engagement techniques</li>
            <li>• Time management skills</li>
          </ul>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="comparison-section">
        <h3 className="section-title">Faculty Comparison</h3>
        <div className="comparison-table">
          <div className="table-header">
            <div className="table-cell">Faculty Name</div>
            <div className="table-cell">Subjects</div>
            <div className="table-cell">Avg. Rating</div>
            <div className="table-cell">Feedback</div>
            <div className="table-cell">Rank</div>
          </div>
          {facultyList.slice(1, 6).map((faculty, index) => (
            <div key={faculty.id} className="table-row">
              <div className="table-cell name">{faculty.name}</div>
              <div className="table-cell">{faculty.subjects}</div>
              <div className="table-cell">
                <div className="rating-display">
                  <span className="rating-value">4.{(index + 2).toFixed(1)}</span>
                  <div className="stars-small">
                    {'★'.repeat(4)}
                    {index < 2 ? '★' : '☆'}
                  </div>
                </div>
              </div>
              <div className="table-cell">{150 - (index * 20)}</div>
              <div className="table-cell">
                <div className={`rank-badge ${index < 3 ? 'top' : ''}`}>
                  #{index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="analysis-footer">
        <div className="footer-info">
          <span className="footer-icon">📅</span>
          <span>Last Updated: {new Date().toLocaleDateString()}</span>
        </div>
        <div className="footer-actions">
          <button className="btn btn-secondary">Export Data</button>
          <button className="btn btn-primary">Print Report</button>
        </div>
      </div>
    </div>
  )
}

export default FacultyAnalysis