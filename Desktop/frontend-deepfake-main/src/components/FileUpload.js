import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, Button, ProgressBar, Alert, Badge, Spinner } from 'react-bootstrap';
import { Upload, X, FileText, Music, Image as ImageIcon, Video, AlertCircle, CheckCircle } from 'lucide-react';
import { useSupportedFormats } from '../hooks/useApi';
import { FileType, DetectionResult } from '../types/api';

function getFileIcon(fileType, size = 24) {
  if (fileType.startsWith('audio/')) {
    return <Music size={size} />;
  }
  if (fileType.startsWith('image/')) {
    return <ImageIcon size={size} />;
  }
  if (fileType.startsWith('video/')) {
    return <Video size={size} />;
  }
  return <FileText size={size} />;
}

function getResultColor(result) {
  switch (result) {
    case DetectionResult.REAL:
      return 'success';
    case DetectionResult.FAKE:
      return 'danger';
    case DetectionResult.UNCERTAIN:
      return 'warning';
    default:
      return 'secondary';
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  uploadedFile,
  isAnalyzing = false,
  progress = 0,
  error,
  result,
  disabled = false
}) {
  const { formats, isLoading: formatsLoading, error: formatsError } = useSupportedFormats();
  const [dragActive, setDragActive] = useState(false);

  // Create accept string for dropzone
  const acceptedFormats = React.useMemo(() => {
    if (!formats) return {};
    
    const acceptObj = {};
    
    // Add audio formats
    if (formats.audio) {
      formats.audio.forEach(ext => {
        const mimeType = getMimeTypeFromExtension(ext);
        if (mimeType) {
          if (!acceptObj[mimeType]) acceptObj[mimeType] = [];
          acceptObj[mimeType].push(ext);
        }
      });
    }
    
    // Add image formats
    if (formats.image) {
      formats.image.forEach(ext => {
        const mimeType = getMimeTypeFromExtension(ext);
        if (mimeType) {
          if (!acceptObj[mimeType]) acceptObj[mimeType] = [];
          acceptObj[mimeType].push(ext);
        }
      });
    }
    
    return acceptObj;
  }, [formats]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0 && !disabled) {
      onFileSelect(acceptedFiles[0]);
    }
    setDragActive(false);
  }, [onFileSelect, disabled]);

  const onDropRejected = useCallback((rejectedFiles) => {
    console.warn('Files rejected:', rejectedFiles);
    setDragActive(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    onDropRejected,
    accept: acceptedFormats,
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
    disabled: disabled || isAnalyzing,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  if (formatsLoading) {
    return (
      <Card className="bg-card border-subtle shadow">
        <Card.Body className="text-center p-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3 text-muted">Loading supported formats...</div>
        </Card.Body>
      </Card>
    );
  }

  if (formatsError) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Unable to load file formats</Alert.Heading>
        <p>Error: {formatsError}</p>
        <p>Please ensure the backend is running and try refreshing the page.</p>
      </Alert>
    );
  }

  // If file is uploaded and analysis is complete, show result
  if (uploadedFile && result && !isAnalyzing) {
    return (
      <Card className="bg-card border-subtle shadow">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              {getFileIcon(uploadedFile.type, 20)}
              <span className="ms-2 text-heading">{uploadedFile.name}</span>
              <Badge bg="secondary" className="ms-2">
                {formatFileSize(uploadedFile.size)}
              </Badge>
            </div>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={onFileRemove}
              disabled={isAnalyzing}
            >
              <X size={16} />
            </Button>
          </div>

          <div className="text-center p-4">
            {result.detection_result === DetectionResult.REAL && (
              <CheckCircle size={48} className="text-success mb-3" />
            )}
            {result.detection_result === DetectionResult.FAKE && (
              <AlertCircle size={48} className="text-danger mb-3" />
            )}
            {result.detection_result === DetectionResult.UNCERTAIN && (
              <AlertCircle size={48} className="text-warning mb-3" />
            )}
            
            <h4 className={`text-${getResultColor(result.detection_result)}`}>
              {result.detection_result.toUpperCase()}
            </h4>
            <div className="text-muted mb-3">
              Confidence: {(result.confidence_score * 100).toFixed(1)}%
            </div>
            <Badge bg={getResultColor(result.detection_result)} className="fs-6">
              {result.file_type} Analysis Complete
            </Badge>
          </div>
        </Card.Body>
      </Card>
    );
  }

  // If file is uploaded and being analyzed
  if (uploadedFile && isAnalyzing) {
    return (
      <Card className="bg-card border-subtle shadow">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              {getFileIcon(uploadedFile.type, 20)}
              <span className="ms-2 text-heading">{uploadedFile.name}</span>
              <Badge bg="secondary" className="ms-2">
                {formatFileSize(uploadedFile.size)}
              </Badge>
            </div>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={onFileRemove}
              disabled={isAnalyzing}
            >
              <X size={16} />
            </Button>
          </div>

          <div className="text-center p-4">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <div className="text-heading mb-2">Analyzing file...</div>
            <div className="text-muted mb-3">
              This may take a few moments depending on file size
            </div>
            <ProgressBar 
              now={progress} 
              label={`${progress}%`}
              variant="info" 
              animated
              style={{ height: '8px' }}
            />
          </div>

          {error && (
            <Alert variant="danger" className="mt-3">
              <AlertCircle size={16} className="me-2" />
              {error}
            </Alert>
          )}
        </Card.Body>
      </Card>
    );
  }

  // Default upload UI
  return (
    <Card className="bg-card border-subtle shadow">
      <Card.Body>
        <div
          {...getRootProps()}
          className={`text-center p-5 border rounded ${
            dragActive || isDragActive 
              ? 'border-primary bg-primary bg-opacity-10' 
              : isDragReject 
                ? 'border-danger bg-danger bg-opacity-10'
                : 'border-dashed border-secondary'
          } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          style={{
            borderStyle: 'dashed',
            borderWidth: '2px',
            transition: 'all 0.3s ease',
          }}
        >
          <input {...getInputProps()} />
          
          <Upload 
            size={48} 
            className={`mb-3 ${
              dragActive || isDragActive ? 'text-primary' : 'text-muted'
            }`} 
          />
          
          <h5 className="text-heading mb-2">
            {isDragActive 
              ? 'Drop your file here' 
              : isDragReject
                ? 'File not supported'
                : 'Upload Media File'
            }
          </h5>
          
          <p className="text-muted mb-3">
            Drag and drop a file here, or click to browse
          </p>
          
          <Button 
            className="btn-gradient mb-3"
            disabled={disabled}
          >
            Choose File
          </Button>
          
          <div className="small text-muted">
            <div className="mb-2">
              <strong>Supported formats:</strong>
            </div>
            {formats && (
              <div>
                <div>
                  <strong>Audio:</strong> {formats.audio?.join(', ') || 'None'}
                </div>
                <div>
                  <strong>Images:</strong> {formats.image?.join(', ') || 'None'}
                </div>
                <div className="mt-2">
                  <strong>Maximum size:</strong> 100MB
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="mt-3">
            <AlertCircle size={16} className="me-2" />
            {error}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}

// Helper function to get MIME type from file extension
function getMimeTypeFromExtension(ext) {
  const mimeTypes = {
    // Audio formats
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.flac': 'audio/flac',
    '.aac': 'audio/aac',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.opus': 'audio/opus',
    
    // Image formats
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
    '.tiff': 'image/tiff',
    
    // Video formats (if needed in future)
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm'
  };

  return mimeTypes[ext.toLowerCase()] || null;
}