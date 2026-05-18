import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Servers from './components/Servers';
import Backups from './components/Backups';
import Policies from './components/Policies';
import Recovery from './components/Recovery';

const App = () => {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'servers':   return <Servers />;
      case 'backups':   return <Backups />;
      case 'policies':  return <Policies />;
      case 'recovery':  return <Recovery />;
      default:          return <Dashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050810', color: '#e8eeff', fontFamily: "'Inter', sans-serif" }}>
      <Navigation activePage={activePage} setActivePage={setActivePage} />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', overflowY: 'auto' }}>
        {renderPage()}
      </main>
    </div>
  );
};

export default App;