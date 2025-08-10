// src/CandidateProfilePage.jsx

/**
 * ============================================
 * BACKEND TEAM: API INTEGRATION GUIDE
 * ============================================
 * 
 * This is the CANDIDATE PROFILE PAGE where recruiters:
 * 1. View detailed candidate information
 * 2. See skills assessment and culture fit
 * 3. Contact or save candidates
 * 
 * API ENDPOINTS NEEDED:
 * 
 * 1. GET /api/candidate/{candidateId}
 *    - Purpose: Fetch complete candidate profile
 *    - Location: Line 95 (loadCandidateProfile function)
 *    - Response: Full candidate object with all details
 * 
 * 2. POST /api/candidate/{candidateId}/contact
 *    - Purpose: Send email to candidate
 *    - Location: Line 130 (handleSendEmail function)
 *    - Request: { message: string, recruiterId: string }
 * 
 * 3. POST /api/candidate/{candidateId}/save
 *    - Purpose: Save candidate to talent pool
 *    - Location: Line 140 (handleSaveToPool function)
 *    - Request: { recruiterId: string, poolId: string }
 * 
 * 4. POST /api/candidate/{candidateId}/share-analysis
 *    - Purpose: Share coding analysis with dev team
 *    - Location: Line 150 (handleShareWithDevTeam function)
 *    - Request: { analysis: object, recipients: array }
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Globe, Linkedin, Github, Mail, Star, 
  CheckCircle, AlertCircle, User, Briefcase, GraduationCap,
  Award, Calendar, MapPin, Building, FileText, UserPlus,
  MessageSquare, Download, ChevronRight, X, Send, Code
} from 'lucide-react';

const CandidateProfilePage = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  
  // State for candidate data
  const [candidate, setCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  
  // Modal states
  const [showPoolModal, setShowPoolModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showDevTeamModal, setShowDevTeamModal] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  
  // Get basic candidate info passed from search page
  const location = useLocation();
  const passedCandidate = location.state?.candidate;
  
  // Load full candidate profile and AI analysis
  useEffect(() => {
    loadCandidateProfile();
  }, [candidateId]);
  
  const loadCandidateProfile = async () => {
    setIsLoading(true);
    
    try {
      // ===== BACKEND TEAM: IMPLEMENT THESE API CALLS =====
      
      // 1. Fetch full candidate profile
      // const profileResponse = await fetch(`/api/candidate/${candidateId}/full-profile`, {
      //   method: 'GET',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${authToken}`
      //   }
      // });
      // const profileData = await profileResponse.json();
      
      // 2. Fetch AI job match analysis
      // const matchResponse = await fetch(`/api/candidate/${candidateId}/match-analysis`, {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${authToken}`
      //   },
      //   body: JSON.stringify({
      //     candidateId: candidateId,
      //     jobId: 'current-job-id', // Pass the job they're being evaluated for
      //     recruiterId: 'recruiter-id'
      //   })
      // });
      // const matchData = await matchResponse.json();
      
      // 3. Fetch AI coding analysis
      // const codingResponse = await fetch(`/api/candidate/${candidateId}/coding-analysis`, {
      //   method: 'GET',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${authToken}`
      //   }
      // });
      // const codingData = await codingResponse.json();
      
      // Combine all data
      // const completeProfile = {
      //   ...profileData,
      //   matchAnalysis: matchData,
      //   codingAnalysis: codingData
      // };
      // setCandidate(completeProfile);
      
      // ===== MOCK DATA FOR DEMO - REMOVE WHEN API IS READY =====
      // Using passed candidate info to make it match search results
      setTimeout(() => {
        const mockCandidate = {
          id: candidateId,
          name: passedCandidate?.name || 'Don Nuemann',
          role: passedCandidate?.role || 'AI/ML Specialist',
          location: passedCandidate?.location || 'San Francisco, CA',
          email: `${(passedCandidate?.name || 'don.nuemann').toLowerCase().replace(' ', '.')}@email.com`,
          linkedin: `linkedin.com/in/${(passedCandidate?.name || 'donnuemann').toLowerCase().replace(' ', '')}`,
          github: `github.com/${(passedCandidate?.name || 'dnuemann').toLowerCase().replace(' ', '')}`,
          
          // Match analysis from AI
          summary: `${passedCandidate?.name || "Don"}'s profile shows high potential for the ML Engineer role with recent PyTorch and TensorFlow work, ${passedCandidate?.experience || 5} years of ML experience, and proven MLOps expertise, alongside a strong record in agile collaboration and deploying production-ready models.`,
          matchCategory: passedCandidate?.category || 'Top Match',
          matchScore: passedCandidate?.category === 'Great' ? 92 : passedCandidate?.category === 'Good' ? 78 : 65,
          
          // Key strengths (would come from AI analysis)
          strengths: [
            'Deep PyTorch expertise with 5+ production deployments',
            'Published 3 papers in top-tier NLP conferences',
            'Led team of 8 engineers at previous role',
            'Strong open-source contributions (2.5k GitHub stars)'
          ],
          
          // Gaps to consider (would come from AI analysis)
          gaps: [
            'Limited experience with our specific MLOps stack',
            'No direct experience in fintech domain',
            'Prefers 80% remote (role is 60% remote)'
          ],
          
          // Technical skills (from profile + AI scoring)
          skills: {
            'Python': 95,
            'ML Theory': 85,
            'Production': 75,
            'Leadership': 70,
            'Communication': 80,
            'Innovation': 90
          },
          
          // Experience breakdown
          experience: {
            directly_relevant: 4,
            adjacent_skills: 2, 
            other: 1,
            total: passedCandidate?.experience || 7,
            required: 5
          },
          
          // Culture fit analysis from AI
          cultureNotes: `${passedCandidate?.name?.split(' ')[0] || "Don"} is a high energy person who enjoys working in-person in a chill setting`,
          workStyle: {
            collaboration: 'Highly collaborative',
            pace: 'Fast-paced',
            environment: 'In-person preferred',
            communication: 'Direct and transparent'
          },
          
          // Education & Certifications
          education: [
            {
              degree: passedCandidate?.education || 'PhD from MIT',
              field: 'Machine Learning',
              year: '2018'
            }
          ],
          
          certifications: passedCandidate?.certifications || [
            'NLP Specialist',
            'TensorFlow Developer Certified',
            'AWS ML Specialty'
          ],
          
          // Tags
          tags: ['PhD from MIT', 'NLP Specialist', 'FinTech', `${passedCandidate?.experience || '5'}+ years industry`],
          
          // AI Coding analysis (would come from GitHub/code sample analysis)
          codingAnalysis: {
            codeClarity: 92,
            documentationQuality: 88,
            testCoverage: 85,
            performanceOptimization: 90,
            patterns: [
              'Consistently uses functional programming patterns',
              'Excellent error handling and logging practices',
              'Strong preference for type hints and docstrings',
              'Implements comprehensive unit tests'
            ],
            techStack: passedCandidate?.skills || ['Python', 'PyTorch', 'Docker', 'PostgreSQL', 'Redis'],
            commitFrequency: 'Daily commits with clear messages',
            codeReviewStats: '95% approval rate on PRs'
          },
          
          // Resume text (would come from parsed resume)
          resumeText: `${(passedCandidate?.name || 'DON NUEMANN').toUpperCase()}
${passedCandidate?.role || 'AI/ML Specialist'}

CONTACT
Email: ${(passedCandidate?.name || 'don.nuemann').toLowerCase().replace(' ', '.')}@email.com
LinkedIn: linkedin.com/in/${(passedCandidate?.name || 'donnuemann').toLowerCase().replace(' ', '')}
GitHub: github.com/${(passedCandidate?.name || 'dnuemann').toLowerCase().replace(' ', '')}
Location: ${passedCandidate?.location || 'San Francisco, CA'}

EDUCATION
${passedCandidate?.education || 'PhD in Machine Learning - MIT (2018)'}
BS in Computer Science - Stanford University (2014)

EXPERIENCE

Senior ML Engineer | Current Company | 2020 - Present
• Led development of NLP pipeline processing 1M+ documents daily
• Reduced model inference time by 60% through optimization
• Mentored 5 junior engineers on ML best practices
• Published 2 papers on transformer architectures

ML Engineer | Previous Company | 2018 - 2020  
• Built recommendation system serving 10M+ users
• Implemented A/B testing framework for model evaluation
• Achieved 30% improvement in prediction accuracy

SKILLS
Languages: Python, SQL, JavaScript
ML/AI: ${passedCandidate?.skills?.join(', ') || 'PyTorch, TensorFlow, Scikit-learn, JAX'}
Tools: Docker, Kubernetes, Git, AWS

PUBLICATIONS
• "Efficient Transformers for Production Systems" - NeurIPS 2022
• "Scalable NLP Pipelines" - ICML 2021
• "Multi-task Learning in Practice" - ACL 2020

CERTIFICATIONS
${passedCandidate?.certifications?.join('\n') || '• TensorFlow Developer Certified\n• AWS ML Specialty\n• NLP Specialist'}`
        };
        
        setCandidate(mockCandidate);
        
        // Prepare default email content
        setEmailContent(
          `Dear ${mockCandidate.name},\n\n` +
          `I came across your profile and was impressed by your experience in machine learning and AI. ` +
          `We have an exciting ML Engineer opportunity at our company that aligns perfectly with your background.\n\n` +
          `The role involves working on cutting-edge AI projects with a talented team. ` +
          `Your experience with PyTorch and production ML systems would be invaluable.\n\n` +
          `Would you be interested in discussing this opportunity further? ` +
          `I'd love to schedule a brief call at your convenience.\n\n` +
          `Best regards,\n[Your Name]\n[Your Title]\n[Company Name]`
        );
        
        setIsLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Failed to load candidate:', error);
      setIsLoading(false);
      // TODO: Show error message to user
    }
  };
  
  const handleSaveToPool = () => {
    // TODO: API call to save candidate
    setIsSaved(true);
    setShowPoolModal(true);
    setTimeout(() => setShowPoolModal(false), 2000);
  };
  
  const handleSendEmail = () => {
    // TODO: API call to send email
    console.log('Sending email:', emailContent);
    setShowContactModal(false);
    alert('Email sent successfully!');
  };
  
  const handleShareWithDevTeam = () => {
    setShowDevTeamModal(true);
  };
  
  const handleSendToDevTeam = () => {
    // TODO: API call to share analysis
    console.log('Sharing analysis with dev team');
    setShowDevTeamModal(false);
    alert('Analysis shared with dev team!');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Candidate not found</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 hover:text-indigo-700">
            Go back
          </button>
        </div>
      </div>
    );
  }
  
  // Create radar chart points for skills
  const createRadarPoints = (skills) => {
    const centerX = 150;
    const centerY = 120;
    const radius = 80;
    const skillKeys = Object.keys(skills);
    const angleStep = (2 * Math.PI) / skillKeys.length;
    
    return skillKeys.map((skill, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const value = skills[skill] / 100;
      const x = centerX + radius * value * Math.cos(angle);
      const y = centerY + radius * value * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };
  
  const requiredSkillsPoints = createRadarPoints({
    'Python': 80,
    'ML Theory': 80,
    'Production': 85,
    'Leadership': 60,
    'Communication': 75,
    'Innovation': 70
  });
  
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
      
      {/* Page Title with Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/search')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Viewing: <span className="font-bold">{candidate.name}</span> for ML Engineer
            </h1>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-4">
              <div className="h-20 w-20 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-gray-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
                <p className="text-gray-600">{candidate.role}</p>
                <div className="flex items-center space-x-4 mt-3">
                  <button className="flex items-center text-gray-500 hover:text-gray-700">
                    <Globe className="h-4 w-4" />
                  </button>
                  <button className="flex items-center text-gray-500 hover:text-gray-700">
                    <Linkedin className="h-4 w-4" />
                  </button>
                  <button className="flex items-center text-gray-500 hover:text-gray-700">
                    <Github className="h-4 w-4" />
                  </button>
                  <button className="flex items-center text-gray-500 hover:text-gray-700">
                    <Mail className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button className="px-6 py-2.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors">
                Top Match
              </button>
            </div>
          </div>
        </div>
        
        {/* Overview Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Overview</h3>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {candidate.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            
            {/* Summary */}
            <p className="text-gray-700 mb-6">
              {candidate.summary}
            </p>
            
            {/* Strengths and Gaps Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Key Strengths */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="flex items-center text-green-800 font-semibold mb-3">
                  <Star className="h-5 w-5 mr-2" />
                  Key Strengths
                </h4>
                <ul className="space-y-2">
                  {candidate.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Gaps to Consider */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="flex items-center text-yellow-800 font-semibold mb-3">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Gaps to Consider
                </h4>
                <ul className="space-y-2">
                  {candidate.gaps.map((gap, idx) => (
                    <li key={idx} className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowContactModal(true)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact
              </button>
              <button 
                onClick={() => setShowResumeModal(true)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Resume
              </button>
              <button 
                onClick={handleSaveToPool}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isSaved 
                    ? 'bg-gray-600 text-white hover:bg-gray-700' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isSaved ? 'Saved to Pool' : 'Save to Pool'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Skills and Culture Fit Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Technical Skills */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Technical Skills</h3>
            
            {/* Radar Chart */}
            <div className="flex justify-center mb-4">
              <svg width="300" height="240" className="overflow-visible">
                {/* Grid circles */}
                {[20, 40, 60, 80, 100].map(level => (
                  <circle
                    key={level}
                    cx="150"
                    cy="120"
                    r={(level / 100) * 80}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Spokes */}
                {Object.keys(candidate.skills).map((skill, i) => {
                  const angle = (i * 2 * Math.PI) / Object.keys(candidate.skills).length - Math.PI / 2;
                  const x2 = 150 + 80 * Math.cos(angle);
                  const y2 = 120 + 80 * Math.sin(angle);
                  const labelX = 150 + 100 * Math.cos(angle);
                  const labelY = 120 + 100 * Math.sin(angle);
                  
                  return (
                    <g key={skill}>
                      <line
                        x1="150"
                        y1="120"
                        x2={x2}
                        y2={y2}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        className="text-xs fill-gray-600"
                        dominantBaseline="middle"
                      >
                        {skill}
                      </text>
                    </g>
                  );
                })}
                
                {/* Required area */}
                <polygon
                  points={requiredSkillsPoints}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                
                {/* Candidate area */}
                <polygon
                  points={createRadarPoints(candidate.skills)}
                  fill="rgba(34, 197, 94, 0.2)"
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="2"
                />
              </svg>
            </div>
            
            {/* Legend */}
            <div className="flex justify-center space-x-6">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Candidate</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-indigo-600 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Required</span>
              </div>
            </div>
          </div>
          
          {/* Culture Fit */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Culture Fit</h3>
            
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 text-center">
              <p className="text-lg text-gray-800 mb-4">
                {candidate.cultureNotes}
              </p>
              
              {/* Icon illustration */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <UserPlus className="h-20 w-20 text-indigo-600" />
                </div>
              </div>
              
              {/* Work style details */}
              <div className="space-y-2 text-left">
                {Object.entries(candidate.workStyle).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                    <span className="text-gray-800 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Relevant Experience */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Relevant Experience</h3>
          
          <div className="space-y-4">
            {/* Experience bars */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 w-32">Directly Relevant</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(candidate.experience.directly_relevant / candidate.experience.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 w-20 text-right">
                  {candidate.experience.directly_relevant} years
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 w-32">Adjacent Skills</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(candidate.experience.adjacent_skills / candidate.experience.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 w-20 text-right">
                  {candidate.experience.adjacent_skills} years
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 w-32">Other Experience</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-400 h-2 rounded-full" 
                      style={{ width: `${(candidate.experience.other / candidate.experience.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 w-20 text-right">
                  {candidate.experience.other} year
                </span>
              </div>
            </div>
            
            {/* Total experience summary */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Total Experience</span>
                <span className="text-sm font-bold text-gray-900">
                  {candidate.experience.total} years ({candidate.experience.required} required)
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Coding Analysis Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Code className="h-5 w-5 mr-2 text-indigo-600" />
                AI Coding Analysis
              </h3>
              <p className="text-sm text-gray-600 mt-1">Based on GitHub contributions and code samples</p>
            </div>
            <button 
              onClick={handleShareWithDevTeam}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Share with Dev Team
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Coding Style Metrics */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Coding Style Metrics</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Code Clarity</span>
                    <span className="text-gray-800 font-medium">{candidate.codingAnalysis.codeClarity}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${candidate.codingAnalysis.codeClarity}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Documentation Quality</span>
                    <span className="text-gray-800 font-medium">{candidate.codingAnalysis.documentationQuality}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${candidate.codingAnalysis.documentationQuality}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Test Coverage</span>
                    <span className="text-gray-800 font-medium">{candidate.codingAnalysis.testCoverage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${candidate.codingAnalysis.testCoverage}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Performance Optimization</span>
                    <span className="text-gray-800 font-medium">{candidate.codingAnalysis.performanceOptimization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${candidate.codingAnalysis.performanceOptimization}%` }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Commit Frequency:</span> {candidate.codingAnalysis.commitFrequency}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Code Review Stats:</span> {candidate.codingAnalysis.codeReviewStats}
                </p>
              </div>
            </div>
            
            {/* Coding Patterns & Practices */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Coding Patterns & Practices</h4>
              <ul className="space-y-2 mb-4">
                {candidate.codingAnalysis.patterns.map((pattern, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{pattern}</span>
                  </li>
                ))}
              </ul>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">Primary Tech Stack:</p>
                <div className="flex flex-wrap gap-1">
                  {candidate.codingAnalysis.techStack.map((tech, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white border border-gray-300 text-xs text-gray-700 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      
      {/* Pool Success Modal */}
      {showPoolModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <p className="text-center text-gray-800 font-medium">
              Candidate added to your company's talent pool!
            </p>
          </div>
        </div>
      )}
      
      {/* Contact Email Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Contact Candidate</h3>
                <button onClick={() => setShowContactModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
                  <input 
                    type="text" 
                    value={candidate.email} 
                    disabled 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                  <input 
                    type="text" 
                    defaultValue="Exciting ML Engineer Opportunity" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
                  <textarea 
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    rows="12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendEmail}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Resume Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Resume</h3>
                <button onClick={() => setShowResumeModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                  {candidate.resumeText}
                </pre>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => setShowResumeModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Dev Team Share Modal */}
      {showDevTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Share Analysis with Dev Team</h3>
                <button onClick={() => setShowDevTeamModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Send the AI coding analysis to your development team for technical review.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipients:</label>
                  <input 
                    type="text" 
                    defaultValue="dev-team@company.com" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Add a note:</label>
                  <textarea 
                    defaultValue="Please review this candidate's coding analysis and provide your technical assessment."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Analysis includes:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Code clarity and documentation metrics</li>
                    <li>• Test coverage and performance stats</li>
                    <li>• Coding patterns and practices</li>
                    <li>• GitHub activity analysis</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => setShowDevTeamModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendToDevTeam}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send to Dev Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateProfilePage;