import "./LandingPage.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate()

  const handleStartFeedback = () => {
    navigate('/verify')
  }

  return (
    <div className="landing-page">
      <div className="container">
        <div className="card fade-in">
          {/* College Logo Container */}
          <div className="logo-container">
            <div className="college-logo">
              {/* Try to load image, fallback to text */}
              <img 
                src="/college-logo.png" 
                alt="Government Polytechnic Sahjanwa Gorakhpur Logo"
                className="logo-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  // Show fallback text logo
                  const fallback = document.querySelector('.logo-fallback');
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              
              {/* Fallback text logo if image doesn't load */}
              <div className="logo-fallback">
                <div className="logo-text">
                  <div className="logo-line-1">GOVT. POLYTECHNIC</div>
                  <div className="logo-line-2">SAHJANWA</div>
                  <div className="logo-line-3">GORAKHPUR</div>
                  <div className="logo-line-4">U.P.</div>
                </div>
                <div className="logo-accent">GPS</div>
              </div>
            </div>
          </div>
          
          {/* College Name */}
          <h1 className="college-name">
            Govt. Polytechnic Sahjanwa
            <span className="college-location">Gorakhpur, Uttar Pradesh</span>
          </h1>
          
          {/* System Title */}
          <h2 className="system-title">
            Semester Feedback System
          </h2>
          
          {/* Instructions */}
          <div className="instructions">
            <h3 className="instructions-title">
              <span className="icon">📋</span>
              How to Provide Feedback
            </h3>
            
            <div className="instruction-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Enter Details</h4>
                  <p>Your roll number and branch</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Rate Subjects</h4>
                  <p>Evaluate each subject & faculty</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Submit</h4>
                  <p>Complete anonymous feedback</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Key Features */}
          <div className="features">
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <span className="feature-text">100% Confidential</span>
            </div>
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <span className="feature-text">Quick & Easy</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🎯</span>
              <span className="feature-text">Improves Quality</span>
            </div>
          </div>
          
          {/* Start Button */}
          <button 
            className="btn btn-primary start-button"
            onClick={handleStartFeedback}
          >
            <span className="button-icon">🚀</span>
            Start Feedback
          </button>
          
          {/* Footer Note */}
          <p className="footer-note">
            Your feedback helps improve teaching quality and college infrastructure.
            All responses are completely anonymous.<br/>Developed & Maintained by:<strong> Dinesh Roy & Prince Roy</strong>
          </p>

          {/* Add this after the existing footer note */}
  <div className="admin-link">
  <Link to="/admin" className="admin-portal-link">
    <span className="admin-icon">🔐</span>
    Faculty/Admin Portal
  </Link>
</div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
