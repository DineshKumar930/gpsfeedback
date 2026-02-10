import "./StudentVerification.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const StudentVerification = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rollNumber: "",
    branch: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const branches = [
    { value: "", label: "Select your branch" },
    { value: "CSE", label: "Computer Science & Engineering" },
    { value: "ME", label: "Mechanical Engineering" },
    { value: "EE", label: "Electrical Engineering" },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = "Roll number is required";
    } else if (!/^\d{6,10}$/.test(formData.rollNumber)) {
      newErrors.rollNumber = "Enter valid roll number (6-10 digits)";
    }

    if (!formData.branch) {
      newErrors.branch = "Please select your branch";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Use dynamic API URL from environment variables
      const API_BASE = process.env.REACT_APP_API_URL;
      const res = await fetch(
        `${API_BASE}/api/feedback/check/${formData.rollNumber}`
      );

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();

      if (data.exists) {
        setErrors({
          rollNumber: data.message || "Feedback already submitted",
        });
        setIsSubmitting(false);
        return;
      }

      // ✅ Allowed → save & proceed
      localStorage.setItem("studentData", JSON.stringify(formData));
      navigate("/feedback");
    } catch (error) {
      console.error("API error:", error);
      setErrors({
        rollNumber:
          "Server not responding or sleeping. Try again in a few seconds.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="verification-page">
      <div className="container">
        <div className="card fade-in">
          {/* Header */}
          <div className="page-header">
            <h1 className="page-title">
              <span className="icon">👤</span>
              Student Verification
            </h1>
            <p className="page-subtitle">
              Enter your details to proceed with feedback
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="verification-form">
            {/* Roll Number */}
            <div className="input-group">
              <label htmlFor="rollNumber">
                <span className="label-icon">🎓</span>
                Roll Number
              </label>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="Enter your roll number"
                className={errors.rollNumber ? "error" : ""}
                maxLength="10"
                inputMode="numeric"
              />
              {errors.rollNumber && (
                <div className="error-message">
                  <span>⚠</span> {errors.rollNumber}
                </div>
              )}
            </div>

            {/* Branch Selection */}
            <div className="input-group">
              <label htmlFor="branch">
                <span className="label-icon">🏛️</span>
                Branch
              </label>
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className={errors.branch ? "error" : ""}
              >
                {branches.map((branch) => (
                  <option key={branch.value} value={branch.value}>
                    {branch.label}
                  </option>
                ))}
              </select>
              {errors.branch && (
                <div className="error-message">
                  <span>⚠</span> {errors.branch}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="info-box">
              <div className="info-icon">ℹ️</div>
              <div className="info-content">
                <strong>Note:</strong> Your feedback is completely anonymous.
                Personal details are only used for validation purposes.
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span> Verifying...
                </>
              ) : (
                "Proceed to Feedback →"
              )}
            </button>
          </form>

          {/* Back Button */}
          <button
            className="btn btn-secondary back-btn"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentVerification;
