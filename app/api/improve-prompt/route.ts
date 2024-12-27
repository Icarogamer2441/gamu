import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PROMPT_IMPROVEMENT_SYSTEM_PROMPT = `
  You are an expert at improving user prompts for web development.
  Given the chat history and current prompt, improve it to be more specific, detailed, and clear.
  Focus on:
  - Technical requirements and constraints
  - Visual design preferences and style
  - User experience and interaction patterns
  - Performance considerations
  - Accessibility needs
  - Responsive design requirements
  
  Return only the improved prompt, no explanations or additional text.
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
      ${PROMPT_IMPROVEMENT_SYSTEM_PROMPT}
      
      Chat History:
      ${chatHistory ? chatHistory.map((m: { isUser: boolean; content: string }) => 
        `${m.isUser ? 'User' : 'AI'}: ${m.content}`).join('\n') : ''}
      
      Current Prompt:
      ${prompt}
      
      Improved Prompt:
    `;

    // Generate improved prompt
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const improvedPrompt = response.text();

    return NextResponse.json({ improvedPrompt });
  } catch (error) {
    console.error('Error in improve-prompt route:', error);
    return NextResponse.json(
      { error: 'Failed to improve prompt' }, 
      { status: 500 }
    );
  }
}