import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AnalyticsContext = createContext();

const initialState = {
  totalFilesAnalyzed: 0,
  deepfakeDetected: 0,
  authenticFiles: 0,
  fileTypes: { audio: 0, image: 0, video: 0 },
  detectionHistory: [],
  dailyUploads: [],
  processingTimes: [],
  errorCount: 0,
  activeUsers: 1,
  averageConfidence: 0
};

const analyticsReducer = (state, action) => {
  switch (action.type) {
    case 'FILE_ANALYZED':
      const { result, fileType, processingTime, confidence } = action.payload;
      const isDeepfake = result === 'DEEPFAKE' || result === 'FAKE';
      const today = new Date().toISOString().split('T')[0];
      
      const dailyUploads = [...state.dailyUploads];
      const todayIndex = dailyUploads.findIndex(d => d.date === today);
      if (todayIndex >= 0) {
        dailyUploads[todayIndex].count += 1;
        if (isDeepfake) dailyUploads[todayIndex].deepfakes += 1;
        else dailyUploads[todayIndex].authentic += 1;
      } else {
        dailyUploads.push({
          date: today,
          count: 1,
          deepfakes: isDeepfake ? 1 : 0,
          authentic: isDeepfake ? 0 : 1
        });
      }
      
      const detectionHistory = [...state.detectionHistory.slice(-29), {
        timestamp: Date.now(),
        result: isDeepfake ? 'deepfake' : 'authentic',
        confidence: confidence,
        fileType: fileType
      }];
      
      return {
        ...state,
        totalFilesAnalyzed: state.totalFilesAnalyzed + 1,
        deepfakeDetected: isDeepfake ? state.deepfakeDetected + 1 : state.deepfakeDetected,
        authenticFiles: !isDeepfake ? state.authenticFiles + 1 : state.authenticFiles,
        fileTypes: { ...state.fileTypes, [fileType]: state.fileTypes[fileType] + 1 },
        detectionHistory,
        dailyUploads: dailyUploads.slice(-30),
        processingTimes: [...state.processingTimes.slice(-99), processingTime],
        averageConfidence: ((state.averageConfidence * state.totalFilesAnalyzed) + confidence) / (state.totalFilesAnalyzed + 1)
      };
      
    case 'ERROR_OCCURRED':
      return { ...state, errorCount: state.errorCount + 1 };
      
    default:
      return state;
  }
};

export const AnalyticsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(analyticsReducer, initialState);
  
  const trackFileAnalysis = (result, fileType, processingTime, confidence) => {
    dispatch({ type: 'FILE_ANALYZED', payload: { result, fileType, processingTime, confidence } });
  };
  
  const trackError = () => {
    dispatch({ type: 'ERROR_OCCURRED' });
  };
  
  return (
    <AnalyticsContext.Provider value={{ ...state, trackFileAnalysis, trackError }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};