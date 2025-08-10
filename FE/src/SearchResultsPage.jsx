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
 * API ENDPOINTS NEEDED:
 * 
 * 1. POST /api/search/natural
 *    - Purpose: Initial search when arriving from home with natural language query
 *    - Location: Line 134 (performInitialSearch function)
 *    - Request: { query: string, sessionId: string }
 *    - Response: { candidates: [...], extractedCriteria: {...} }
 * 
 * 2. GET /api/search/job/{jobId}
 *    - Purpose: Get candidates for specific job posting
 *    - Location: Line 134 (performInitialSearch function)
 *    - Response: { candidates: [...], extractedCriteria: {...} }
 * 
 * 3. POST /api/search/refine
 *    - Purpose: Update search with refined criteria
 *    - Location: Line 196 (handleSearchRefinement function)
 *    - Request: { query: string, previousQuery: string, sessionId: string }
 *    - Response: { candidates: [...], extractedCriteria: {...} }
 * 
 * RESPONSE FORMATS:
 * 
 * candidates: [{
 *   id: number,
 *   name: string,
 *   role: string,
 *   experience: number (years),
 *   skills: string[],
 *   category: 'Great' | 'Good' | 'Decent' | 'Poor',
 *   matchReason: string (AI-generated explanation),
 *   salary: string,
 *   location: string,
 *   education: string
 * }]
 * 
 * extractedCriteria: {
 *   experience: string,
 *   education: string,
 *   expertise: string,
 *   skills: string,
 *   traits: string,
 *   other: string
 * }
 * 
 * ADDITIONAL ENDPOINTS TO IMPLEMENT:
 * - GET /api/candidate/{id} - Full candidate profile (on click)
 * - POST /api/candidate/{id}/save - Save to recruiter's pool
 * - POST /api/candidate/{id}/message - Contact candidate
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { 
  Search, User, Briefcase, MapPin, DollarSign, 
  GraduationCap, Award, Clock, Brain, Building, 
  RefreshCw, Edit2, CheckCircle
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
    query || jobTitle || 'Looking for a senior ML engineer with 5+ years experience in production systems'
  );
  const [refinedQuery, setRefinedQuery] = useState('');
  
  // Results and loading states
  const [candidates, setCandidates] = useState(
    initialResults || [
      {
        id: 1,
        name: 'Sarah Chen',
        role: 'Senior ML Engineer',
        experience: 5,
        skills: ['PyTorch', 'TensorFlow', 'Kubernetes'],
        category: 'Great',
        matchReason: 'Deep expertise in requested frameworks, 5+ years production ML, 2 publications',
        location: 'San Francisco, CA',
        education: 'MS Computer Science, Stanford',
        companies_worked: 3,
        publications: 2,
        certifications: ['Certified TensorFlow Developer', 'AWS ML Specialty']
      },
      {
        id: 2,
        name: 'Marcus Johnson',
        role: 'AI Research Engineer',
        experience: 3,
        skills: ['Python', 'Transformers', 'JAX'],
        category: 'Good',
        matchReason: 'Strong research background with 4 papers, limited production experience',
        location: 'Remote',
        education: 'PhD AI/ML, MIT',
        companies_worked: 2,
        publications: 4,
        metrics_achieved: '30% model accuracy improvement'
      },
      {
        id: 3,
        name: 'Priya Patel',
        role: 'ML Engineer',
        experience: 2,
        skills: ['Scikit-learn', 'Python', 'AWS'],
        category: 'Decent',
        matchReason: 'Solid fundamentals, AWS certified, would need mentorship for senior role',
        location: 'Austin, TX',
        education: 'BS Computer Science, UT Austin',
        companies_worked: 1,
        certifications: ['AWS Certified ML']
      }
    ]
  );
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // Extracted search criteria (would come from AI parsing the natural language)
  const [searchCriteria, setSearchCriteria] = useState({
    experience: '5+ years',
    education: 'Bachelor\'s or higher in CS/related field',
    expertise: 'Production ML systems, Deep learning frameworks',
    skills: 'Python, TensorFlow/PyTorch, MLOps',
    traits: 'Leadership experience, Strong communication',
    other: 'Startup experience preferred'
  });

  // ============================================
  // SEARCH REFINEMENT HANDLER
  // Backend API: POST /api/search/refine
  // ============================================
  const handleSearchRefinement = async () => {
    if (!refinedQuery.trim() || refinedQuery === currentQuery) return;
    
    setIsLoading(true);
    
    try {
      // ===== BACKEND TEAM: IMPLEMENT THIS API CALL =====
      // const response = await fetch('/api/search/refine', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     query: refinedQuery,
      //     previousQuery: currentQuery,
      //     sessionId: 'unique-session-id' // Track search sessions
      //   })
      // });
      // 
      // const data = await response.json();
      // setCandidates(data.candidates);
      // setSearchCriteria(data.extractedCriteria); // AI-parsed criteria
      // setCurrentQuery(refinedQuery); // Update current query after successful search
      
      // MOCK: Simulate API delay and response
      setTimeout(() => {
        // Update the current query
        setCurrentQuery(refinedQuery);
        
        // Mock: Add a new candidate to show the search updated
        setCandidates([
          {
            id: 4,
            name: 'Alex Kim',
            role: 'ML Platform Lead',
            experience: 6,
            skills: ['MLOps', 'Kubernetes', 'Python'],
            category: 'Great',
            matchReason: 'Matches revised criteria with platform expertise',
            salary: '$190k-230k',
            location: 'Seattle, WA',
            education: 'MS Machine Learning, Carnegie Mellon'
          },
          {
            id: 1,
            name: 'Sarah Chen',
            role: 'Senior ML Engineer',
            experience: 5,
            skills: ['PyTorch', 'TensorFlow', 'Kubernetes'],
            category: 'Great',
            matchReason: 'Deep expertise in requested frameworks, 5+ years production ML',
            salary: '$180k-220k',
            location: 'San Francisco, CA',
            education: 'MS Computer Science, Stanford'
          },
          {
            id: 2,
            name: 'Marcus Johnson',
            role: 'AI Research Engineer',
            experience: 3,
            skills: ['Python', 'Transformers', 'JAX'],
            category: 'Good',
            matchReason: 'Strong research background, limited production experience',
            salary: '$150k-180k',
            location: 'Remote',
            education: 'PhD AI/ML, MIT'
          }
        ]);
        
        // Mock: Update extracted criteria based on refined search
        setSearchCriteria({
          experience: '5-7 years',
          education: 'Master\'s preferred',
          expertise: 'MLOps, Platform engineering',
          skills: 'Kubernetes, Docker, CI/CD',
          traits: 'Team leadership, Architecture design',
          other: 'Scale experience with ML systems'
        });
        
        // Clear the refined query input after successful search
        setRefinedQuery('');
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Search refinement failed:', error);
      setIsLoading(false);
    }
  };

  // Initialize refined query with current query
  useEffect(() => {
    setRefinedQuery(currentQuery);
  }, []);

  // ============================================
  // INITIAL SEARCH ON PAGE LOAD
  // Trigger search when arriving from HomePage
  // ============================================
  useEffect(() => {
    // If we have a query but no results, perform initial search
    if ((query || jobId) && (!initialResults || initialResults.length === 0)) {
      performInitialSearch();
    }
  }, []);

  const performInitialSearch = async () => {
    setIsLoading(true);
    
    try {
      // ===== BACKEND TEAM: IMPLEMENT THIS API CALL =====
      // const endpoint = searchType === 'job' 
      //   ? `/api/search/job/${jobId}`
      //   : '/api/search/natural';
      //
      // const response = await fetch(endpoint, {
      //   method: searchType === 'job' ? 'GET' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: searchType === 'natural' 
      //     ? JSON.stringify({ query: query })
      //     : undefined
      // });
      //
      // const data = await response.json();
      // setCandidates(data.candidates);
      // setSearchCriteria(data.extractedCriteria);
      
      // MOCK: Simulate initial API call
      setTimeout(() => {
        // Mock candidates based on search type
        const mockCandidates = searchType === 'job' ? [
          {
            id: 1,
            name: 'Alex Rodriguez',
            role: 'ML Platform Engineer',
            experience: 4,
            skills: ['Docker', 'Kubernetes', 'TensorFlow'],
            category: 'Great',
            matchReason: 'Perfect match for infrastructure role, strong MLOps background',
            location: 'San Francisco, CA',
            education: 'MS Computer Science',
            companies_worked: 2,
            certifications: 1
          },
          {
            id: 2,
            name: 'Emily Watson',
            role: 'Senior Data Scientist',
            experience: 6,
            skills: ['Python', 'SQL', 'Spark'],
            category: 'Good',
            matchReason: 'Strong data engineering skills, transitioning to ML engineering',
            location: 'Seattle, WA',
            education: 'PhD Statistics',
            companies_worked: 3,
            certifications: 2
          }
        ] : [
          {
            id: 1,
            name: 'Sarah Chen',
            role: 'Senior ML Engineer',
            experience: 5,
            skills: ['PyTorch', 'TensorFlow', 'Kubernetes'],
            category: 'Great',
            matchReason: 'Deep expertise in requested frameworks, 5+ years production ML, published 2 papers',
            location: 'San Francisco, CA',
            education: 'MS Computer Science, Stanford',
            companies_worked: 3,
            publications: 2
          },
          {
            id: 2,
            name: 'Marcus Johnson',
            role: 'AI Research Engineer',
            experience: 3,
            skills: ['Python', 'Transformers', 'JAX'],
            category: 'Good',
            matchReason: 'Strong research background, limited production experience',
            location: 'Remote',
            education: 'PhD AI/ML, MIT',
            companies_worked: 2,
            publications: 4
          },
          {
            id: 3,
            name: 'Priya Patel',
            role: 'ML Engineer',
            experience: 2,
            skills: ['Scikit-learn', 'Python', 'AWS'],
            category: 'Decent',
            matchReason: 'Solid fundamentals, would need mentorship for senior role',
            location: 'Austin, TX',
            education: 'BS Computer Science, UT Austin',
            companies_worked: 1,
            certifications: 1
          },
          {
            id: 4,
            name: 'David Kim',
            role: 'ML Research Scientist',
            experience: 4,
            skills: ['TensorFlow', 'PyTorch', 'Research'],
            category: 'Great',
            matchReason: 'Strong publication record (5 papers), matches your research needs',
            location: 'Boston, MA',
            education: 'PhD Machine Learning, CMU',
            companies_worked: 2,
            publications: 5
          }
        ];
        
        setCandidates(mockCandidates);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Initial search failed:', error);
      setIsLoading(false);
      // Could show an error message to user here
    }
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const getCategoryColor = (category) => {
    switch(category.toLowerCase()) {
      case 'great': return 'bg-green-100 text-green-700 border-green-300';
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'decent': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'poor': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
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
              {candidates.map((candidate) => (
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
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(candidate.category)}`}>
                      {candidate.category}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {candidate.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span className="px-2 py-0.5 text-gray-500 text-xs">
                        +{candidate.skills.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {candidate.experience} yrs
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {candidate.location}
                    </span>
                    {candidate.publications && (
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
              ))}
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
                  placeholder="Modify your search criteria..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                  rows="3"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Tip: Add specifics like "must have AWS experience" or "prefers remote work"
                  </p>
                  <button
                    onClick={handleSearchRefinement}
                    disabled={isLoading || !refinedQuery.trim() || refinedQuery === currentQuery}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isLoading || !refinedQuery.trim() || refinedQuery === currentQuery
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isLoading ? 'Searching...' : 'Update Search'}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. EXTRACTED CRITERIA */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Here's What We're Looking For
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
                
                {/* AI/ML Expertise */}
                <div className="flex items-start">
                  <Brain className="h-4 w-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">AI/ML Expertise</p>
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
                  <span className="font-medium">Note:</span> These criteria are automatically extracted from your search. 
                  Refine your search above to update these requirements.
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