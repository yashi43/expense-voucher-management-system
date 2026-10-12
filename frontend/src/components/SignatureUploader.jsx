import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Upload, Edit3, Check, Trash2, Image as ImageIcon } from 'lucide-react';

const SignatureUploader = ({ value, onChange, label = 'Signature Image', required = false, defaultProfileSignature = '' }) => {
  const [mode, setMode] = useState('upload'); // 'upload' | 'draw'
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);

  // Initialize canvas for drawing mode
  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#1e3a8a';
    }
  }, [mode]);

  // Handle direct file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, or WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must not exceed 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('signature', file);

      const res = await api.post('/upload/signature', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        onChange(res.data.fileUrl);
      }
    } catch (err) {
      console.error('Signature upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload signature image');
    } finally {
      setUploading(false);
    }
  };

  // Canvas drawing handlers
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveCanvasSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    setUploading(true);
    setError('');

    try {
      const res = await api.post('/upload/signature-base64', { imageBase64: dataUrl });
      if (res.data.success) {
        onChange(res.data.fileUrl);
      }
    } catch (err) {
      console.error('Failed to save drawn signature:', err);
      setError('Could not save drawn signature');
    } finally {
      setUploading(false);
    }
  };

  const fullImageUrl = value
    ? value.startsWith('http') || value.startsWith('data:')
      ? value
      : `http://localhost:5000${value}`
    : '';

  return (
    <div className="form-group">
      <div className="flex-between" style={{ marginBottom: '0.35rem' }}>
        <label className="form-label" style={{ margin: 0 }}>
          {label} {required && <span className="required">*</span>}
        </label>
        {!value && (
          <div className="flex gap-2">
            <button
              type="button"
              className={`signature-tab-btn ${mode === 'upload' ? 'active' : ''}`}
              onClick={() => setMode('upload')}
            >
              <Upload size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Upload Image
            </button>
            <button
              type="button"
              className={`signature-tab-btn ${mode === 'draw' ? 'active' : ''}`}
              onClick={() => setMode('draw')}
            >
              <Edit3 size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Draw Signature
            </button>
            {defaultProfileSignature && (
              <button
                type="button"
                className="signature-tab-btn"
                onClick={() => onChange(defaultProfileSignature)}
              >
                Use Saved
              </button>
            )}
          </div>
        )}
      </div>

      {error && <div className="alert alert-danger" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>{error}</div>}

      {/* When signature exists: display signature preview card */}
      {value ? (
        <div className="signature-box" style={{ background: '#ffffff', position: 'relative' }}>
          <img
            src={fullImageUrl}
            alt="Signature Preview"
            className="signature-img"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="flex items-center gap-2" style={{ marginTop: '0.75rem' }}>
            <span className="badge badge-approved" style={{ fontSize: '0.75rem' }}>
              <Check size={12} /> Signature Attached
            </span>
            <button
              type="button"
              onClick={() => onChange('')}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--danger)' }}
            >
              <Trash2 size={14} /> Remove / Re-upload
            </button>
          </div>
        </div>
      ) : (
        /* When no signature: display upload dropzone or drawing canvas */
        <div>
          {mode === 'upload' && (
            <div
              style={{
                border: '2px dashed var(--slate-300)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--slate-50)',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('signature-file-input').click()}
            >
              <input
                id="signature-file-input"
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon size={32} style={{ color: 'var(--slate-400)' }} />
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>
                  {uploading ? 'Uploading image...' : 'Click to select signature image'}
                </p>
                <span className="form-hint">PNG, JPG, or WebP up to 5MB</span>
              </div>
            </div>
          )}

          {mode === 'draw' && (
            <div style={{ textAlign: 'center' }}>
              <canvas
                ref={canvasRef}
                width={450}
                height={140}
                className="signature-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ width: '100%', maxWidth: '450px', height: '140px' }}
              />
              <div className="flex items-center justify-center gap-2" style={{ marginTop: '0.75rem' }}>
                <button type="button" onClick={clearCanvas} className="btn btn-secondary btn-sm">
                  Clear Pad
                </button>
                <button
                  type="button"
                  onClick={saveCanvasSignature}
                  disabled={uploading}
                  className="btn btn-primary btn-sm"
                >
                  {uploading ? 'Saving...' : 'Apply Drawn Signature'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignatureUploader;
