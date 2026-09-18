import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import IDE from './components/ide/IDE';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <div className="App">
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/ide" replace />} />
          <Route path="/ide" element={<IDE />} />
          <Route path="/ide/*" element={<IDE />} />
          {/* <Route path="/ime" element={<IME />} /> */}
          {/* 404 페이지 처리 */}
          <Route path="*" element={<Navigate to="/ide" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}



export default App;