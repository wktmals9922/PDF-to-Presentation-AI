import React, { useState } from 'react';
import { LogoIcon } from './Icons';

interface ApiKeyManagerProps {
  onKeySubmit: (key: string) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <LogoIcon className="w-12 h-12 text-cyan-400" />
          <h1 className="text-3xl font-bold tracking-tight text-white mt-4">
            PDF to Presentation AI
          </h1>
          <p className="text-slate-400 mt-2 text-center">
            Please enter your Gemini API key to begin.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit}>
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">
              Gemini API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter your API key here"
              required
            />
            <p className="text-xs text-slate-500 mt-2">
              You can get your key from{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                Google AI Studio
              </a>. Your key is stored only in your browser session.
            </p>
            <button
              type="submit"
              className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 text-base font-semibold text-white bg-cyan-600 rounded-lg shadow-md hover:bg-cyan-500 disabled:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-all"
            >
              Save and Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;
