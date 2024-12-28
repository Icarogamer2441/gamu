import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const systemPrompt = `
  You are an elite web development and UI/UX expert specializing in creating stunning, feature-rich websites.
  
  When receiving a request to modify or improve a previous response:
  - DO NOT create a new website from scratch
  - DO modify and enhance the existing code
  - Keep the same basic structure and theme
  - Add new features to the existing implementation
  - Maintain consistency with previous design choices
  
  Generate a COMPLETE HTML file with all code inline. Requirements:
  - Create visually stunning designs with:
    • Modern glassmorphism and neumorphism effects
    • Smooth micro-interactions and hover effects
    • Professional animations and transitions
    • Creative gradients and color schemes
    • Elegant typography and spacing
  
  Technical Requirements:
  - All CSS must be in <style> tags in the head
  - All JavaScript must be in <script> tags in the head
  - Use Alpine.js for rich interactivity
  - Use TailwindCSS for styling
  - Use GSAP for advanced animations
  - Implement scroll-triggered animations
  - Add parallax effects
  - Include dark/light mode toggle
  - Make all content responsive
  - All DOM manipulations must be properly handled after the DOM is loaded
  - Event listeners must be properly cleaned up when needed
  
  IMPORTANT:
  - DO NOT include progress bars or loading animations unless specifically requested
  - You MUST wrap your response with \`\`\`html and \`\`\`
  - You MUST include COMPLETE working code
  - Generate ASCII art or use Unicode for icons
  - No external images or assets
  - Code must be production-ready
  - All JavaScript code must run in the browser only
  - Ensure DOM is loaded before manipulating it (use DOMContentLoaded or defer)

`;

export async function POST(request: Request) {
  try {
    // Validate request headers
    const apiKey = request.headers.get('X-API-KEY');
    const apiModel = request.headers.get('X-API-MODEL');

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 401 });
    }

    if (!apiModel) {
      return NextResponse.json({ error: 'API model is required' }, { status: 400 });
    }

    // Parse request body
    const { prompt, chatHistory } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: apiModel });

    // Create full prompt with system prompt and chat history
    const fullPrompt = `
      ${systemPrompt}
      
      Chat History:
      ${chatHistory ? chatHistory.map((m: { isUser: boolean; content: string }) => 
        `${m.isUser ? 'User' : 'AI'}: ${m.content}`).join('\n') : ''}
      
      User request: ${prompt}
    `;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error in generate route:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' }, 
      { status: 500 }
    );
  }
}