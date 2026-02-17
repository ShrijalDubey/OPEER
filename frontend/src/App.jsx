import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import JoinPage from './pages/JoinPage';
import JoinProject from './sections/JoinProject'; 




// Styles
import './App.css'; 

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/join-project" element={<JoinProject />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;