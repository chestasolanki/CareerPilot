import React, { useState, useRef, useEffect } from 'react'
import "../style/home.scss"
import { useNavigate } from 'react-router'
import { useInterview } from '../hook/useInterview'

const Home = () => {
  const { loading, generateReport, reports, getAllReports, getReportById } = useInterview()
  const [jobDescription, setJobDescription] = useState("")
  const [selfDescription, setSelfDescription] = useState("")
  const resumeInputRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    getAllReports()
  }, [])

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current?.files?.[0]
    const data = await generateReport({ jobDescription, selfDescription, resumeFile })
    if (data?._id) {
      navigate(`/interview/${data._id}`)
    }
  }

  const handleSelectReport = async (id) => {
    await getReportById(id)
    navigate(`/interview/${id}`)
  }

  return (
    <main className='home'>
      {/* App Logo */}
      <nav className="main-nav">
        <div className="logo-container">
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="logo-text">Career<span className="highlight">Pilot</span></span>
        </div>
      </nav>

      {/* Header */}
      <header className="home-header">
        <h1>Create Your Custom <span className="highlight">Interview Plan</span></h1>
        <p className="subtitle">Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
      </header>

      {/* Main Card */}
      <div className="interview-card">
        <div className="card-body">
          {/* Left Column: Target Job Description */}
          <div className="column left-col">
            <div className="column-title">
              <span className="icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </span>
              <h2>Target Job Description</h2>
              <span className="badge-required">Required</span>
            </div>

            <div className="textarea-container">
              <textarea 
              onChange={(e)=>{
                setJobDescription(e.target.value)
              }}
                name="jobDescription" 
                id="jobDescription"
                placeholder="Paste the full job description here...&#10;e.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'"
              ></textarea>
            </div>
          </div>

          {/* Right Column: Your Profile */}
          <div className="column right-col">
            <div className="column-title">
              <span className="icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <h2>Your Profile</h2>
            </div>

            {/* Upload Resume Section */}
            <div className="upload-section">
              <div className="section-label">
                Upload Resume <span className="badge-tag">(Best Results)</span>
              </div>

              <label className="dropzone-box" htmlFor="resume">
                <div className="cloud-icon-circle">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <p className="dropzone-title">Click to upload or drag & drop</p>
                <p className="dropzone-subtitle">PDF or DOCX (Max 5MB)</p>
                <input 
                ref={resumeInputRef}
                  type='file' 
                  name='resume' 
                  id='resume' 
                  accept='.pdf,.doc,.docx'
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Quick Self Description */}
            <div className="self-desc-section">
              <h3>Quick Self-Description</h3>
              <textarea 
              onChange={(e)=>{
                setSelfDescription(e.target.value)
              }}
                name="selfDescription" 
                id="selfDescription"
                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
              ></textarea>
            </div>

            {/* Info Banner */}
            <div className="info-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</span>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="card-footer">
          <span className="footer-info">AI-Powered Strategy Generation • Approx 30s</span>
          <button onClick={handleGenerateReport} className="generate-btn" disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"></path>
            </svg>
            {loading ? 'Generating Strategy...' : 'Generate My Interview Strategy'}
          </button>
        </div>
      </div>

      {/* Recent Reports Footer */}
      <footer className="page-footer recent-reports-footer">
        <div className="recent-reports-container">
          <h3>Recent Reports</h3>
          {reports && reports.length > 0 ? (
            <div className="recent-reports-grid">
              {reports.map((item) => (
                <div 
                  key={item._id} 
                  className="recent-report-card"
                  onClick={() => handleSelectReport(item._id)}
                >
                  <div className="report-card-header">
                    <span className="report-title">{item.title || 'Interview Strategy'}</span>
                  </div>
                  <div className="report-card-date">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-reports-msg">No recent reports found. Generate your first strategy above!</p>
          )}
        </div>
      </footer>
    </main>
  )
}

export default Home
