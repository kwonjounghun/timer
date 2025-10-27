import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getTodayString } from '../utils/dateUtils';

interface AppContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  const contextValue: AppContextType = {
    selectedDate,
    setSelectedDate,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
