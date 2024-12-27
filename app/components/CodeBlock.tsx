import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState, useEffect } from 'react';

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen]);

  if (showPreview && language === 'html') {
    const previewCode = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>
          ${code}
        </body>
      </html>
    `;

    return (
      <div className="relative">
        <div className={`absolute ${isFullscreen ? 'fixed top-4 right-4 z-[9999]' : 'top-2 right-2'} flex gap-2`}>
          <button
            onClick={() => setShowPreview(false)}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
          >
            Code
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>

        <iframe
          srcDoc={previewCode}
          className={isFullscreen ? 'fixed inset-0 w-screen h-screen z-[9998] bg-white' : 'w-full h-[600px] rounded-md bg-white'}
          title="Preview"
          sandbox="allow-scripts"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        {language === 'html' && (
          <button
            onClick={() => setShowPreview(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
          >
            Preview
          </button>
        )}
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        className="rounded-md !bg-[#1a1a1a] !m-0"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
} 