// src/App.js

import React from 'react';
import Orders from './order';

const App = () => {
  return (
    <div className="App">
      <h1>Admin Orders Dashboard</h1>
      {/* Render Orders Component */}
      <Orders />
    </div>
  );
};

export default App;
