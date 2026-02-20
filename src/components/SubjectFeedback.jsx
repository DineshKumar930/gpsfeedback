import "./SubjectFeedback.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subjects } from "../data/data";

const SubjectFeedback = () => {
  const navigate = useNavigate()
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0)
  const [feedbackData, setFeedbackData] = useState([])
  const [studentInfo, setStudentInfo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)

  // Track screen width for responsive adjustments
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Get student data from localStorage
    const storedData = localStorage.getItem('studentData')
    if (!storedData) {
      navigate('/verify')
      return
    }

    try {
      const parsedData = JSON.parse(storedData)
      setStudentInfo(parsedData)
      initializeFeedbackData(parsedData.branch)
    } catch (error) {
      console.error('Error parsing stored data:', error)
      navigate('/verify')
    }
  }, [navigate])

  const initializeFeedbackData = (branch) => {
    const branchSubjects = subjects[branch] || []
    const initialData = branchSubjects.map((subject, index) => ({
      subjectCode: `${branch}${(index + 1).toString().padStart(2, '0')}`,
      subjectName: subject.name,
      facultyName: subject.faculty,
      ratings: {
        "teachingQualityOrAbility": 0,
        "teachingStyleIntractive": 0,
        "isApporoachableAndHelping": 0,
        "punctuality": 0,
        "overallSatisfaction": 0
      },
      comment: ''
    }))
    setFeedbackData(initialData)
  }

  const ratingLabels = [
    { key: 'teachingQualityOrAbility', label: 'Teaching Quality', emoji: '📚' },
    { key: 'teachingStyleIntractive', label: 'Teaching Style', emoji: '💡' },
    { key: 'isApporoachableAndHelping', label: 'Approachable', emoji: '💬' },
    { key: 'punctuality', label: 'Punctuality', emoji: '⏰' },
    { key: 'overallSatisfaction', label: 'Overall', emoji: '⭐' }
  ]

  // Shorten labels for small screens
  const getRatingLabel = (label) => {
    if (screenWidth <= 360) {
      const shortLabels = {
        'Teaching Quality': 'Quality',
        'Teaching Style': 'Style',
        'Approachable': 'Helpful',
        'Punctuality': 'On Time',
        'Overall': 'Overall'
      }
      return shortLabels[label] || label
    }
    return label
  }

  const handleRatingChange = (ratingKey, value) => {
    const newData = [...feedbackData]
    newData[currentSubjectIndex].ratings[ratingKey] = value
    setFeedbackData(newData)
  }

  const handleCommentChange = (e) => {
    const newData = [...feedbackData]
    newData[currentSubjectIndex].comment = e.target.value
    setFeedbackData(newData)
  }

  const nextSubject = () => {
    if (currentSubjectIndex < feedbackData.length - 1) {
      setCurrentSubjectIndex(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevSubject = () => {
    if (currentSubjectIndex > 0) {
      setCurrentSubjectIndex(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const validateFeedback = () => {
    const unratedSubjects = feedbackData
      .filter(subject => subject.ratings.overallSatisfaction === 0)
      .map(subject => subject.subjectName)
    
    if (unratedSubjects.length > 0) {
      alert(`Please provide overall rating for:\n${unratedSubjects.join('\n')}`)
      return false
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (!validateFeedback()) {
      return
    }

    setIsSubmitting(true)

    const submissionData = {
      studentInfo,
      feedbackData,
      timestamp: new Date().toISOString(),
      totalSubjects: feedbackData.length
    }

    try {
      const response = await fetch("https://feedbackapi-4p6d.onrender.com/api///", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(submissionData)
      })

      const data = await response.json()

      if (response.ok) {
        console.log("Feedback submitted successfully:", data)
        localStorage.setItem('lastFeedback', JSON.stringify(submissionData))
        localStorage.removeItem('studentData')
        navigate('/success')
      } else {
        console.error("Backend error:", data)
        alert("Failed to submit feedback. Please try again.")
      }
    } catch (error) {
      console.error("Network or server error:", error)
      alert("Failed to submit feedback. Please check your connection.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!studentInfo || feedbackData.length === 0) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner large"></div>
        <p>Loading your subjects...</p>
      </div>
    )
  }

  const currentSubject = feedbackData[currentSubjectIndex]
  const progress = ((currentSubjectIndex + 1) / feedbackData.length) * 100
  const isLastSubject = currentSubjectIndex === feedbackData.length - 1
  const isSmallScreen = screenWidth <= 360

  return (
    <div className="feedback-page">
      <div className="container">
        <div className="card fade-in">
          {/* Header */}
          <div className="page-header">
            <div className="student-info">
              <span className="branch">{studentInfo.branch}</span>
              <span className="roll">Roll: {studentInfo.rollNumber}</span>
            </div>
            <h1 className="page-title">Subject Feedback</h1>
          </div>
          
          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-text">
              <span>Subject {currentSubjectIndex + 1} of {feedbackData.length}</span>
              <span className="progress-percent">{Math.round(progress)}%</span>
            </div>
          </div>
          
          {/* Subject Card */}
          <div className="subject-card">
            <div className="subject-header">
              <span className="subject-code">{currentSubject.subjectCode}</span>
              <h2 className="subject-name">{currentSubject.subjectName}</h2>
              <div className="faculty-info">
                
                <span className="faculty-name">{currentSubject.facultyName}</span>
              </div>
            </div>
            
            {/* Ratings */}
            <div className="ratings-section">
              <h3 className="section-title">Rate Your Experience</h3>
              
              <div className="ratings-list">
                {ratingLabels.map((rating) => (
                  <div key={rating.key} className="rating-item">
                    <div className="rating-label">
                      <span className="rating-emoji">{rating.emoji}</span>
                      <span>{getRatingLabel(rating.label)}</span>
                    </div>
                    
                    <div className="rating-controls">
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`star-btn ${
                              currentSubject.ratings[rating.key] >= star ? 'active' : ''
                            }`}
                            onClick={() => handleRatingChange(rating.key, star)}
                            aria-label={`Rate ${star} star`}
                          >
                            {currentSubject.ratings[rating.key] >= star ? '★' : '☆'}
                          </button>
                        ))}
                      </div>
                      <span className="rating-value">
                        {currentSubject.ratings[rating.key] || 0}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Comments */}
            <div className="comment-section">
              <h3 className="section-title">
                <span className="comment-icon">💬</span>
                {isSmallScreen ? "Comments" : "Additional Comments (Optional)"}
              </h3>
              <textarea
                value={currentSubject.comment}
                onChange={handleCommentChange}
                placeholder={isSmallScreen ? "Your feedback..." : "Your suggestions or feedback for this subject..."}
                rows="3"
                maxLength="500"
                className="comment-textarea"
              />
              <div className="char-count">
                {currentSubject.comment.length}/500
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="navigation">
            <div className="nav-buttons">
              {currentSubjectIndex > 0 && (
                <button 
                  className="btn btn-secondary prev-btn"
                  onClick={prevSubject}
                >
                  {isSmallScreen ? '← Prev' : '← Previous'}
                </button>
              )}
              
              {!isLastSubject ? (
                <button 
                  className="btn btn-primary next-btn"
                  onClick={nextSubject}
                >
                  {isSmallScreen ? 'Next →' : 'Next Subject →'}
                </button>
              ) : (
                <button 
                  className="btn btn-success submit-btn"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loadingd-spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    isSmallScreen ? 'Submit All' : 'Submit All Feedback'
                  )}
                </button>
              )}
            </div>
            
            {/* Quick Navigation */}
            <div className="quick-nav">
              <div className="quick-nav-label">
                {isSmallScreen ? 'Subjects:' : 'Jump to subject:'}
              </div>
              <div className="subject-chips">
                {feedbackData.map((subject, index) => {
                  const isRated = subject.ratings.overallSatisfaction > 0
                  const isCurrent = index === currentSubjectIndex
                  
                  return (
                    <button
                      key={subject.subjectCode}
                      className={`subject-chip ${
                        isCurrent ? 'current' : ''
                      } ${
                        isRated ? 'rated' : ''
                      }`}
                      onClick={() => {
                        setCurrentSubjectIndex(index)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      aria-label={`Subject ${index + 1} ${isRated ? 'rated' : 'not rated'}`}
                    >
                      {index + 1}
                      {isRated && <span className="chip-check">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubjectFeedback
