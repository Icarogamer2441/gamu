'use client';

import { useState, useCallback, memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chat } from './components/Chat';

const APIKeyInput = memo(({ value, onChange, isVisible, onToggle }: {
  value: string;
  onChange: (value: string) => void;
  isVisible: boolean;
  onToggle: () => void;
}) => (
  <div className="relative mb-4">
    <input
      type={isVisible ? "text" : "password"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#1a1a1a] rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
      placeholder="Enter your Google API Key"
    />
    <button
      onClick={onToggle}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
    >
      {isVisible ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      )}
    </button>
  </div>
));

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiModel, setApiModel] = useState('gemini-1.5-pro-002');

  // Load saved values from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('apiKey');
    const savedApiModel = localStorage.getItem('apiModel');
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedApiModel) setApiModel(savedApiModel);
  }, []);

  // Save values to localStorage whenever they change
  const handleApiKeyChange = useCallback((value: string) => {
    setApiKey(value);
    localStorage.setItem('apiKey', value);
  }, []);

  const handleApiModelChange = useCallback((value: string) => {
    setApiModel(value);
    localStorage.setItem('apiModel', value);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (initialPrompt.trim() && apiKey.trim()) {
        setShowChat(true);
      }
    }
  }, [initialPrompt, apiKey]);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInitialPrompt(e.target.value);
  }, []);

  const handleBack = useCallback(() => setShowChat(false), []);

  if (showChat) {
    return <Chat 
      initialPrompt={initialPrompt} 
      onBack={handleBack} 
      apiKey={apiKey}
      apiModel={apiModel}
    />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-4 pt-20 relative">
      <a
        href="https://github.com/Icarogamer2441/gamu"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
      >
        <svg
        height="24"
        width="24"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="transition-transform duration-200 hover:scale-110"
        >
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        <span className="hidden sm:inline">View on GitHub</span>
      </a>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4">What do you want to build?</h1>
          <p className="text-gray-400 text-lg">Prompt, run, edit, and deploy full-stack web apps.</p>
        </motion.div>

        <div className="mb-8">
          <APIKeyInput
            value={apiKey}
            onChange={handleApiKeyChange}
            isVisible={showApiKey}
            onToggle={() => setShowApiKey(!showApiKey)}
          />

          <select
            value={apiModel}
            onChange={(e) => handleApiModelChange(e.target.value)}
            className="w-full mb-4 bg-[#1a1a1a] rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="gemini-1.5-flash-002">Gemini 1.5 Flash</option>
            <option value="gemini-1.5-pro-002">Gemini 1.5 Pro</option>
            <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
          </select>

          <textarea
            value={initialPrompt}
            onChange={handlePromptChange}
            onKeyPress={handleKeyPress}
            className="w-full h-32 bg-[#1a1a1a] rounded-lg p-4 text-white resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder={apiKey ? "How can I help you today?" : "Please enter your API key first"}
            disabled={!apiKey}
          />
        </div>
      </div>
    </div>
  );
}