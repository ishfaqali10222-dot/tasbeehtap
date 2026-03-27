import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StaticPage from './pages/StaticPage';
import { aboutContent, privacyContent, disclaimerContent, contactContent, termsContent } from './content/pages';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<StaticPage title="About TasbeehTap" content={aboutContent} />} />
      <Route path="/privacy-policy" element={<StaticPage title="Privacy Policy" content={privacyContent} />} />
      <Route path="/disclaimer" element={<StaticPage title="Disclaimer" content={disclaimerContent} />} />
      <Route path="/contact" element={<StaticPage title="Contact Us" content={contactContent} />} />
      <Route path="/terms" element={<StaticPage title="Terms & Conditions" content={termsContent} />} />
    </Routes>
  );
}
