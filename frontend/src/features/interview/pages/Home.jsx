import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import "../style/home.scss"

const Home = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [selfDescription, setSelfDescription] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleGenerateStrategy = async () => {
    setError(null)
    if (!jobDescription.trim()) {
      setError('Target Job Description is required.')
      return
    }

    if (!selectedFile && !selfDescription.trim()) {
      setError('Please upload a Resume or enter a Self Description.')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('jobDescription', jobDescription)
      formData.append('selfDescription', selfDescription)
      if (selectedFile) {
        formData.append('resume', selectedFile)
      }

      const response = await axios.post('/api/interview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      })

      if (response.data?.interviewReport) {
        navigate('/interview', {
          state: { interviewReport: response.data.interviewReport }
        })
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to generate interview report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='home'>
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
                name="jobDescription" 
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value.slice(0, 5000))}
                placeholder="Paste the full job description here...&#10;e.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'"
              ></textarea>
              <div className="char-count">{jobDescription.length} / 5000 chars</div>
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

              <label 
                className={`dropzone-box ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
                htmlFor="resume"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="cloud-icon-circle">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                {selectedFile ? (
                  <div className="file-info">
                    <p className="dropzone-title text-success">✓ File attached</p>
                    <p className="dropzone-filename">{selectedFile.name}</p>
                    <p className="dropzone-subtitle">Click or drop another file to replace</p>
                  </div>
                ) : (
                  <>
                    <p className="dropzone-title">Click to upload or drag & drop</p>
                    <p className="dropzone-subtitle">PDF or DOCX (Max 5MB)</p>
                  </>
                )}
                <input 
                  type='file' 
                  name='resume' 
                  id='resume' 
                  accept='.pdf,.doc,.docx'
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Quick Self Description */}
            <div className="self-desc-section">
              <h3>Quick Self-Description</h3>
              <textarea 
                name="selfDescription" 
                id="selfDescription"
                value={selfDescription}
                onChange={(e) => setSelfDescription(e.target.value)}
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

        {error && (
          <div style={{ color: '#ef4444', padding: '0 1.75rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Card Footer */}
        <div className="card-footer">
          <span className="footer-info">AI-Powered Strategy Generation • Approx 30s</span>
          <button 
            className="generate-btn"
            onClick={handleGenerateStrategy}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"></path>
            </svg>
            {loading ? 'Generating Strategy...' : 'Generate My Interview Strategy'}
          </button>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="page-footer">
        <a href="#privacy">Privacy Policy</a>
        <a href="#terms">Terms of Service</a>
        <a href="#help">Help Center</a>
      </footer>
    </main>
  )
}

export default Home

