import "./SuccessPage.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Prevent back navigation
    const handleBackButton = (e) => {
      e.preventDefault()
      navigate('/')
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handleBackButton)

    return () => {
      window.removeEventListener('popstate', handleBackButton)
    }
  }, [navigate])

  const handleHomeClick = () => {
    navigate('/')
  }

  return (
    <div className="success-page">
      <div className="container">
        <div className="card fade-in">
          {/* Success Animation */}
          <div className="success-animation">
            <div className="checkmark">✓</div>
          </div>
          
          {/* Title */}
          <h1 className="success-title">
            Thank You! 🎉
          </h1>
          
          {/* Message */}
          <p className="success-message">
            Your feedback has been submitted successfully and will help us improve the teaching-learning process.
          </p>
          
          {/* Details */}
          <div className="success-details">
            <div className="detail-item">
              <div className="detail-icon">📊</div>
              <div className="detail-content">
                <h3>Your Impact</h3>
                <p>Directly contributes to curriculum improvement</p>
              </div>
            </div>
            
            <div className="detail-item">
              <div className="detail-icon">🛡️</div>
              <div className="detail-content">
                <h3>100% Anonymous</h3>
                <p>Your identity is protected</p>
              </div>
            </div>
          </div>
          
          {/* Next Steps */}
          <div className="next-steps">
            <h2>What happens next?</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-text">Feedback analysis by committee</div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-text">Report generation for faculty</div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-text">Implementation of improvements</div>
              </div>
            </div>
          </div>
          
          {/* Home Button */}
          <button 
            className="btn btn-primary home-btn"
            onClick={handleHomeClick}
          >
            🏠 Return to Home
          </button>
          
          {/* Contact */}
          <div className="contact-info">
            <p>For any queries regarding feedback:</p>
            <p className="email">feedback@gpsahjanwa.edu.in</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuccessPage