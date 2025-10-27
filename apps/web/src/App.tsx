import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import ViewerPage from './pages/ViewerPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { TimerContextProvider, MinimalTimerPage, firebaseSessionRepository, webNotificationService } from './features/new-timer';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <Routes>
          <Route path="/" element={<ViewerPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/timer" 
            element={
              <TimerContextProvider>
                <MinimalTimerPage
                  sessionRepository={firebaseSessionRepository}
                  notificationService={webNotificationService}
                />
              </TimerContextProvider>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;