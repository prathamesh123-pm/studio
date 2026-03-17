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

interface SurveyStore {
  surveys: SurveyRecord[];
  addSurvey: (survey: Omit<SurveyRecord, 'id' | 'timestamp'>) => void;
  currentUser: { name: string; id: string } | null;
  setCurrentUser: (user: { name: string; id: string } | null) => void;
}

// Minimalist zustand implementation logic manually since we can't install zustand easily if it's not in package.json
// Instead using a simpler version with React Context or standard local storage for this demo.
// Since package.json is provided and doesn't have zustand, I will implement a custom hook for the store using localStorage.

export const useSurveyStore = () => {
  // Mock store logic
  const getSurveys = (): SurveyRecord[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('pashudhan_surveys');
    return data ? JSON.parse(data) : [];
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

  return { getSurveys, addSurvey };
};
