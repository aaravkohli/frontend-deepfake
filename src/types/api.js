// API Response Types based on backend FastAPI models

export const FileType = {
  AUDIO: 'audio',
  IMAGE: 'image',
  VIDEO: 'video',
  UNKNOWN: 'unknown'
};

export const DetectionResult = {
  REAL: 'real',
  FAKE: 'fake',
  UNCERTAIN: 'uncertain'
};

// Default audio calibration configuration
export const defaultAudioConfig = {
  flip_output_interpretation: false,
  threshold: 0.5,
  uncertainty_range: 0.1
};