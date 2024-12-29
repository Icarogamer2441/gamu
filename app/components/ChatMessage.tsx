import { motion } from 'framer-motion';
import { CodeBlock } from './CodeBlock';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  isGenerating?: boolean;
  imageData?: string;
}

export function ChatMessage({ content, isUser, isGenerating, imageData }: ChatMessageProps) {
  const processContent = (text: string) => {
    const parts = text.split(/(```[a-z]*\n[\s\S]*?\n```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const language = part.split('\n')[0].replace('```', '') || 'plaintext';
        const code = part
          .split('\n')
          .slice(1, -1)
          .join('\n');
        return (
          <div key={index} className="relative mt-2">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>{language}</span>
              {isGenerating && <span>Generating...</span>}
            </div>
            <CodeBlock code={code} language={language} />
          </div>
        );
      }
      return <p key={index} className="whitespace-pre-wrap text-gray-200">{part}</p>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-gray-800 last:border-0"
    >
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className={`max-w-[85%] ${isUser ? 'bg-blue-600' : 'bg-transparent'} rounded-lg p-4`}>
          {imageData && (
            <div className="mb-4">
              <img 
                src={imageData} 
                alt="Uploaded content"
                className="max-w-full rounded-lg shadow-lg"
              />
            </div>
          )}
          {processContent(content)}
        </div>
      </div>
    </motion.div>
  );
}
