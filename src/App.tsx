import React from 'react';
import SalesGrid from './components/SalesGrid';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sales Analytics Dashboard</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <SalesGrid />
        </div>
      </div>
    </div>
  );
}

export default App;