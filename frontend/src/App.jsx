import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext'; // ADD THIS
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import AnimatedBackground from './components/AnimatedBackground';

import Home from './pages/Home';
import JoinPage from './pages/JoinPage';
import AuthCallback from './pages/AuthCallback';
import Profile from './pages/Profile';
import JoinProject from './sections/JoinProject';
import UploadProject from './sections/UploadProject';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDashboard from './pages/ProjectDashboard';
import ExploreProjects from './pages/ExploreProjects';

import './styles/animations.css';

const FooterWrapper = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/projects')) return null;
  return <Footer />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>       
          <ToastProvider>
            <div className="app-container">
              <AnimatedBackground />
              <Navbar />
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
        </SocketProvider>    
      </AuthProvider>
    </Router>
  );
}

export default App;