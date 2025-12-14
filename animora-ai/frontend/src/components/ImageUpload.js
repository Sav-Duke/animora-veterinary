import React, { useState, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:4001/api';

export default function ImageUpload({ onAnalysisComplete, species = 'cattle' }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      setPreview(reader.result);
      setError(null);
      setResult(null);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      console.log('📤 Uploading image for analysis...');
      const res = await axios.post(`${API_BASE}/image/analyze`, {
        image: selectedImage,
        species: species,
        question: null // Can be enhanced to accept custom questions
      });

      console.log('✅ Analysis complete');
      setResult(res.data);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(res.data);
      }
    } catch (err) {
      console.error('Image analysis error:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.hint || 
        'Failed to analyze image. Please try again.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const getAlertColor = (level) => {
    const colors = {
      emergency: '#ff4444',
      urgent: '#ff8800',
      moderate: '#ffbb33',
      monitor: '#00C851'
    };
    return colors[level] || '#00C851';
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '12px', 
      padding: '20px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px' }}>
        📸 Image Diagnosis
      </h3>

      {/* Upload Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          📁 Choose Photo
        </button>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => cameraInputRef.current?.click()}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          📷 Take Photo
        </button>
      </div>

      {/* Image Preview */}
      {preview && (
        <div style={{ marginBottom: '15px' }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              maxHeight: '300px',
              objectFit: 'contain',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: analyzing ? '#ccc' : '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: analyzing ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {analyzing ? '🔄 Analyzing...' : '🔍 Analyze Image'}
            </button>
            <button
              onClick={handleClear}
              disabled={analyzing}
              style={{
                padding: '12px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: analyzing ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              🗑️
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '8px',
          color: '#c62828',
          marginBottom: '15px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Analysis Result */}
      {result && (
        <div style={{ marginTop: '15px' }}>
          {/* Alert Box */}
          {result.alert && (
            <div style={{
              padding: '15px',
              backgroundColor: getAlertColor(result.alert.level) + '15',
              border: `2px solid ${getAlertColor(result.alert.level)}`,
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold',
                color: getAlertColor(result.alert.level),
                marginBottom: '8px'
              }}>
                {result.alert.icon} {result.alert.message}
              </div>
              <div style={{ fontSize: '14px', color: '#555' }}>
                {result.alert.action}
              </div>
            </div>
          )}

          {/* Analysis Details */}
          <div style={{
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            <h4 style={{ marginTop: 0 }}>📋 Analysis Summary</h4>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <strong>Severity:</strong> <span style={{ 
                textTransform: 'capitalize',
                color: getAlertColor(result.imageAnalysis.urgency),
                fontWeight: 'bold'
              }}>
                {result.imageAnalysis.severity}
              </span>
              <br />
              <strong>Urgency:</strong> {result.imageAnalysis.urgency}
              <br />
              {result.imageAnalysis.symptoms.length > 0 && (
                <>
                  <strong>Detected Symptoms:</strong> {result.imageAnalysis.symptoms.join(', ')}
                  <br />
                </>
              )}
              <strong>Vet Required:</strong> {result.imageAnalysis.requiresVet ? '✅ Yes' : '❌ No'}
            </div>
          </div>

          {/* Matching Diseases */}
          {result.matchingDiseases && result.matchingDiseases.length > 0 && (
            <div style={{
              padding: '15px',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <h4 style={{ marginTop: 0 }}>🔬 Possible Conditions</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {result.matchingDiseases.map((disease, idx) => (
                  <li key={idx} style={{ marginBottom: '5px' }}>
                    {disease.name} ({disease.species?.join(', ')})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Response */}
          <div style={{
            padding: '15px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap'
          }}>
            <h4 style={{ marginTop: 0 }}>🤖 Veterinary Assessment</h4>
            {result.response}
          </div>
        </div>
      )}

      {/* Info */}
      {!preview && !result && (
        <div style={{
          padding: '30px',
          textAlign: 'center',
          color: '#999',
          fontSize: '14px'
        }}>
          <p style={{ fontSize: '48px', margin: '0 0 10px 0' }}>📸</p>
          <p style={{ margin: '5px 0' }}>Upload or take a photo of your animal</p>
          <p style={{ margin: '5px 0', fontSize: '12px' }}>
            AI will analyze visible symptoms and suggest possible conditions
          </p>
        </div>
      )}
    </div>
  );
}
