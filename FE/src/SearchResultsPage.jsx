/**
 * ============================================
 * BACKEND TEAM: API INTEGRATION GUIDE
 * ============================================
 * 
 * This is the SEARCH RESULTS PAGE where recruiters:
 * 1. View recommended candidates (left side)
 * 2. Refine their search criteria (right side)
 * 3. See AI-extracted search requirements
 * 
 * INTEGRATED API ENDPOINTS:
 * 
 * 1. GET /get_candidates?jd_id={jobId}
 *    - Purpose: Get candidates for specific job posting
 *    - Location: Line 140 (performInitialSearch function)
 *    - Response: { candidates: [...], common_aspects: [...] }
 * 
 * 2. POST /chat
 *    - Purpose: Refine search with natural language query
 *    - Location: Line 208 (handleSearchRefinement function)
 *    - Request: { query: string, job_id: UUID }
 *    - Response: { analysis, recommendations, key_insights, aspect_weights, top_candidates, ... }
 * 
 * 3. GET /get_jobs
 *    - Purpose: Get all available job listings
 *    - Used for job selection/validation
 * 
 * RESPONSE FORMATS:
 * 
 * Candidate format from /get_candidates:
 * {
 *   name: string,
 *   title: string,
 *   metric: {
 *     metric_id: UUID,
 *     job_id: UUID,
 *     // additional metric data
 *   }
 * }
 * 
 * Chat response format from /chat:
 * {
 *   analysis: string,
 *   recommendations: string,
 *   key_insights: string,
 *   aspect_weights: { [aspect: string]: number },
 *   reasoning: string,
 *   top_candidates: Array<candidate_data>,
 *   query_processed: string,
 *   job_title: string
 * }
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { 
  Search, User, Briefcase, MapPin, DollarSign, 
  GraduationCap, Award, Clock, Brain, Building, 
  RefreshCw, Edit2, CheckCircle, AlertCircle
} from 'lucide-react';

const SearchResultsPage = () => {
  // ============================================
  // NAVIGATION AND ROUTING
  // ============================================
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data passed from home page
  const { query, jobId, jobTitle, searchType, initialResults } = location.state || {};
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Search queries
  const [currentQuery, setCurrentQuery] = useState(
    query || jobTitle || 'Looking for the best candidates for this role'
  );
  const [refinedQuery, setRefinedQuery] = useState('');
  
  // Results and loading states
  const [candidates, setCandidates] = useState(initialResults || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // Chat analysis results
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // Extracted search criteria (from aspect weights)
  const [searchCriteria, setSearchCriteria] = useState({
    experience: 'Relevant experience required',
    education: 'Appropriate educational background',
    expertise: 'Domain-specific expertise',
    skills: 'Required technical skills',
    traits: 'Desired soft skills and traits',
    other: 'Additional requirements'
  });

  // ============================================
  // API CONFIGURATION
  // ============================================
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  const transformBackendCandidate = (backendCandidate) => {
    // Transform backend candidate format to frontend format
    return {
      id: backendCandidate.metric?.metric_id || Math.random().toString(36).substr(2, 9),
      name: backendCandidate.name || 'Unknown Candidate',
      role: backendCandidate.title || 'Unknown Role',
      experience: backendCandidate.experience || 0,
      skills: backendCandidate.skills || [],
      category: categorizeCandidateMatch(backendCandidate),
      matchReason: backendCandidate.match_reason || 'Candidate matches job requirements',
      location: backendCandidate.location || 'Location not specified',
      education: backendCandidate.education || 'Education not specified',
      salary: backendCandidate.salary || 'Salary not specified',
      companies_worked: backendCandidate.companies_worked || 0,
      publications: backendCandidate.publications || 0,
      certifications: backendCandidate.certifications || [],
      metrics_achieved: backendCandidate.metrics_achieved || null,
      score: backendCandidate.score || backendCandidate.overall_score || 0
    };
  };
  
  const categorizeCandidateMatch = (candidate) => {
    const score = candidate.score || candidate.overall_score || 0;
    if (score >= 0.8) return 'Great';
    if (score >= 0.6) return 'Good';  
    if (score >= 0.4) return 'Decent';
    return 'Poor';
  };
  
  const updateCriteriaFromAspectWeights = (aspectWeights) => {
    if (!aspectWeights || Object.keys(aspectWeights).length === 0) return;
    
    // Convert aspect weights to readable criteria
    const sortedAspects = Object.entries(aspectWeights)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6); // Top 6 most important aspects
    
    const criteriaMap = {
      experience: sortedAspects.filter(([key]) => 
        key.toLowerCase().includes('experience') || 
        key.toLowerCase().includes('years') ||
        key.toLowerCase().includes('seniority')
      ).map(([key, weight]) => `${key} (${Math.round(weight * 100)}% importance)`).join(', ') || 'Experience as specified',
      
      education: sortedAspects.filter(([key]) => 
        key.toLowerCase().includes('education') || 
        key.toLowerCase().includes('degree') ||
        key.toLowerCase().includes('qualification')
      ).map(([key, weight]) => `${key} (${Math.round(weight * 100)}% importance)`).join(', ') || 'Educational requirements',
      
      expertise: sortedAspects.filter(([key]) => 
        key.toLowerCase().includes('expertise') || 
        key.toLowerCase().includes('domain') ||
        key.toLowerCase().includes('specialization')
      ).map(([key, weight]) => `${key} (${Math.round(weight * 100)}% importance)`).join(', ') || 'Domain expertise',
      
      skills: sortedAspects.filter(([key]) => 
        key.toLowerCase().includes('skill') || 
        key.toLowerCase().includes('technology') ||
        key.toLowerCase().includes('programming')
      ).map(([key, weight]) => `${key} (${Math.round(weight * 100)}% importance)`).join(', ') || 'Technical skills',
      
      traits: sortedAspects.filter(([key]) => 
        key.toLowerCase().includes('communication') || 
        key.toLowerCase().includes('leadership') ||
        key.toLowerCase().includes('collaboration')
      ).map(([key, weight]) => `${key} (${Math.round(weight * 100)}% importance)`).join(', ') || 'Soft skills and traits',
      
      other: sortedAspects.filter(([key]) => 
        !key.toLowerCase().includes('experience') &&
        !key.toLowerCase().includes('education') &&
        !key.toLowerCase().includes('skill') &&
        !key.toLowerCase().includes('communication') &&
        !key.toLowerCase().includes('leadership')
      ).slice(0, 3).map(([key, weight]) => `${key} (${Math.round(weight * 100)}% importance)`).join(', ') || 'Additional requirements'
    };
    
    setSearchCriteria(criteriaMap);
  };

  // ============================================
  // SEARCH REFINEMENT HANDLER
  // Backend API: POST /chat
  // ============================================
  const handleSearchRefinement = async () => {
    if (!refinedQuery.trim() || refinedQuery === currentQuery) return;
    if (!jobId) {
      setError('No job ID available for search refinement');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: refinedQuery,
          job_id: jobId
        })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update analysis result
      setAnalysisResult(data);
      
      // Transform and update candidates from top_candidates
      if (data.top_candidates && Array.isArray(data.top_candidates)) {
        const transformedCandidates = data.top_candidates.map(transformBackendCandidate);
        setCandidates(transformedCandidates);
      }
      
      // Update search criteria from aspect weights
      if (data.aspect_weights) {
        updateCriteriaFromAspectWeights(data.aspect_weights);
      }
      
      // Update current query after successful search
      setCurrentQuery(refinedQuery);
      setRefinedQuery('');
      
    } catch (error) {
      console.error('Search refinement failed:', error);
      setError(`Failed to refine search: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize refined query with current query
  useEffect(() => {
    setRefinedQuery(currentQuery);
  }, []);

  // ============================================
  // INITIAL SEARCH ON PAGE LOAD
  // Backend API: GET /get_candidates?jd_id={jobId}
  // ============================================
  useEffect(() => {
    // If we have a jobId but no results, perform initial search
    if (jobId && (!initialResults || initialResults.length === 0)) {
      performInitialSearch();
    }
  }, [jobId]);

  const performInitialSearch = async () => {
    if (!jobId) {
      setError('No job ID provided for candidate search');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/get_candidates?jd_id=${jobId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform backend candidates to frontend format
      if (data.candidates && Array.isArray(data.candidates)) {
        const transformedCandidates = data.candidates.map(transformBackendCandidate);
        setCandidates(transformedCandidates);
      } else if (Array.isArray(data)) {
        // Handle case where data is directly an array of candidates
        const transformedCandidates = data.map(transformBackendCandidate);
        setCandidates(transformedCandidates);
      } else {
        console.warn('Unexpected candidates data format:', data);
        setCandidates([]);
      }
      
      // If we have common_aspects, we could use them for initial criteria
      if (data.common_aspects) {
        // Could create initial criteria from common aspects
        console.log('Common aspects available:', data.common_aspects);
      }
      
    } catch (error) {
      console.error('Initial search failed:', error);
      setError(`Failed to load candidates: ${error.message}`);
      setCandidates([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const getCategoryColor = (category) => {
    switch(category?.toLowerCase()) {
      case 'great': return 'bg-green-100 text-green-700 border-green-300';
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'decent': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'poor': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatSkills = (skills) => {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') return skills.split(',').map(s => s.trim());
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Same as HomePage */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigate('/')}
                className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              >
                Affinix
              </button>
            </div>
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Dashboard
              </button>
              <button className="text-gray-600 hover:text-gray-900 font-medium">
                Posted Jobs
              </button>
              <button className="text-gray-600 hover:text-gray-900 font-medium">
                Messages
              </button>
              <div className="h-9 w-9 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                R
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* ============================================
              LEFT COLUMN: CANDIDATE LIST
              ============================================ */}
          <div className="w-2/5 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Recommended Candidates ({candidates.length})
              </h2>
              {isLoading && (
                <div className="flex items-center text-sm text-gray-500">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </div>
              )}
            </div>
            
            {/* Candidate Cards */}
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {candidates.length === 0 && !isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No candidates found</p>
                  <p className="text-sm">Try refining your search criteria</p>
                </div>
              ) : (
                candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    onClick={() => navigate(`/candidate/${candidate.id}`)}
                    className={`relative p-4 bg-white rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${
                      selectedCandidate?.id === candidate.id 
                        ? 'border-indigo-500 shadow-md' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                          <p className="text-sm text-gray-600">{candidate.role}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(candidate.category)}`}>
                          {candidate.category}
                        </span>
                        {candidate.score && (
                          <span className="text-xs text-gray-500 mt-1">
                            Score: {Math.round(candidate.score * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {formatSkills(candidate.skills).slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {formatSkills(candidate.skills).length > 3 && (
                        <span className="px-2 py-0.5 text-gray-500 text-xs">
                          +{formatSkills(candidate.skills).length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mb-3">
                      {candidate.experience > 0 && (
                        <span className="flex items-center">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {candidate.experience} yrs
                        </span>
                      )}
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {candidate.location}
                      </span>
                      {candidate.publications > 0 && (
                        <span className="flex items-center">
                          <Award className="h-3 w-3 mr-1" />
                          {candidate.publications} papers
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                      {candidate.matchReason}
                    </p>
                    
                    {/* See More Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/candidate/${candidate.id}`);
                      }}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      See more →
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ============================================
              RIGHT COLUMN: SEARCH REFINEMENT PANELS
              ============================================ */}
          <div className="w-3/5 space-y-4">
            {/* 1. CURRENT SEARCH SUMMARY */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Search className="h-5 w-5 mr-2 text-indigo-600" />
                  Current Search
                </h3>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <p className="text-sm text-gray-700 italic">"{currentQuery}"</p>
                {jobTitle && (
                  <p className="text-xs text-gray-600 mt-1">Job: {jobTitle}</p>
                )}
              </div>
            </div>

            {/* 2. REFINE SEARCH */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Edit2 className="h-5 w-5 mr-2 text-indigo-600" />
                  Refine Your Search
                </h3>
              </div>
              
              <div className="space-y-3">
                <textarea
                  value={refinedQuery}
                  onChange={(e) => setRefinedQuery(e.target.value)}
                  placeholder="Ask about the candidates or modify search criteria..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                  rows="3"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Example: "Show me candidates with cloud experience" or "Who has the most publications?"
                  </p>
                  <button
                    onClick={handleSearchRefinement}
                    disabled={isLoading || !refinedQuery.trim() || refinedQuery === currentQuery || !jobId}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isLoading || !refinedQuery.trim() || refinedQuery === currentQuery || !jobId
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isLoading ? 'Analyzing...' : 'Refine Search'}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. ANALYSIS RESULTS (if available) */}
            {analysisResult && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  AI Analysis
                </h3>
                
                <div className="space-y-4">
                  {analysisResult.analysis && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Analysis</h4>
                      <p className="text-sm text-gray-600">{analysisResult.analysis}</p>
                    </div>
                  )}
                  
                  {analysisResult.key_insights && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Key Insights</h4>
                      <p className="text-sm text-gray-600">{analysisResult.key_insights}</p>
                    </div>
                  )}
                  
                  {analysisResult.recommendations && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h4>
                      <p className="text-sm text-gray-600">{analysisResult.recommendations}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. EXTRACTED CRITERIA */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Search Criteria
              </h3>
              
              <div className="space-y-3">
                {/* Experience */}
                <div className="flex items-start">
                  <Clock className="h-4 w-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Experience</p>
                    <p className="text-sm text-gray-600">{searchCriteria.experience}</p>
                  </div>
                </div>
                
                {/* Education */}
                <div className="flex items-start">
                  <GraduationCap className="h-4 w-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Education</p>
                    <p className="text-sm text-gray-600">{searchCriteria.education}</p>
                  </div>
                </div>
                
                {/* Expertise */}
                <div className="flex items-start">
                  <Brain className="h-4 w-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Expertise</p>
                    <p className="text-sm text-gray-600">{searchCriteria.expertise}</p>
                  </div>
                </div>
                
                {/* Technical Skills */}
                <div className="flex items-start">
                  <Award className="h-4 w-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Technical Skills</p>
                    <p className="text-sm text-gray-600">{searchCriteria.skills}</p>
                  </div>
                </div>
                
                {/* Soft Skills/Traits */}
                <div className="flex items-start">
                  <User className="h-4 w-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Key Traits</p>
                    <p className="text-sm text-gray-600">{searchCriteria.traits}</p>
                  </div>
                </div>
                
                {/* Other Requirements */}
                <div className="flex items-start">
                  <Building className="h-4 w-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Other Requirements</p>
                    <p className="text-sm text-gray-600">{searchCriteria.other}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Note:</span> These criteria are based on your search query and job requirements. 
                  Use the refinement panel above to adjust the search focus.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;