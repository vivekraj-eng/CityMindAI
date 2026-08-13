import React, { useState } from 'react';
import { analyzeComplaint } from '../services/gemini';
import { Send, Sparkles, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import AIAnalysis from './AIAnalysis';

export default function ComplaintForm({ addComplaint }) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Auto-Detect');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !location) return;

    setIsAnalyzing(true);
    setSuccess(false);
    setLatestAnalysis(null);

    // Simulated multi-step AI reasoning for hackathon visual feedback
    const steps = [
      'Reading complaint description...',
      'Analyzing structural context with Gemini LLM...',
      'Categorizing incident and identifying key entities...',
      'Estimating municipal urgency and safety routing...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setAnalysisStep(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    try {
      // Call Gemini analysis
      const aiResponse = await analyzeComplaint(title, description, location, category === 'Auto-Detect' ? null : category);
      
      const newTicket = {
        id: Date.now(),
        title,
        description,
        location,
        category: aiResponse.category,
        urgency: aiResponse.urgency,
        priority: aiResponse.urgency,
        department: aiResponse.category,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiSummary: aiResponse.aiSummary,
        tags: aiResponse.tags,
        sentiment: aiResponse.sentiment,
        detectedIssue: aiResponse.detectedIssue,
        recommendedAction: aiResponse.recommendedAction,
        confidence: aiResponse.confidence
      };

      // Add to global state
      addComplaint(newTicket);
      
      setLatestAnalysis(aiResponse);
      setSuccess(true);

      // Reset form fields
      setTitle('');
      setLocation('');
      setDescription('');
      setCategory('Auto-Detect');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="complaint-form-wrapper">
      <div className="form-header">
        <Sparkles size={20} className="text-cyan animate-pulse-fast" />
        <h3>Submit New Grievance</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="grievance-form">
        <div className="form-group">
          <label htmlFor="title">Issue Title</label>
          <input
            type="text"
            id="title"
            placeholder="e.g. Broken streetlight, large pothole"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isAnalyzing}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Geographic Location</label>
          <div className="input-with-icon">
            <MapPin size={16} className="input-icon" />
            <input
              type="text"
              id="location"
              placeholder="Street address, junction, or GPS coords"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isAnalyzing}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category Selector</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isAnalyzing}
          >
            <option value="Auto-Detect">Auto-Detect Category (AI Triage)</option>
            <option value="Roads & Infrastructure">Roads & Infrastructure</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Public Safety">Public Safety</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Lighting & Electricity">Lighting & Electricity</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Detailed Description</label>
          <textarea
            id="description"
            rows="4"
            placeholder="Describe the issue in detail. Our AI will automatically extract categories, urgency, and routing details."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isAnalyzing}
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full submit-btn"
          disabled={isAnalyzing || !title || !description || !location}
        >
          {isAnalyzing ? (
            <>
              <span className="spinner"></span>
              <span>AI Triage Running...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Analyze & Submit Issue</span>
            </>
          )}
        </button>
      </form>

      {/* AI Processing Screen */}
      {isAnalyzing && (
        <div className="ai-processing-overlay">
          <div className="ai-processing-box">
            <div className="ai-scanner-line"></div>
            <Sparkles size={24} className="text-purple spinner-pulse" />
            <h4>Gemini AI Analyzing</h4>
            <p className="ai-step-text">{analysisStep}</p>
            <div className="progress-bar-container">
              <div className="progress-bar-fill"></div>
            </div>
          </div>
        </div>
      )}

      {/* Success & AI Feedback display */}
      {success && latestAnalysis && (
        <div className="success-feedback-container">
          <div className="success-banner">
            <CheckCircle size={18} className="text-green" />
            <span>Grievance registered successfully!</span>
          </div>
          
          <AIAnalysis analysis={latestAnalysis} />
        </div>
      )}
    </div>
  );
}
