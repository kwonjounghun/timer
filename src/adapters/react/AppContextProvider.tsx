import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppContext } from '../../business/AppContext';

interface AppContextProviderProps {
  children: ReactNode;
}

const AppContextReact = createContext<AppContext | null>(null);

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const [appContext] = useState(() => new AppContext());
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = appContext.subscribe(() => {
      forceUpdate({});
    });

    return () => {
      unsubscribe();
      appContext.destroy();
    };
  }, [appContext]);

  return (
    <AppContextReact.Provider value={appContext}>
      {children}
    </AppContextReact.Provider>
  );
};

export const useAppContext = (): AppContext => {
  const context = useContext(AppContextReact);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
};