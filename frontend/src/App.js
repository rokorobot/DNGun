import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import axios from 'axios';

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";

// Pages
import HomePage from "./pages/HomePage";
import BuyPage from "./pages/BuyPage";
import SellPage from "./pages/SellPage";
import DomainDetailPage from "./pages/DomainDetailPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import NotFoundPage from "./pages/NotFoundPage";
import TestPage from "./pages/TestPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";

// API utilities
import { domainAPI } from "./utils/api";

// Context
import { AuthProvider } from "./context/AuthContext";

// Set axios defaults
axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8002/api';

function App() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    // Simulate page load delay for initial animations
    setTimeout(() => {
      setIsPageLoaded(true);
    }, 300);
  }, []);

  return (
    <div className={`App transition-opacity duration-500 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/buy-domain" element={<BuyPage />} />
              <Route path="/sell-domain" element={<SellPage />} />
              <Route path="/domain/:domainName" element={<DomainDetailPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
          <CookieConsent />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;