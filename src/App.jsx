import "./App.css";
import AdminDashboard from "./admin/AdminDashboard";
import AdminLogin from "./admin/AdminLogin";
import FacultyAnalysis from "./admin/FacultyAnalysis";
import FeedbackReports from "./admin/FeedbackReports";
import LandingPage from "./components/LandingPage";
import StudentVerification from "./components/StudentVerification";
import SubjectFeedback from "./components/SubjectFeedback";
import SuccessPage from "./components/SuccessPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        {/* Student Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify" element={<StudentVerification />} />
        <Route path="/feedback" element={<SubjectFeedback />} />
        <Route path="/success" element={<SuccessPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/reports" element={<FeedbackReports />} />
        <Route path="/admin/faculty-analysis" element={<FacultyAnalysis />} />
      </Routes>
    </Router>
  )
}

export default App