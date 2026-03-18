import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SurveyRecord {
  id: string;
  type: 'dairy' | 'farmer';
  timestamp: string;
  surveyorName: string;
  surveyorId: string;
  data: any;
}

export const useSurveyStore = () => {
  const getSurveys = (): SurveyRecord[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('pashudhan_surveys');
    return data ? JSON.parse(data) : [];
  };

  const getSurveyById = (id: string): SurveyRecord | undefined => {
    const surveys = getSurveys();
    return surveys.find(s => s.id === id);
  };

  const addSurvey = (survey: Omit<SurveyRecord, 'id' | 'timestamp'>) => {
    const surveys = getSurveys();
    const newSurvey = {
      ...survey,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('pashudhan_surveys', JSON.stringify([newSurvey, ...surveys]));
    return newSurvey;
  };

  const updateSurvey = (id: string, updatedData: Omit<SurveyRecord, 'id' | 'timestamp'>) => {
    const surveys = getSurveys();
    const updatedSurveys = surveys.map(s => 
      s.id === id ? { ...updatedData, id, timestamp: s.timestamp } : s
    );
    localStorage.setItem('pashudhan_surveys', JSON.stringify(updatedSurveys));
  };

  const deleteSurvey = (id: string) => {
    const surveys = getSurveys();
    const filtered = surveys.filter(s => s.id !== id);
    localStorage.setItem('pashudhan_surveys', JSON.stringify(filtered));
  };

  return { getSurveys, getSurveyById, addSurvey, updateSurvey, deleteSurvey };
};
