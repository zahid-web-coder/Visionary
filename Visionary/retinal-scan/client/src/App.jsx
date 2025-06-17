import { useState } from 'react';
import './App.css';

// Result descriptions
const diseaseInfo = {
  Normal: {
    desc: "No signs of eye disease detected.",
    tips: "Keep maintaining good eye health habits.",
    icon: "👁️"
  },
  Cataract: {
    desc: "Clouding of the eye's lens, leading to vision issues.",
    tips: "Consult an ophthalmologist for surgical options.",
    icon: "🔎"
  },
  Glaucoma: {
    desc: "Damage to the optic nerve, often caused by high eye pressure.",
    tips: "Early treatment can help prevent vision loss.",
    icon: "⚠️"
  },
  Diabetes: {
    desc: "Signs of diabetic retinopathy found.",
    tips: "Control blood sugar and get regular eye exams.",
    icon: "🩸"
  },
  "Age-related": {
    desc: "Signs of age-related macular degeneration (AMD).",
    tips: "Diet rich in antioxidants may help; consult a specialist.",
    icon: "👴"
  },
  Hypertension: {
    desc: "Possible hypertensive retinopathy detected.",
    tips: "Manage blood pressure and follow up with an eye doctor.",
    icon: "📈"
  },
  "Macular Degeneration": {
    desc: "Degeneration of the central part of the retina.",
    tips: "Early detection helps preserve vision.",
    icon: "👁️‍🗨️"
  },
  Other: {
    desc: "Signs of other or uncommon eye conditions.",
    tips: "Seek medical attention for further diagnosis.",
    icon: "❓"
  },
};

const App = () => {
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setResult(null); // Clear previous result
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImage(file);
      setResult(null);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      alert("Please select an image before starting analysis.");
      return;
    }
  
    // Reset all states
    setProgress(0);
    setResult(null);
    setIsAnalyzing(true);
  
    const formData = new FormData();
    formData.append('image', image);
  
  
    try {
      const response = await fetch('http://localhost:5000/predict', {
      // const response = await fetch('https://0e19-2401-4900-22e5-a0c2-a8ac-d45d-14e2-33f8.ngrok-free.app/predict', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      // clearInterval(interval);
      setProgress(100);
      setResult(data.predictions[0]?.label || "Unknown");
      

    } catch (err) {
      // clearInterval(interval);
      setProgress(0);
      setIsAnalyzing(false);
      alert("Error analyzing the image. Please try again.");
      console.error("Fetch error:", err);
    }
  };
  
  return (
    <div className="app-container">
      <div className="app-content">
        <header className="header">
          <h1>EyeScope AI</h1>
          <p>Advanced retinal disease detection powered by artificial intelligence</p>
        </header>

        <div className="upload-section" 
             onDragEnter={handleDrag}
             onDragLeave={handleDrag}
             onDragOver={handleDrag}
             onDrop={handleDrop}>
          
          <div className={`upload-area ${dragActive ? 'active' : ''} ${previewUrl ? 'with-preview' : ''}`}>
            {previewUrl ? (
              <div className="image-preview">
                <img src={previewUrl} alt="Eye scan preview" />
                <button className="change-image" onClick={() => {
                  setPreviewUrl(null);
                  setImage(null);
                  setResult(null);
                }}>
                  Change Image
                </button>
              </div>
            ) : (
              <>
                <div className="upload-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <p className="upload-text">Drag & drop your eye scan image or</p>
                <label className="file-input-label">
                  Browse Files
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="file-input"
                  />
                </label>
                <p className="file-format">Supports: JPG, PNG, JPEG</p>
              </>
            )}
          </div>

          {previewUrl && !isAnalyzing && !result && (
            <button
              onClick={handleSubmit}
              className="analyze-btn"
            >
              Analyze Image
            </button>
          )}

          {isAnalyzing && (
            <div className="analyzer-container">
              <div className="analyzer">
                <div className="analyzer-spinner">
                  <div className="spinner-ring"></div>
                  <div className="spinner-eye"></div>
                </div>
                <div className="analyzer-text">
                  <h3>AI is analyzing your image...</h3>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="progress-text">{progress}% complete</p>
                  <div className="status-messages">
                    {progress < 30 && <p>Detecting eye structures...</p>}
                    {progress >= 30 && progress < 60 && <p>Analyzing retinal patterns...</p>}
                    {progress >= 60 && progress < 90 && <p>Comparing with medical database...</p>}
                    {progress >= 90 && <p>Finalizing results...</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="result-container">
              <div className="result-card">
                <div className="result-icon">{diseaseInfo[result].icon}</div>
                <h2 className="result-title">{result}</h2>
                <p className="result-description">{diseaseInfo[result].desc}</p>
                <div className="result-tips">
                  <h3>Recommendations</h3>
                  <p>{diseaseInfo[result].tips}</p>
                </div>
                <div className="result-actions">
                  <button className="action-btn primary" onClick={() => {
                    // Completely reset all states
                    setImage(null);
                    setPreviewUrl(null);
                    setResult(null);
                    setProgress(0);
                    setIsAnalyzing(false);
                  }}>
                    Scan Another Image
                  </button>
                  <button className="action-btn secondary">
                    Download Report
                  </button>
                </div>
              </div>
              
              <div className="disclaimer">
                <p>This is an AI-powered screening tool only. Always consult with a healthcare professional for proper diagnosis.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;