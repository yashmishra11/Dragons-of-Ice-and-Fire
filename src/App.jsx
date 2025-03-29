import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage'; 
import DragonDetail from './components/DragonDetail';

const App = () => {
  return (
    <Router>
      <div className="app">
        <div className='heading'>
        </div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dragon/:name" element={<DragonDetail />} /> 
        </Routes>
      </div>
    </Router>
  );
};

export default App;
