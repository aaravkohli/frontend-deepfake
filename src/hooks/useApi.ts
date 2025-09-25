import { useState, useCallback, useRef, useEffect } from 'react';
import useSWR from 'swr';
import apiService from '../services/api';
import {
  HealthResponse,
  SupportedFormatsResponse,
  DetectionResponse,
  FileAnalysisState,
  UploadProgressEvent,
  AudioCalibrationConfig
} from '../types/api';

// Health status hook with caching
export function useHealth() {
  const { data, error, isLoading, mutate } = useSWR<HealthResponse>(
    'health',
    () => apiService.getHealth(),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    health: data,
    isHealthy: data?.status === 'healthy',
    isLoading,
    error: error?.message,
    refresh: mutate
  };
}

// Supported formats hook with caching
export function useSupportedFormats() {
  const { data, error, isLoading } = useSWR<SupportedFormatsResponse>(
    'supported-formats',
    () => apiService.getSupportedFormats(),
    {
      // Cache for longer since this rarely changes
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    formats: data,
    isLoading,
    error: error?.message,
  };
}

// File analysis hook with progress tracking and cancellation
export function useFileAnalysis() {
  const [state, setState] = useState<FileAnalysisState>({
    isAnalyzing: false,
    progress: 0,
    error: undefined,
    result: undefined,
    uploadedFile: undefined,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const analyzeFile = useCallback(async (
    file: File,
    config?: AudioCalibrationConfig
  ): Promise<DetectionResponse | null> => {
    try {
      // Validate file first
      const validation = await apiService.validateFile(file);
      if (!validation.valid) {
        setState(prev => ({
          ...prev,
          error: validation.error,
          isAnalyzing: false
        }));
        return null;
      }

      // Reset state and start analysis
      setState({
        isAnalyzing: true,
        progress: 0,
        error: undefined,
        result: undefined,
        uploadedFile: file,
      });

      // Create abort controller for cancellation
      abortControllerRef.current = apiService.createAbortController();

      const result = await apiService.detectDeepfake(
        file,
        config,
        (progress: UploadProgressEvent) => {
          setState(prev => ({
            ...prev,
            progress: progress.percentage
          }));
        },
        abortControllerRef.current.signal
      );

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        progress: 100,
        result,
      }));

      return result;

    } catch (error: any) {
      const errorMessage = error.message || 'Analysis failed. Please try again.';
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: 'Analysis cancelled by user',
      }));
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setState({
      isAnalyzing: false,
      progress: 0,
      error: undefined,
      result: undefined,
      uploadedFile: undefined,
    });
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    analyzeFile,
    cancelAnalysis,
    resetAnalysis,
    canCancel: state.isAnalyzing && abortControllerRef.current !== null,
  };
}

// Backend connection status hook
export function useBackendStatus() {
  const { health, isHealthy, isLoading, error } = useHealth();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  useEffect(() => {
    if (isLoading) {
      setConnectionStatus('connecting');
    } else if (error) {
      setConnectionStatus('disconnected');
    } else if (isHealthy) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isLoading, error, isHealthy]);

  return {
    status: connectionStatus,
    health,
    modelsStatus: health?.models_loaded,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    error,
  };
}

// Audio calibration configuration hook with localStorage persistence
export function useAudioCalibration() {
  const [config, setConfigState] = useState<AudioCalibrationConfig>(() => {
    // Load from localStorage on initialization
    try {
      const saved = localStorage.getItem('deepguard_audio_calibration');
      return saved ? JSON.parse(saved) : {
        flip_output_interpretation: false,
        threshold: 0.5,
        uncertainty_range: 0.1
      };
    } catch {
      return {
        flip_output_interpretation: false,
        threshold: 0.5,
        uncertainty_range: 0.1
      };
    }
  });

  const setConfig = useCallback((newConfig: Partial<AudioCalibrationConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfigState(updatedConfig);
    
    // Persist to localStorage
    try {
      localStorage.setItem('deepguard_audio_calibration', JSON.stringify(updatedConfig));
    } catch (error) {
      console.warn('Failed to save audio calibration config to localStorage:', error);
    }
  }, [config]);

  const resetConfig = useCallback(() => {
    const defaultConfig: AudioCalibrationConfig = {
      flip_output_interpretation: false,
      threshold: 0.5,
      uncertainty_range: 0.1
    };
    setConfigState(defaultConfig);
    try {
      localStorage.removeItem('deepguard_audio_calibration');
    } catch (error) {
      console.warn('Failed to remove audio calibration config from localStorage:', error);
    }
  }, []);

  return {
    config,
    setConfig,
    resetConfig,
  };
}