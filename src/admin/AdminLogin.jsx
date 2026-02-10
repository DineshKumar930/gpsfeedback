import "./AdminLogin.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password')
      return
    }

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      // For demo purposes - In real app, validate against backend
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        localStorage.setItem('adminLoggedIn', 'true')
        localStorage.setItem('adminUsername', credentials.username)
        navigate('/admin/dashboard')
      } else {
        setError('Invalid credentials. Try: admin / admin123')
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleForgotPassword = () => {
    alert('Please contact system administrator to reset password.')
  }

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Admin Header */}
          <div className="admin-header">
            <div className="admin-logo">
              <span className="logo-icon">🔐</span>
              <h1>Admin Panel</h1>
            </div>
            <p className="admin-subtitle">
              Govt. Polytechnic Sahjanwa Feedback System
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">
                <span className="label-icon">👤</span>
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                placeholder="Enter admin username"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <span className="label-icon">🔑</span>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Enter admin password"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In to Admin Panel'
              )}
            </button>

            <button 
              type="button" 
              className="btn btn-link forgot-btn"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
          </form>

          {/* Security Info */}
          <div className="security-info">
            <div className="security-item">
              <span className="security-icon">🛡️</span>
              <span>Restricted Access</span>
            </div>
            <div className="security-item">
              <span className="security-icon">📊</span>
              <span>Feedback Analytics</span>
            </div>
            <div className="security-item">
              <span className="security-icon">📈</span>
              <span>Performance Reports</span>
            </div>
          </div>

          {/* Back to Home */}
          <button 
            className="btn btn-secondary back-btn"
            onClick={() => navigate('/')}
          >
            ← Back to Student Portal
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin