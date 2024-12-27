'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { CodeBlock } from './CodeBlock';
import { ChatMessage } from './ChatMessage';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  isGenerating?: boolean;
}

interface ChatProps {
  initialPrompt?: string;
  onBack: () => void;
  apiKey: string;
  apiModel: string;
}

// Memoized loading message component
const LoadingMessage = memo(() => (
  <div className="flex items-center space-x-2 text-gray-400">
    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
    <span>AI is generating your code...</span>
  </div>
));

// Memoized button component
const IconButton = memo(({ onClick, disabled, title, children }: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="p-2 hover:bg-[#2a2a2a] rounded text-gray-400 disabled:opacity-50"
    title={title}
  >
    {children}
  </button>
));

export function Chat({ initialPrompt = '', onBack, apiKey, apiModel }: ChatProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [generating, setGenerating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // Auto-scroll effect
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTextareaInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const maxHeight = 4 * 64;
    const baseHeight = 64;
    
    textarea.style.height = 'auto';
    
    if (!textarea.value.trim()) {
      textarea.style.height = `${baseHeight}px`;
    } else {
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${Math.max(baseHeight, newHeight)}px`;
    }
    
    setPrompt(textarea.value);
  }, []);

  const improvePrompt = useCallback(async () => {
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    const chatHistory = messages.map(m => `${m.isUser ? 'User' : 'AI'}: ${m.content}`).join('\n');
    
    try {
      const response = await fetch('/api/improve-prompt', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
          'X-API-MODEL': apiModel
        },
        body: JSON.stringify({ prompt, chatHistory }),
      });

      if (!response.ok) {
        throw new Error('Failed to improve prompt');
      }

      const data = await response.json();
      setPrompt(data.improvedPrompt);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setGenerating(false);
    }
  }, [prompt, generating, messages, apiKey, apiModel]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = e.target?.result as string;
        setPrompt(prev => prev + `\n[Image attached: ${file.name}]`);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select only PNG, JPG or JPEG files');
    }
  }, []);

  const generateCode = useCallback(async () => {
    if (!prompt.trim() || generating) return;

    const userMessage = prompt;
    setPrompt('');
    setGenerating(true);
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      isUser: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
          'X-API-MODEL': apiModel
        },
        body: JSON.stringify({ 
          prompt: userMessage,
          chatHistory: messages 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { 
        id: Date.now().toString(),
        content: data.text, 
        isUser: false 
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `Error: ${error.message}. Please check your API key and try again.`,
        isUser: false
      }]);
    } finally {
      setGenerating(false);
    }
  }, [prompt, generating, messages, apiKey, apiModel]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateCode();
    }
  }, [generateCode]);

  const continueResponse = useCallback(async () => {
    if (generating || messages.length === 0) return;
    
    const lastAiMessage = [...messages].reverse().find(m => !m.isUser);
    if (!lastAiMessage) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
          'X-API-MODEL': apiModel
        },
        body: JSON.stringify({ 
          prompt: `IMPORTANT: Do NOT repeat any previous code. Start EXACTLY where you left off and ONLY provide the new additions/changes to continue from this point: ${lastAiMessage.content}` 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to continue response');
      }

      const data = await response.json();
      
      setMessages(prev => prev.map(msg => 
        msg.id === lastAiMessage.id 
          ? { ...msg, content: msg.content + '\n\n' + data.text.trim() }
          : msg
      ));
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `Error: ${error.message}. Please check your API key and try again.`,
        isUser: false
      }]);
    } finally {
      setGenerating(false);
    }
  }, [generating, messages, apiKey, apiModel]);

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b border-gray-800 bg-[#0a0a0a] p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          
          <button
            onClick={continueResponse}
            disabled={generating || messages.length === 0}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Continue
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {messages.map((message) => (
          <ChatMessage 
            key={message.id}
            content={message.content} 
            isUser={message.isUser} 
            isGenerating={message.isGenerating}
          />
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-gray-800 bg-[#0a0a0a] p-4 fixed bottom-0 left-0 right-0">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={handleTextareaInput}
              onKeyPress={handleKeyPress}
              disabled={generating}
              className="w-full bg-[#1a1a1a] rounded-lg p-4 pr-24 text-white min-h-[64px] max-h-[256px] resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
              placeholder="How can I help you today?"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex space-x-2">
              <IconButton
                onClick={improvePrompt}
                disabled={generating || !prompt.trim()}
                title="Improve prompt with AI"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </IconButton>
              
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept=".png,.jpg,.jpeg"
                className="hidden"
              />
              
              <IconButton
                onClick={() => imageInputRef.current?.click()}
                title="Upload image (PNG, JPG, JPEG)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      {generating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-[#1a1a1a] px-4 py-2 rounded-full shadow-lg"
        >
          <LoadingMessage />
        </motion.div>
      )}
    </div>
  );
}