import React, { useState, useEffect } from 'react';
import Manifest from '@mnfst/sdk';
import LandingPage from './screens/LandingPage';
import DashboardPage from './screens/DashboardPage';
import config from './constants.js';
import { testBackendConnection } from './services/apiService.js';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [isLoading, setIsLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);

  const manifest = new Manifest({ appId: config.APP_ID, baseURL: config.BACKEND_URL });

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 [APP] Starting backend connection test...');
      const connectionResult = await testBackendConnection();
      setBackendConnected(connectionResult.success);

      if (connectionResult.success) {
        console.log('✅ [APP] Backend connection successful. Checking auth status...');
        try {
          const currentUser = await manifest.from('User').me();
          setUser(currentUser);
          setCurrentScreen('dashboard');
        } catch (error) {
          console.log('ℹ️ [APP] No active session found.');
          setUser(null);
          setCurrentScreen('landing');
        }
      } else {
        console.error('❌ [APP] Backend connection failed. App may not work correctly.');
        console.error('❌ [APP] Connection error:', connectionResult.error);
      }
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      await manifest.login(email, password);
      const loggedInUser = await manifest.from('User').me();
      setUser(loggedInUser);
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  const handleLogout = async () => {
    await manifest.logout();
    setUser(null);
    setCurrentScreen('landing');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-600">Initializing App...</p>
        </div>
      );
    }

    if (currentScreen === 'landing') {
      return <LandingPage onLogin={handleLogin} />;
    }

    if (currentScreen === 'dashboard' && user) {
      return <DashboardPage user={user} onLogout={handleLogout} manifest={manifest} />;
    }

    return <LandingPage onLogin={handleLogin} />;
  };

  return (
    <div>
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${backendConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-sm text-gray-600 font-medium">
          {backendConnected ? 'Backend Connected' : 'Backend Disconnected'}
        </span>
      </div>
      {renderContent()}
    </div>
  );
}

export default App;
