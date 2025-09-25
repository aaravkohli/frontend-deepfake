// API Response Types based on backend FastAPI models

export enum FileType {
  AUDIO = 'audio',
  IMAGE = 'image',
  VIDEO = 'video',
  UNKNOWN = 'unknown'
}

export enum DetectionResult {
  REAL = 'real',
  FAKE = 'fake',
  UNCERTAIN = 'uncertain'
}

export interface DetectionMetadata {
  // Common metadata
  model_architecture?: string;
  model_file?: string;
  device?: string;
  processing_time_ms?: number;
  backend?: string;
  
  // Audio-specific metadata
  original_duration_seconds?: number;
  original_sample_rate?: number;
  original_channels?: number;
  processed_duration_seconds?: number;
  processed_sample_rate?: number;
  raw_logit?: number;
  sigmoid_output?: number;
  prob_fake?: number;
  prob_real?: number;
  threshold?: number;
  interpretation_flipped?: boolean;
  is_uncertain?: boolean;
  uncertainty_range?: number;
  uncertainty_bounds?: [number, number];
  waveform_shape_original?: number[];
  waveform_shape_processed?: number[];
  
  // Image-specific metadata
  original_resolution?: string;
  input_resolution?: string;
  format?: string;
  fake_probability?: number;
  real_probability?: number;
  predicted_class?: number;
  raw_outputs?: {
    fake_logit: number;
    real_logit: number;
  };
}

export interface DetectionResponse {
  file_type: FileType;
  detection_result: DetectionResult;
  confidence_score: number;
  processing_time_ms: number;
  file_hash: string;
  timestamp: string;
  metadata?: DetectionMetadata;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  models_loaded: {
    audio: boolean;
    image: boolean;
    video: boolean;
  };
}

export interface SupportedFormatsResponse {
  audio: string[];
  image: string[];
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
  timestamp: string;
}

export interface RootResponse {
  service: string;
  version: string;
  endpoints: {
    [key: string]: string;
  };
}

// Configuration interfaces
export interface AudioCalibrationConfig {
  flip_output_interpretation?: boolean;
  threshold?: number;
  uncertainty_range?: number;
}

// Upload progress callback interface
export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
}

// File analysis state interface
export interface FileAnalysisState {
  isAnalyzing: boolean;
  progress: number;
  error?: string;
  result?: DetectionResponse;
  uploadedFile?: File;
}

// Statistics for dashboard
export interface SystemStats {
  filesProcessed: number;
  detectionAccuracy: number;
  activeUsers: number;
  threatsDetected: number;
  processingTimeAvg: number;
  errorRate: number;
}

export interface AnalyticsData {
  detectionTrends: Array<{
    date: string;
    real: number;
    fake: number;
    uncertain?: number;
  }>;
  accuracyByType: Array<{
    type: FileType;
    accuracy: number;
    count: number;
  }>;
  threatDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  processingTimes: Array<{
    timestamp: string;
    duration: number;
    fileType: FileType;
  }>;
}