// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import SearchResultsPage from './SearchResultsPage';
import CandidateProfilePage from './CandidateProfilePage';  // ← CHECK THIS IMPORT

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/candidate/:candidateId" element={<CandidateProfilePage />} />  {/* ← CHECK THIS ROUTE */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;