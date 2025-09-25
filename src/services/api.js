import axios from 'axios';

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT = 60000; // 60 seconds for file uploads
const MAX_RETRIES = 3;

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.retryAttempts = new Map();

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and retries
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        // Clear retry count on success
        if (response.config.url) {
          this.retryAttempts.delete(response.config.url);
        }
        return response;
      },
      async (error) => {
        return this.handleResponseError(error);
      }
    );
  }

  async handleResponseError(error) {
    const config = error.config;
    const url = config?.url || 'unknown';
    
    console.error(`❌ API Error: ${error.response?.status} ${url}`, error.response?.data);

    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error('Unable to connect to DeepGuard backend. Please ensure the server is running.');
    }

    // Retry logic for network errors and 5xx errors
    if (config && this.shouldRetry(error)) {
      const currentRetries = this.retryAttempts.get(url) || 0;
      if (currentRetries < MAX_RETRIES) {
        this.retryAttempts.set(url, currentRetries + 1);
        console.log(`🔄 Retrying request ${currentRetries + 1}/${MAX_RETRIES}: ${url}`);
        
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, currentRetries) * 1000));
        
        return this.client.request(config);
      }
    }

    // Format error response
    const apiError = this.formatApiError(error);
    throw new Error(apiError.error);
  }

  shouldRetry(error) {
    // Retry on network errors or 5xx server errors, but not 4xx client errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }

  formatApiError(error) {
    const response = error.response;
    
    if (response?.data && typeof response.data === 'object') {
      // Backend returned structured error
      const data = response.data;
      return {
        error: data.error || data.detail || 'Unknown API error',
        details: data.details,
        timestamp: data.timestamp || new Date().toISOString()
      };
    }

    // Generic error formatting
    let errorMessage = 'Unknown error occurred';
    if (response) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      error: errorMessage,
      timestamp: new Date().toISOString()
    };
  }

  // Health check endpoint
  async getHealth() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Get API information
  async getApiInfo() {
    try {
      const response = await this.client.get('/');
      return response.data;
    } catch (error) {
      console.error('Failed to get API info:', error);
      throw error;
    }
  }

  // Get supported file formats
  async getSupportedFormats() {
    try {
      const response = await this.client.get('/supported-formats');
      return response.data;
    } catch (error) {
      console.error('Failed to get supported formats:', error);
      throw error;
    }
  }

  // Upload file for deepfake detection
  async detectDeepfake(file, config, onProgress, abortSignal) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add calibration config as query parameters if provided
      let url = '/detect';
      if (config) {
        const params = new URLSearchParams();
        if (config.flip_output_interpretation !== undefined) {
          params.set('flip_output_interpretation', config.flip_output_interpretation.toString());
        }
        if (config.threshold !== undefined) {
          params.set('threshold', config.threshold.toString());
        }
        if (config.uncertainty_range !== undefined) {
          params.set('uncertainty_range', config.uncertainty_range.toString());
        }
        if (params.toString()) {
          url += '?' + params.toString();
        }
      }

      const response = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal: abortSignal,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage
            });
          }
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error('Upload was cancelled');
      }
      console.error('Deepfake detection failed:', error);
      throw error;
    }
  }

  // Create an AbortController for cancelling requests
  createAbortController() {
    return new AbortController();
  }

  // Validate file against supported formats
  async validateFile(file) {
    try {
      const formats = await this.getSupportedFormats();
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      const allSupportedExtensions = [
        ...formats.audio,
        ...formats.image
      ];

      if (!allSupportedExtensions.includes(fileExtension)) {
        return {
          valid: false,
          error: `Unsupported file format: ${fileExtension}. Supported formats: ${allSupportedExtensions.join(', ')}`
        };
      }

      // Check file size (100MB limit as per backend)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        return {
          valid: false,
          error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 100MB`
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: 'Unable to validate file format. Please try again.'
      };
    }
  }

  // Get base URL for debugging
  getBaseUrl() {
    return API_BASE_URL;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;