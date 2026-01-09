/**
 * Main App component
 * Layout for the form builder application
 */

import { FormBuilder } from './components/builder/FormBuilder';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
            <p className="text-sm text-gray-600">Create beautiful forms with ease</p>
          </div>
        </div>
      </header>
      <main className="h-[calc(100vh-73px)]">
        <FormBuilder />
      </main>
    </div>
  );
}

export default App;
