import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import AnimatedBackground from './components/AnimatedBackground';

// Pages
import Home from './pages/Home';
import JoinPage from './pages/JoinPage';
import AuthCallback from './pages/AuthCallback';
import Profile from './pages/Profile';
import JoinProject from './sections/JoinProject';
import UploadProject from './sections/UploadProject';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDashboard from './pages/ProjectDashboard';
import ExploreProjects from './pages/ExploreProjects';

// Global styles

import './styles/animations.css';

// Wrapper to conditionally render Footer
const FooterWrapper = () => {
  const location = useLocation();
  // Hide footer on projects section (list and dashboard)
  if (location.pathname.startsWith('/projects')) {
    return null;
  }
  return <Footer />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="app-container">
            <AnimatedBackground />
            <Navbar />

            {/* Blocking modal — renders if logged in but profile incomplete */}
            <ProfileSetupModal />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/join-thread" element={<JoinPage />} />
              <Route path="/join-project" element={<JoinProject />} />
              <Route path="/upload" element={<UploadProject />} />
              <Route path="/oauth-callback" element={<AuthCallback />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/explore" element={<ExploreProjects />} />
              <Route path="/projects/:id/dashboard" element={<ProjectDashboard />} />
            </Routes>

            <FooterWrapper />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;