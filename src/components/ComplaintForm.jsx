import React, { useState } from 'react';
import { analyzeComplaint, checkLocalCivicValidity, checkAmbiguity } from '../services/gemini';
import { Send, Sparkles, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import AIAnalysis from './AIAnalysis';

export default function ComplaintForm({ addComplaint }) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Auto-Detect');
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [lastSubmittedText, setLastSubmittedText] = useState('');
  const [formError, setFormError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setFormError("Image upload failure: File size exceeds the 4MB limit.");
      return;
    }
    setFormError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setImagePreview(reader.result);
    };
    reader.onerror = () => {
      console.error("Image loading failed.");
      setFormError("Image upload failure: Failed to read file data.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setFormError("Please provide a title for the issue.");
      return;
    }

    if (!location.trim() || location.trim().length < 4 || ['test', 'hello', 'hi', 'none', 'n/a'].includes(location.trim().toLowerCase())) {
      setFormError("Please provide the location of the issue so authorities can respond.");
      return;
    }

    const isAmbiguous = checkAmbiguity(description);
    if (isAmbiguous) {
      setFormError("Could you describe the specific problem?");
      return;
    }

    const isLocalValid = checkLocalCivicValidity(description);
    if (!isLocalValid) {
      setFormError("This doesn't appear to be a civic complaint. Please describe a public issue such as a road, water, sanitation, lighting, safety, drainage, or other public-service problem.");
      return;
    }

    if (description.trim() === lastSubmittedText.trim()) {
      setFormError("Duplicate submission prevention: This complaint description has already been registered.");
      return;
    }
    setFormError('');

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
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    try {
      // Parse image if present
      let imageData = null;
      if (image) {
        const parts = image.split(',');
        if (parts.length === 2) {
          const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
          const base64Data = parts[1];
          imageData = { mimeType, base64Data };
        }
      }

      // Geocode address location to latitude/longitude (removed Google dependency)
      let latitude = null;
      let longitude = null;

      // Call Gemini analysis
      const aiResponse = await analyzeComplaint(title, description, location, category === 'Auto-Detect' ? null : category, imageData);
      
      if (!aiResponse || aiResponse.validComplaint === false) {
        setFormError(aiResponse.errorMsg || "This doesn't appear to be a civic complaint. Please describe a public issue such as a road, water, sanitation, lighting, safety, drainage, or other public-service problem.");
        setIsAnalyzing(false);
        return;
      }

      const newTicket = {
        id: Date.now(),
        title,
        description,
        location,
        category: aiResponse.category,
        urgency: aiResponse.urgency,
        priority: aiResponse.urgency,
        department: aiResponse.department,
        status: 'Submitted', // Start with Submitted status!
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiSummary: aiResponse.aiSummary,
        tags: aiResponse.tags,
        sentiment: aiResponse.sentiment,
        detectedIssue: aiResponse.detectedIssue,
        recommendedAction: aiResponse.recommendedAction,
        confidence: aiResponse.confidence,
        image: imagePreview, // Store the preview base64 reference locally
        latitude,
        longitude
      };

      // Add to global state
      addComplaint(newTicket);
      
      setLastSubmittedText(description);
      setLatestAnalysis(aiResponse);
      setSuccess(true);

      // Reset form fields
      setTitle('');
      setLocation('');
      setDescription('');
      setCategory('Auto-Detect');
      setImage(null);
      setImagePreview(null);
      const fileInput = document.getElementById('image-upload');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error(err);
      setFormError("AI analysis is temporarily unavailable. Please try again.");
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

        <div className="form-group">
          <label htmlFor="image-upload" className="file-input-label">Attach Photo (Optional)</label>
          <div className="file-input-wrapper">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isAnalyzing}
              className="file-input-control"
            />
          </div>
          {imagePreview && (
            <div className="image-preview-container" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="uploaded-image-preview" 
                style={{ width: '64px', height: '64px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--glass-border)' }} 
              />
              <button 
                type="button" 
                className="btn-remove-image" 
                onClick={handleRemoveImage}
                style={{ fontSize: '12px', color: '#B03A2E', cursor: 'pointer', border: 'none', background: 'none', textDecoration: 'underline' }}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {formError && (
          formError.includes("doesn't appear to be a civic complaint") ? (
            <div className="validation-error-card" style={{ padding: '20px', background: 'rgba(185,101,75,0.04)', border: '1px solid var(--glass-border)', borderRadius: '8px', margin: '16px 0', textAlign: 'center' }}>
              <div style={{ color: '#B9654B', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span>⚠ Invalid Complaint</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                This doesn't appear to describe a civic issue.
              </p>
              <div style={{ background: 'var(--surface-elevated)', padding: '10px', borderRadius: '4px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', border: '1px solid var(--glass-border)', fontStyle: 'italic' }}>
                Try something like:<br />
                "There is a large pothole near the main gate."
              </div>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setFormError('')}
                style={{ fontSize: '11px', padding: '6px 14px' }}
              >
                Edit Complaint
              </button>
            </div>
          ) : (
            <div className="form-error-alert" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(176, 58, 46, 0.08)', border: '1px solid rgba(176, 58, 46, 0.2)', borderRadius: '4px', color: '#B03A2E', fontSize: '13px', margin: '14px 0' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{formError}</span>
            </div>
          )
        )}

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
