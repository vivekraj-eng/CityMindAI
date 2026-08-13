import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  ArrowRight,
  Shield,
  Activity,
  MapPin,
  TrendingUp,
  Users,
  Radio,
  FileText,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  AlertTriangle,
  Building2,
  Send,
  Zap,
  Check,
  Cpu
} from 'lucide-react';

export default function Home() {
  // Animation presets
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  const containerDelay = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.15 }
  };

  return (
    <div className="landing-page">
      {/* Background Orbs */}
      <div className="bg-glow-orb orb-purple"></div>
      <div className="bg-glow-orb orb-cyan"></div>
      <div className="bg-glow-orb orb-blue"></div>

      {/* Grid Pattern */}
      <div className="bg-grid-overlay"></div>

      {/* Hero Section */}
      <section className="hero-section container">
        <div className="hero-content">
          <motion.div 
            className="badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="badge-glow"></span>
            <Radio size={14} className="badge-icon" />
            <span className="badge-text">AI-Powered Civic Intelligence</span>
          </motion.div>

          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            AI-Powered Intelligence <br />
            <span className="gradient-text">for Smarter Cities.</span>
          </motion.h1>

          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            CityMindAI transforms citizen complaints into actionable intelligence, automatically identifying issues, prioritizing them, and routing them to the right authority.
          </motion.p>

          <motion.div 
            className="hero-actions-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <a href="#report" className="btn btn-primary btn-lg">
              <span>Report an Issue</span>
              <ArrowRight size={18} />
            </a>
            <a href="#platform" className="btn btn-secondary btn-lg">
              <span>Explore City Intelligence</span>
            </a>
          </motion.div>
        </div>

        <div className="hero-visual-container">
          <motion.div 
            className="visual-board"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Ambient glows inside visual board */}
            <div className="board-glow-cyan"></div>
            <div className="board-glow-purple"></div>

            {/* Grid Representation */}
            <div className="abstract-city-grid">
              <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" className="grid-svg">
                {/* City Grid Lines */}
                <path d="M 50,0 L 50,400 M 150,0 L 150,400 M 250,0 L 250,400 M 350,0 L 350,400" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <path d="M 0,50 L 400,50 M 0,150 L 400,150 M 0,250 L 400,250 M 0,350 L 400,350" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                
                {/* Diagonal connection lines */}
                <path d="M 50,150 L 200,200 L 350,150" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M 150,350 L 200,200 L 250,50" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="1.5" />
                <path d="M 50,250 L 200,200 L 350,350" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1.5" />

                {/* City Nodes */}
                <circle cx="50" cy="150" r="5" fill="#3b82f6" className="pulse-node-slow" />
                <circle cx="350" cy="150" r="4" fill="#06b6d4" />
                <circle cx="150" cy="350" r="6" fill="#8b5cf6" className="pulse-node-fast" />
                <circle cx="250" cy="50" r="4" fill="#06b6d4" />
                <circle cx="50" cy="250" r="5" fill="#8b5cf6" />
                <circle cx="350" cy="350" r="6" fill="#3b82f6" />
                
                {/* Issue markers */}
                <g transform="translate(100, 100)">
                  <circle cx="0" cy="0" r="8" fill="rgba(239, 68, 68, 0.2)" />
                  <circle cx="0" cy="0" r="4" fill="#ef4444" />
                </g>
                <g transform="translate(280, 280)">
                  <circle cx="0" cy="0" r="10" fill="rgba(234, 179, 8, 0.2)" />
                  <circle cx="0" cy="0" r="5" fill="#eab308" />
                </g>

                {/* Central AI Node */}
                <g transform="translate(200, 200)">
                  <circle cx="0" cy="0" r="28" fill="rgba(139, 92, 246, 0.15)" className="brain-glow-outer" />
                  <circle cx="0" cy="0" r="16" fill="rgba(6, 182, 212, 0.25)" className="brain-glow-inner" />
                  <circle cx="0" cy="0" r="8" fill="#06b6d4" />
                </g>
              </svg>
            </div>

            {/* Floating Glass Cards */}
            <motion.div 
              className="glass-card float-card-1"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <div className="card-indicator red-glow"></div>
              <div className="card-details">
                <span className="card-type">Road Issue</span>
                <span className="card-val high-priority">Priority: High</span>
              </div>
            </motion.div>

            <motion.div 
              className="glass-card float-card-2"
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="card-indicator purple-glow"></div>
              <div className="card-details">
                <span className="card-type">AI Confidence</span>
                <span className="card-val accent-purple-text">94.8%</span>
              </div>
            </motion.div>

            <motion.div 
              className="glass-card float-card-3"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.8 }}
            >
              <div className="card-indicator cyan-glow"></div>
              <div className="card-details">
                <span className="card-type">Assigned</span>
                <span className="card-val">Roads Dept</span>
              </div>
            </motion.div>
            
            {/* Center Brain overlay badge */}
            <div className="center-brain-badge">
              <Brain size={16} className="brain-pulse-icon" />
              <span>CityMind Core</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="stats-section">
        <div className="container stats-grid">
          <div className="stat-item">
            <span className="stat-number gradient-text">1,284+</span>
            <span className="stat-label">Issues Analyzed <span className="demo-tag">demo</span></span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number gradient-text">94%</span>
            <span className="stat-label">AI Accuracy <span className="demo-tag">demo</span></span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number gradient-text">12</span>
            <span className="stat-label">Departments Connected</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number gradient-text">24/7</span>
            <span className="stat-label">City Intelligence</span>
          </div>
        </div>
      </section>

      {/* Problem / Solution Section */}
      <section className="problem-solution-section container" id="platform">
        <motion.div 
          className="section-header"
          {...fadeIn}
        >
          <span className="section-subtitle">THE CIVIC CHALLENGE</span>
          <h2 className="section-title">
            Cities don't lack complaints. <br />
            <span className="gradient-text-alt">They lack intelligent coordination.</span>
          </h2>
          <p className="section-description">
            Traditional grievance portals accumulate citizen submissions but struggle to filter noise, assign severity levels, and deliver actionable work orders to the correct departments quickly.
          </p>
        </motion.div>

        <div className="comparison-grid">
          {/* Traditional Way */}
          <motion.div 
            className="comparison-card traditional-card"
            {...fadeIn}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="card-header-bar">
              <span className="card-title-text">TRADITIONAL SYSTEM</span>
            </div>
            <div className="flow-steps">
              <div className="flow-step">
                <div className="step-icon-box red-icon">
                  <FileText size={20} />
                </div>
                <div className="step-info">
                  <span className="step-title">Complaint Filed</span>
                  <span className="step-desc">Unstructured raw text</span>
                </div>
              </div>
              <div className="flow-arrow-down">
                <ArrowRightLeft className="rotate-90" size={16} />
              </div>
              <div className="flow-step">
                <div className="step-icon-box red-icon">
                  <Users size={20} />
                </div>
                <div className="step-info">
                  <span className="step-title">Manual Review</span>
                  <span className="step-desc">Staff reading & triaging</span>
                </div>
              </div>
              <div className="flow-arrow-down">
                <ArrowRightLeft className="rotate-90" size={16} />
              </div>
              <div className="flow-step">
                <div className="step-icon-box red-icon">
                  <Building2 size={20} />
                </div>
                <div className="step-info">
                  <span className="step-title">Department Routing</span>
                  <span className="step-desc">Often misrouted or lost</span>
                </div>
              </div>
              <div className="flow-arrow-down">
                <ArrowRightLeft className="rotate-90" size={16} />
              </div>
              <div className="flow-step is-last-step">
                <div className="step-icon-box red-icon">
                  <Clock size={20} />
                </div>
                <div className="step-info">
                  <span className="step-title">Delayed Action</span>
                  <span className="step-desc">Weeks to resolve issues</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CityMindAI Way */}
          <motion.div 
            className="comparison-card active-solution-card"
            {...fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="card-glow-border"></div>
            <div className="card-header-bar solution-header">
              <span className="card-title-text text-cyan">CITYMINDAI PLATFORM</span>
              <span className="active-badge">ACTIVE AI</span>
            </div>
            <div className="flow-steps">
              <div className="flow-step">
                <div className="step-icon-box cyan-icon">
                  <Send size={20} />
                </div>
                <div className="step-info">
                  <span className="step-title text-light">Instant Submission</span>
                  <span className="step-desc">App / Web / Image Upload</span>
                </div>
              </div>
              <div className="flow-arrow-down solution-arrow">
                <Zap size={16} className="pulse-cyan-text" />
              </div>
              <div className="flow-step">
                <div className="step-icon-box cyan-icon">
                  <Brain size={20} />
                </div>
                <div className="step-info">
                  <span className="step-title text-light">AI Analysis & Tagging</span>
                  <span className="step-desc">Immediate classification & priority</span>
                </div>
              </div>
              <div className="flow-arrow-down solution-arrow">
                <Zap size={16} className="pulse-cyan-text" />
              </div>
              <div className="flow-step">
                <div className="step-icon-box cyan-icon">
                  <Layers size={20} />
                </div>
                <div className="step-info">
                  <span className="step-title text-light">Smart Dynamic Routing</span>
                  <span className="step-desc">Automated department assignment</span>
                </div>
              </div>
              <div className="flow-arrow-down solution-arrow">
                <Zap size={16} className="pulse-cyan-text" />
              </div>
              <div className="flow-step is-last-step">
                <div className="step-icon-box cyan-icon">
                  <CheckCircle2 size={20} />
                </div>
                <div className="step-info">
                  <span className="step-title text-light">Rapid Resolution</span>
                  <span className="step-desc">Trackable, structured dispatch</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="container">
          <motion.div 
            className="section-header text-center"
            {...fadeIn}
          >
            <span className="section-subtitle text-center">WORKFLOW DEPLOYMENT</span>
            <h2 className="section-title text-center">From complaint to city intelligence.</h2>
          </motion.div>

          <motion.div 
            className="workflow-grid"
            variants={containerDelay}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Step 1 */}
            <motion.div className="workflow-card" variants={fadeIn}>
              <div className="workflow-number-bg">01</div>
              <div className="workflow-card-content">
                <div className="workflow-icon-circle">
                  <Send size={24} className="workflow-icon" />
                </div>
                <h3 className="workflow-card-title">01 — REPORT</h3>
                <p className="workflow-card-text">
                  Citizen submits a complaint description, relevant images, and geolocation from any mobile device or web interface.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div className="workflow-card" variants={fadeIn}>
              <div className="workflow-number-bg">02</div>
              <div className="workflow-card-content">
                <div className="workflow-icon-circle">
                  <Brain size={24} className="workflow-icon" />
                </div>
                <h3 className="workflow-card-title">02 — UNDERSTAND</h3>
                <p className="workflow-card-text">
                  Gemini LLMs parse the raw description to extract intent, detect sentiment, identify anomalies, and sanitize content.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div className="workflow-card" variants={fadeIn}>
              <div className="workflow-number-bg">03</div>
              <div className="workflow-card-content">
                <div className="workflow-icon-circle">
                  <Layers size={24} className="workflow-icon" />
                </div>
                <h3 className="workflow-card-title">03 — PRIORITIZE</h3>
                <p className="workflow-card-text">
                  AI determines category (e.g. Roads, Sanitation), estimates urgency, and assigns routing to the correct department.
                </p>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div className="workflow-card" variants={fadeIn}>
              <div className="workflow-number-bg">04</div>
              <div className="workflow-card-content">
                <div className="workflow-icon-circle">
                  <CheckCircle2 size={24} className="workflow-icon" />
                </div>
                <h3 className="workflow-card-title">04 — ACT</h3>
                <p className="workflow-card-text">
                  Municipal authorities receive clean, categorized, prioritized information through their secure operations dashboard.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="features-section container" id="intelligence">
        <motion.div 
          className="section-header"
          {...fadeIn}
        >
          <span className="section-subtitle">PLATFORM CAPABILITIES</span>
          <h2 className="section-title">Designed for municipal efficiency.</h2>
          <p className="section-description">
            A comprehensive suite of intelligence tools developed to connect citizen needs with active government operations.
          </p>
        </motion.div>

        <div className="features-grid">
          {/* Card 1 */}
          <motion.div 
            className="feature-item-card"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div className="feature-icon-wrapper">
              <Brain className="feature-icon text-cyan" size={24} />
            </div>
            <h3 className="feature-item-title">AI Complaint Analysis</h3>
            <p className="feature-item-text">
              Natural language models extract structural facts, locations, and context directly from unstructured conversational text.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            className="feature-item-card"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div className="feature-icon-wrapper">
              <ArrowRightLeft className="feature-icon text-purple" size={24} />
            </div>
            <h3 className="feature-item-title">Intelligent Routing</h3>
            <p className="feature-item-text">
              No manual triage needed. AI maps reported issues to municipal department org charts instantly and logs assignments.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            className="feature-item-card"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div className="feature-icon-wrapper">
              <AlertTriangle className="feature-icon text-blue" size={24} />
            </div>
            <h3 className="feature-item-title">Priority Detection</h3>
            <p className="feature-item-text">
              Recognizes safety-critical reports (e.g. fallen trees, open wires) and flags them for immediate high-urgency dispatch.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            className="feature-item-card"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div className="feature-icon-wrapper">
              <TrendingUp className="feature-icon text-cyan" size={24} />
            </div>
            <h3 className="feature-item-title">City Issue Analytics</h3>
            <p className="feature-item-text">
              Track resolution rates, identify recurring hotspots, and make data-backed infrastructure spending decisions.
            </p>
          </motion.div>

          {/* Card 5 */}
          <motion.div 
            className="feature-item-card"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div className="feature-icon-wrapper">
              <MapPin className="feature-icon text-purple" size={24} />
            </div>
            <h3 className="feature-item-title">Citizen Tracking</h3>
            <p className="feature-item-text">
              Give citizens a clear, transparent view of their ticket's lifecycle, boosting municipal trust and public satisfaction.
            </p>
          </motion.div>

          {/* Card 6 */}
          <motion.div 
            className="feature-item-card"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div className="feature-icon-wrapper">
              <Building2 className="feature-icon text-blue" size={24} />
            </div>
            <h3 className="feature-item-title">Operations Center</h3>
            <p className="feature-item-text">
              An administrative hub for city managers to oversee pending tasks, dispatch work teams, and manage response times.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section" id="dashboard">
        <div className="container final-cta-container">
          <div className="final-cta-glow-purple"></div>
          <div className="final-cta-glow-cyan"></div>
          
          <motion.div 
            className="final-cta-inner"
            {...fadeIn}
          >
            <h2 className="final-cta-title">Turn citizen voices into <span className="gradient-text">city intelligence.</span></h2>
            <p className="final-cta-text">
              Build a faster, smarter, more responsive city. Join the municipal managers already piloting CityMindAI in active test environments.
            </p>
            <div className="final-cta-buttons">
              <a href="#report" className="btn btn-primary btn-lg">
                <span>Report an Issue</span>
                <ArrowRight size={18} />
              </a>
              <a href="#dashboard-app" className="btn btn-secondary btn-lg">
                <span>View Operations Center</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container footer-container">
          <div className="footer-left">
            <div className="logo-group">
              <Cpu className="logo-icon text-cyan" size={20} />
              <span className="logo-text">CityMind<span className="accent-text">AI</span></span>
            </div>
            <p className="footer-tagline">AI-powered intelligence for smarter cities.</p>
            <p className="footer-credit">Built for innovation. Designed for impact.</p>
          </div>
          
          <div className="footer-links-grid">
            <div className="footer-link-col">
              <span className="footer-heading">Platform</span>
              <a href="#platform" className="footer-link">AI Routing</a>
              <a href="#platform" className="footer-link">Analytics Hub</a>
              <a href="#platform" className="footer-link">Integrations</a>
            </div>
            <div className="footer-link-col">
              <span className="footer-heading">Portals</span>
              <a href="#citizen" className="footer-link">Citizen Grievance</a>
              <a href="#authority" className="footer-link">Authority Dashboard</a>
              <a href="#docs" className="footer-link">API Access</a>
            </div>
            <div className="footer-link-col">
              <span className="footer-heading">Security</span>
              <a href="#privacy" className="footer-link">Privacy Policy</a>
              <a href="#terms" className="footer-link">Terms of Service</a>
              <a href="#gov" className="footer-link">Gov Cloud SLA</a>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <span className="footer-copyright">© {new Date().getFullYear()} CityMindAI. All rights reserved. Hackathon Prototype.</span>
        </div>
      </footer>
    </div>
  );
}
