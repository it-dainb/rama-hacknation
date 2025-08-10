// src/HomePage.jsx

/**
 * ============================================
 * BACKEND TEAM: API INTEGRATION GUIDE
 * ============================================
 * 
 * This is the HOME PAGE where recruiters:
 * 1. Enter natural language descriptions of ideal candidates
 * 2. Select from their posted jobs
 * 3. See preview results (optional)
 * 
 * API ENDPOINTS NEEDED:
 * 
 * 1. GET /api/recruiter/jobs
 *    - Purpose: Fetch all jobs posted by logged-in recruiter
 *    - Location: Line 46 (jobPosts array)
 *    - Response: Array of job objects with {id, title, department, location, posted, applicants}
 * 
 * 2. POST /api/search/preview (OPTIONAL)
 *    - Purpose: Get quick preview results for home page display
 *    - Location: Line 105 (handleSearchIconClick function)
 *    - Request: { query: string, limit: 4 }
 *    - Response: { candidates: [...] }
 *    - Note: Only if you want preview on home page before navigation
 * 
 * NAVIGATION NOTES:
 * - "Search for Candidates" button → Goes directly to SearchResultsPage
 * - Search icon → Shows preview on home page (optional feature)
 * - Clicking job posts → Goes to SearchResultsPage with job context
 * 
 * AUTHENTICATION:
 * - Add auth headers to all API calls
 * - User info should replace "R" avatar (line 212)
 * ============================================
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Briefcase, MapPin, DollarSign, ChevronDown, 
  Target, Building, Calendar, Users, ArrowRight, ChevronRight,
  User, Clock, Award
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [naturalLanguageGoal, setNaturalLanguageGoal] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showInitialResults, setShowInitialResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Mock data for existing job posts
  const jobPosts = [
    {
      id: 1,
      title: 'Senior ML Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      posted: '2 days ago',
      applicants: 47
    },
    {
      id: 2,
      title: 'AI Research Scientist',
      department: 'Research',
      location: 'Remote',
      posted: '5 days ago',
      applicants: 23
    },
    {
      id: 3,
      title: 'Machine Learning Infrastructure Engineer',
      department: 'Platform',
      location: 'New York, NY',
      posted: '1 week ago',
      applicants: 31
    },
    {
      id: 4,
      title: 'Computer Vision Engineer',
      department: 'AI Products',
      location: 'Austin, TX',
      posted: '1 week ago',
      applicants: 19
    }
  ];

  // Mock initial search results
  const initialResults = [
    {
      id: 1,
      name: 'Elina Zarifis',
      role: 'AI/ML Engineer',
      experience: 5,
      skills: ['ML Engineer', 'Staff Backend Engineer', 'AI/ML Researcher'],
      category: 'Great',
      matchReason: 'PhD Researcher - Gen Strategic Data Scientist',
      education: 'PhD',
      specialist: 'NLP Specialist'
    },
    {
      id: 2,
      name: 'Zackaery Mun',
      role: 'Data Scientist',
      experience: 5,
      skills: ['ML Engineer', 'Staff Backend Engineer', 'AI/ML Researcher'],
      category: 'Great',
      matchReason: 'PhD Researcher - Gen Strategic Data Scientist',
      education: 'PhD',
      specialist: 'NLP Specialist'
    },
    {
      id: 3,
      name: 'Truth Smithson',
      role: 'AI/ML Researcher',
      experience: 5,
      skills: ['ML Engineer', 'PhD Researcher', 'Gen AI/ML Researcher'],
      category: 'Great',
      matchReason: 'Strong research background with production experience',
      education: 'PhD',
      specialist: 'NLP Specialist'
    },
    {
      id: 4,
      name: 'Qing Lopez',
      role: 'AI/ML Researcher',
      experience: 5,
      skills: ['ML Engineer', 'Staff Backend Engineer', 'AI/ML Researcher'],
      category: 'Good',
      matchReason: 'PhD Researcher - Gen Strategic Data Scientist',
      education: 'PhD',
      specialist: 'NLP Specialist'
    }
  ];

  // ============================================
  // NAVIGATION HANDLERS
  // ============================================
  
  // Handle search icon click - shows preview results on home page
  const handleSearchIconClick = () => {
    if (!naturalLanguageGoal.trim()) {
      alert('Please enter a search description');
      return;
    }
    
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setShowInitialResults(true);
      setIsSearching(false);
    }, 1000);
  };

  // Handle "Search for Candidates" button - goes directly to search page
  const handleSearchButtonClick = () => {
    if (!naturalLanguageGoal.trim()) {
      alert('Please enter a search description');
      return;
    }
    
    // Navigate directly to search results page
    navigate('/search', { 
      state: { 
        query: naturalLanguageGoal,
        searchType: 'natural',
        initialResults: [] // Will trigger fresh search on that page
      } 
    });
  };

  // Navigate to full search results page
  const handleViewFullResults = () => {
    navigate('/search', { 
      state: { 
        query: naturalLanguageGoal,
        searchType: 'natural',
        initialResults: initialResults // Pass the initial results
      } 
    });
  };

  // Handle job post selection - navigates to search page
  const handleJobPostSelection = (jobId) => {
    setSelectedJobId(jobId);
    const selectedJob = jobPosts.find(job => job.id === jobId);
    
    // Small delay to show selection, then navigate
    setTimeout(() => {
      navigate('/search', { 
        state: { 
          jobId: jobId,
          jobTitle: selectedJob?.title,
          searchType: 'job' 
        } 
      });
    }, 200);
  };

  // Handle Enter key in textarea
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearchIconClick();
    }
  };

  // Category color helper
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
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
              <button className="text-gray-600 hover:text-gray-900 font-medium">Dashboard</button>
              <button className="text-gray-600 hover:text-gray-900 font-medium">Posted Jobs</button>
              <button className="text-gray-600 hover:text-gray-900 font-medium">Messages</button>
              <div className="h-9 w-9 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                R
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Find Your Perfect Candidate
          </h1>
          <p className="text-lg text-gray-600">
            Hire faster, hire smarter with Affinix AI
          </p>
        </div>

        {/* Natural Language Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <Target className="h-5 w-5 text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Describe Your Ideal Candidate</h2>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={naturalLanguageGoal}
                onChange={(e) => setNaturalLanguageGoal(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell us what you're looking for in natural language...&#10;&#10;Example: 'I need a senior engineer who values shipping fast over perfect architecture, has experience with large language models, and can mentor junior team members'"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                rows="4"
              />
              <button
                onClick={handleSearchIconClick}
                className="absolute right-3 top-3 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                title="Preview results on this page"
              >
                <Search className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
              </button>
            </div>
            
            {/* Quick Templates */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 font-medium">Try these:</span>
              <button 
                onClick={() => setNaturalLanguageGoal("I need someone who ships fast over perfect architecture")}
                className="text-sm px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors"
              >
                Fast shipper
              </button>
              <button 
                onClick={() => setNaturalLanguageGoal("Looking for someone with strong research background and publication record")}
                className="text-sm px-3 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors"
              >
                Research background
              </button>
              <button 
                onClick={() => setNaturalLanguageGoal("Need a senior engineer who can mentor juniors and lead technical decisions")}
                className="text-sm px-3 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors"
              >
                Team leader
              </button>
            </div>
            
            {/* Search Button - Goes directly to search page */}
            <button
              onClick={handleSearchButtonClick}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              Search for Candidates
            </button>
          </div>
        </div>

        {/* Job Posts Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center mb-4">
            <Briefcase className="h-5 w-5 text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Top Candidates for Your Posts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobPosts.map((job) => (
              <button
                key={job.id}
                onClick={() => handleJobPostSelection(job.id)}
                className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-md transform hover:scale-[1.02] ${
                  selectedJobId === job.id 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  {selectedJobId === job.id && (
                    <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">Selected</span>
                  )}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Building className="h-3 w-3 mr-1.5" />
                    {job.department}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1.5" />
                    {job.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1.5" />
                      {job.posted}
                    </span>
                    <span className="flex items-center text-indigo-600 font-medium">
                      <Users className="h-3 w-3 mr-1.5" />
                      {job.applicants} applicants
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center text-indigo-600 text-sm font-medium">
                  View candidates
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Preview Section - Shows after clicking search icon */}
        {showInitialResults && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
                <p className="text-gray-600 mt-1">
                  Top candidates for ML Engineer - {initialResults.length} of 10 shown
                </p>
              </div>
              <button
                onClick={handleViewFullResults}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                View All Results
                <ChevronRight className="h-5 w-5 ml-1" />
              </button>
            </div>

            {/* Candidate Preview Cards */}
            <div className="space-y-4">
              {initialResults.slice(0, 4).map((candidate) => (
                <div 
                  key={candidate.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/candidate/${candidate.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getCategoryColor(candidate.category)}`}>
                            {candidate.category} match
                          </span>
                          {candidate.category === 'Good' && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full border bg-yellow-100 text-yellow-700 border-yellow-300">
                              Decent match
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{candidate.role}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                            <Award className="h-3 w-3 mr-1" />
                            {candidate.education}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                            <Clock className="h-3 w-3 mr-1" />
                            {candidate.experience} years industry
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                            {candidate.specialist}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{candidate.matchReason}</p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Resume viewer coming soon!');
                        }}
                        className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Resume
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Message feature coming soon!');
                        }}
                        className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Message
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Saved to talent pool!');
                        }}
                        className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Save to Pool
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button at Bottom */}
            <div className="mt-6 text-center">
              <button
                onClick={handleViewFullResults}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                View Full Search Results
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;