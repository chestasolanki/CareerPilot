import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import '../landing.scss'

const Landing = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        }
      })
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.15
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)
    const elements = document.querySelectorAll('.slide-on-scroll')
    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  const handleGetStarted = () => {
    if (user) {
      navigate('/planner')
    } else {
      navigate('/register')
    }
  }

  const handleLoginClick = () => {
    if (user) {
      navigate('/planner')
    } else {
      navigate('/login')
    }
  }

  const handleProtectedTabClick = () => {
    if (user) {
      navigate('/planner')
    } else {
      navigate('/login')
    }
  }

  const scrollToFeatures = () => {
    const featuresElement = document.getElementById('features')
    if (featuresElement) {
      featuresElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const scrollToHowItWorks = () => {
    const howElement = document.getElementById('how-it-works')
    if (howElement) {
      howElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="landing-page">
      {/* Top Navigation */}
      <header className="landing-header-nav">
        <div className="nav-brand-group" onClick={() => navigate('/')}>
          <div className="brand-logo-icon">
            <span className="dot-fill"></span>
            <span className="dot-ring"></span>
          </div>
          <span className="brand-name-title">CareerPilot</span>
        </div>

        <nav className="nav-center-menu">
          <span className="nav-menu-link" onClick={scrollToFeatures}>FEATURES</span>
          <span className="nav-menu-link" onClick={scrollToHowItWorks}>HOW IT WORKS</span>
          <span className="nav-menu-link" onClick={handleProtectedTabClick}>ROADMAP</span>
          <span className="nav-menu-link" onClick={handleProtectedTabClick}>EVALUATION</span>
        </nav>

        <div className="nav-right-actions">
          <button className="nav-get-started-btn" onClick={handleGetStarted}>
            {user ? 'DASHBOARD' : 'GET STARTED'} →
          </button>
        </div>
      </header>

      {/* Editorial Hero Headline Section */}
      <section className="editorial-hero-section">
        <h1 className="hero-main-headline">
          YOUR CAREER.<br />
          <span className="purple-serif-gradient">YOUR NEXT MOVE.</span>
        </h1>

        <p className="hero-sub-description">
          Personalized AI preparation to bridge your skill gaps and land your dream role.
        </p>

        {/* Plan - Practice - Progress Pillars */}
        <div className="hero-pillars-row">
          <span className="pillar-badge">Plan</span>
          <span className="pillar-dot">•</span>
          <span className="pillar-badge highlighted">Practice</span>
          <span className="pillar-dot">•</span>
          <span className="pillar-badge">Progress</span>
        </div>

        <button className="hero-center-action-btn" onClick={handleGetStarted}>
          Get Started →
        </button>

        {/* Scroll down hint */}
        <div className="scroll-down-hint" onClick={scrollToFeatures}>
          <span className="scroll-text">Scroll to explore</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* 3-Card Showcase Grid (Shifted down, reveals on scroll) */}
      <section className="hero-cards-showcase-grid slide-on-scroll">
        {/* Card 01: Analyze Profile */}
        <div className="showcase-card card-01-profile">
          <div className="card-number-line">01 ————</div>
          <h3 className="card-heading-serif">
            ANALYZE YOUR<br />PROFILE
          </h3>
          <p className="card-description-text">
            Instant profile & skill match.
          </p>
        </div>

        {/* Card 02: Center Spotlight Laptop View */}
        <div className="showcase-card card-02-center">
          <div className="center-card-badge">
            <span className="badge-text">STRATEGY ENGINE</span>
          </div>

          <div className="laptop-preview-frame">
            <h4 className="laptop-screen-title">
              From Your Resume<br />to Your Dream Role.
            </h4>
            <div className="roadmap-step-dots">
              <span className="step-dot active-step">● Learn</span>
              <span className="step-arrow">→</span>
              <span className="step-dot active-step">● Practice</span>
              <span className="step-arrow">→</span>
              <span className="step-dot">● Get Hired</span>
            </div>
          </div>

          <div className="center-card-footer">
            <span className="footer-sub-label">Better Skills, Brighter Opportunities</span>
          </div>
        </div>

        {/* Card 03: Practice With AI */}
        <div className="showcase-card card-03-practice">
          <div className="card-number-line">03 ————</div>
          <h3 className="card-heading-serif">
            PRACTICE<br />WITH AI
          </h3>
          <p className="card-description-text">
            Real questions with AI scoring.
          </p>
          <div className="practice-bullet-list">
            <span className="bullet-item">• Technical Questions</span>
            <span className="bullet-item">• STAR Behavioral Scenarios</span>
            <span className="bullet-item">• Instant Scoring</span>
          </div>
        </div>
      </section>

      {/* Features capabilities section */}
      <section className="features-info-section" id="features">
        <div className="features-container">
          <div className="section-header slide-on-scroll">
            <span className="section-badge">PLATFORM CAPABILITIES</span>
            <h2>Core Features & Functions</h2>
            <p className="section-subtext">Everything you need to analyze job requirements and prepare for your interview.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card slide-on-scroll" style={{ transitionDelay: '0.1s' }}>
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <h3>Job Description & Profile Analysis</h3>
              <p>Compares target role requirements against your resume.</p>
            </div>

            <div className="feature-card slide-on-scroll" style={{ transitionDelay: '0.2s' }}>
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                  <path d="M2 12h20"></path>
                </svg>
              </div>
              <h3>Semantic Match & Skill Gap Detection</h3>
              <p>Calculates match percentage and highlights missing skills.</p>
            </div>

            <div className="feature-card slide-on-scroll" style={{ transitionDelay: '0.3s' }}>
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3>Technical & STAR Behavioral Questions</h3>
              <p>Generates targeted technical and behavioral scenarios.</p>
            </div>

            <div className="feature-card slide-on-scroll" style={{ transitionDelay: '0.4s' }}>
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <h3>Actionable Preparation Roadmap</h3>
              <p>Structured day-by-day plan leading to interview day.</p>
            </div>

            <div className="feature-card slide-on-scroll" id="mock-answer-evaluator" style={{ transitionDelay: '0.5s' }}>
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
              </div>
              <h3>Mock Answer Evaluator</h3>
              <p>Practice responses with real-time AI scoring & feedback.</p>
            </div>
          </div>

          <div className="features-cta-bottom slide-on-scroll" style={{ transitionDelay: '0.6s' }}>
            <button className="get-started-cta-btn" onClick={handleGetStarted}>
              Get Started Now →
            </button>
          </div>
        </div>
      </section>

      {/* Dedicated How It Works Section */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="how-container">
          <div className="section-header slide-on-scroll">
            <span className="section-badge">HOW IT WORKS</span>
            <h2>FOUR SIMPLE STEPS TO CAREER SUCCESS</h2>
            <p className="section-subtext">A simple, effective process designed to take you from job search to offer accepted.</p>
          </div>

          <div className="steps-arrow-flow-container">
            {/* Step 01 */}
            <div className="step-arrow-card slide-on-scroll" style={{ transitionDelay: '0.1s' }}>
              <div className="step-top-row">
                <span className="step-number-tag">01</span>
                <div className="connector-arrow-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                    <polyline points="14 6 20 12 14 18"></polyline>
                  </svg>
                </div>
              </div>
              <h3>Upload Job & Resume</h3>
              <p>Input target job description and your resume.</p>
            </div>

            {/* Step 02 */}
            <div className="step-arrow-card slide-on-scroll" style={{ transitionDelay: '0.2s' }}>
              <div className="step-top-row">
                <span className="step-number-tag">02</span>
                <div className="connector-arrow-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                    <polyline points="14 6 20 12 14 18"></polyline>
                  </svg>
                </div>
              </div>
              <h3>Discover Skill Gaps</h3>
              <p>Get match percentage and missing skill list.</p>
            </div>

            {/* Step 03 */}
            <div className="step-arrow-card slide-on-scroll" style={{ transitionDelay: '0.3s' }}>
              <div className="step-top-row">
                <span className="step-number-tag">03</span>
                <div className="connector-arrow-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                    <polyline points="14 6 20 12 14 18"></polyline>
                  </svg>
                </div>
              </div>
              <h3>Follow Customized Plan</h3>
              <p>Access your personalized day-by-day roadmap.</p>
            </div>

            {/* Step 04 */}
            <div className="step-arrow-card is-last-step slide-on-scroll" style={{ transitionDelay: '0.4s' }}>
              <div className="step-top-row">
                <span className="step-number-tag">04</span>
                <div className="connector-arrow-badge finish-check-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
              <h3>Practice Mock Interviews</h3>
              <p>Answer AI questions and refine your responses.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing
