import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { useInterview } from '../hook/useInterview'
import '../style/interview.scss'

const Interview = () => {
  const navigate = useNavigate()
  const { report, loading } = useInterview()
  
  const interviewReport = report

  const [activeTab, setActiveTab] = useState('technical')
  const [expandedQuestion, setExpandedQuestion] = useState(0)
  const [selectedSkillFilter, setSelectedSkillFilter] = useState(null)

  const jobTitle = interviewReport?.title
  const technicalQuestions = interviewReport?.technicalQuestions || []
  const behavioralQuestions = interviewReport?.behavioralQuestions || []
  const skillGaps = interviewReport?.skillGaps || []
  const preprationPlan = interviewReport?.preprationPlan || []
  const matchScore = interviewReport?.matchScore ?? 0

  const toggleQuestion = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index)
  }

  // Filter technical questions when a skill gap pill is clicked
  const filteredTechQuestions = selectedSkillFilter
    ? technicalQuestions.filter(q => 
        q.question?.toLowerCase().includes(selectedSkillFilter.toLowerCase()) ||
        q.intention?.toLowerCase().includes(selectedSkillFilter.toLowerCase())
      )
    : technicalQuestions

  if (loading) {
    return (
      <main className="interview-page empty-state">
        <header className="interview-navbar">
          <div className="nav-left">
            <button className="back-btn" onClick={() => navigate('/')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Planner
            </button>
            <div className="title-wrapper">
              <h1>Interview Preparation Report</h1>
            </div>
          </div>
        </header>

        <div className="empty-content-box">
          <h2>Analyzing Profile & Generating Report...</h2>
          <p>Our AI is processing your job description and resume to create your custom strategy.</p>
        </div>
      </main>
    )
  }

  if (!interviewReport) {
    return (
      <main className="interview-page empty-state">
        <header className="interview-navbar">
          <div className="nav-left">
            <button className="back-btn" onClick={() => navigate('/')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Planner
            </button>
            <div className="title-wrapper">
              <h1>Interview Preparation Report</h1>
            </div>
          </div>
        </header>

        <div className="empty-content-box">
          <h2>No Report Loaded</h2>
          <p>Please submit your target job description and profile on the Home page to view your interview report.</p>
          <button className="generate-now-btn" onClick={() => navigate('/')}>
            Go to Home
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="interview-page">
      {/* Top Navbar */}
      <header className="interview-navbar">
        <div className="nav-left">
          <div className="logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer', marginBottom: 0 }}>
            <div className="logo-icon sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="logo-text sm">Career<span className="highlight">Pilot</span></span>
          </div>

          <button className="back-btn" onClick={() => navigate('/')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Planner
          </button>

          <div className="title-wrapper">
            <h1>Interview Preparation Report</h1>
            {jobTitle && (
              <span className="job-tag">
                {jobTitle}
              </span>
            )}
          </div>
        </div>
        <div className="nav-right">
          <div className="match-score-badge">
            <span className="score-label">Match Score</span>
            <span className="score-val">{matchScore}%</span>
          </div>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <div className="interview-layout">
        {/* Left Column: Navigation Sidebar */}
        <aside className="sidebar-nav">
          <div className="nav-group">
            <div className="nav-header">Navigation</div>
            
            <button 
              className={`nav-item ${activeTab === 'technical' ? 'active' : ''}`}
              onClick={() => setActiveTab('technical')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
              </span>
              <span className="nav-label">Technical questions</span>
              <span className="count-pill">{technicalQuestions.length}</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'behavioral' ? 'active' : ''}`}
              onClick={() => setActiveTab('behavioral')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </span>
              <span className="nav-label">Behavioral questions</span>
              <span className="count-pill">{behavioralQuestions.length}</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'roadmap' ? 'active' : ''}`}
              onClick={() => setActiveTab('roadmap')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </span>
              <span className="nav-label">Road Map</span>
              <span className="count-pill">{preprationPlan.length}</span>
            </button>
          </div>
        </aside>

        {/* Center Column: Main Content Panel */}
        <section className="main-content-panel">
          {activeTab === 'technical' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Technical Questions</h2>
                {selectedSkillFilter && (
                  <button className="clear-filter-btn" onClick={() => setSelectedSkillFilter(null)}>
                    Filtered by: <strong>{selectedSkillFilter}</strong> ✕
                  </button>
                )}
              </div>

              <div className="questions-list">
                {filteredTechQuestions.length === 0 ? (
                  <p className="no-items-text">No technical questions available.</p>
                ) : (
                  filteredTechQuestions.map((q, idx) => (
                    <div 
                      key={idx} 
                      className={`question-card ${expandedQuestion === idx ? 'expanded' : ''}`}
                    >
                      <div className="question-card-header" onClick={() => toggleQuestion(idx)}>
                        <h3 className="q-title">{q.question}</h3>
                        <span className="expand-icon">{expandedQuestion === idx ? '−' : '+'}</span>
                      </div>

                      {expandedQuestion === idx && (
                        <div className="question-card-body">
                          {q.intention && (
                            <div className="intention-box">
                              <strong>Interviewer Intention:</strong> {q.intention}
                            </div>
                          )}
                          <div className="answer-section">
                            <h4>Suggested Answer</h4>
                            <p>{q.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'behavioral' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Behavioral Questions</h2>
              </div>

              <div className="questions-list">
                {behavioralQuestions.length === 0 ? (
                  <p className="no-items-text">No behavioral questions available.</p>
                ) : (
                  behavioralQuestions.map((q, idx) => (
                    <div key={idx} className="question-card expanded">
                      <div className="question-card-header">
                        <h3 className="q-title">{q.question}</h3>
                      </div>
                      <div className="question-card-body">
                        {q.intention && (
                          <div className="intention-box">
                            <strong>Interviewer Intention:</strong> {q.intention}
                          </div>
                        )}
                        <div className="answer-section">
                          <h4>Sample Answer</h4>
                          <p>{q.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Preparation Roadmap</h2>
              </div>

              <div className="roadmap-timeline">
                {preprationPlan.length === 0 ? (
                  <p className="no-items-text">No preparation plan available.</p>
                ) : (
                  preprationPlan.map((plan, idx) => (
                    <div key={idx} className="roadmap-step-card">
                      <div className="step-badge">Day {plan.day}</div>
                      <h3>{plan.focus}</h3>
                      {plan.tasks && plan.tasks.length > 0 && (
                        <ul className="task-list">
                          {plan.tasks.map((task, tIdx) => (
                            <li key={tIdx}>{task}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Skill Gaps & Match Score Sidebar */}
        <aside className="skill-gaps-sidebar">
          {/* Circular Match Score Widget */}
          <div className="match-score-card">
            <div className="score-circle-wrapper">
              <svg width="110" height="110" viewBox="0 0 110 110">
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff2a70" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                </defs>
                <circle
                  cx="55"
                  cy="55"
                  r="44"
                  className="circle-bg"
                />
                <circle
                  cx="55"
                  cy="55"
                  r="44"
                  className="circle-progress"
                  style={{
                    strokeDasharray: 2 * Math.PI * 44,
                    strokeDashoffset: 2 * Math.PI * 44 * (1 - matchScore / 100)
                  }}
                />
              </svg>
              <div className="score-circle-text">
                <span className="score-val-big">{matchScore}%</span>
                <span className="score-lbl">Match</span>
              </div>
            </div>
            <div className="match-score-info">
              <h4>Job Match Score</h4>
              <p>Based on AI analysis of your profile vs requirements.</p>
            </div>
          </div>

          <div className="sidebar-header">
            <h3>Skill Gaps</h3>
          </div>

          <div className="skills-pill-container">
            {skillGaps.length === 0 ? (
              <p className="no-items-text">No skill gaps identified.</p>
            ) : (
              skillGaps.map((item, idx) => (
                <button 
                  key={idx}
                  className={`skill-pill ${selectedSkillFilter === item.skill ? 'active' : ''}`}
                  onClick={() => setSelectedSkillFilter(selectedSkillFilter === item.skill ? null : item.skill)}
                >
                  {item.skill}
                  {item.severity && <span className={`severity-dot ${item.severity}`}></span>}
                </button>
              ))
            )}
          </div>

          {skillGaps.length > 0 && (
            <div className="gaps-summary-box">
              <div className="summary-title">Identified Gaps</div>
              <p>Targeting these <strong>{skillGaps.length} skill gaps</strong> will improve your interview readiness score.</p>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}

export default Interview
