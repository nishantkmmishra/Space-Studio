import Groq from 'groq-sdk';
import 'dotenv/config';
import { logger } from '../lib/logger';

if (!process.env.GROQ_API_KEY) {
  logger.warn('GROQ_API_KEY is missing. AI features will be disabled.');
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const defaultModel = process.env.AI_MODEL || 'llama-3.3-70b-versatile';

export async function askAI(prompt: string, context?: string) {
  try {
    const messages: any[] = [];
    
    if (context) {
      messages.push({ role: 'system', content: `You are the Space Station Intelligence Engine. Context: ${context}` });
    } else {
      messages.push({ role: 'system', content: 'You are the Space Station Intelligence Engine. Be helpful, concise, and maintain a professional yet warm space-themed tone.' });
    }

    messages.push({ role: 'user', content: prompt });

    const response = await groq.chat.completions.create({
      model: defaultModel,
      messages,
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false, // Set to false for the bot's standard reply system
    });

    return response.choices[0].message.content;
  } catch (error: any) {
    logger.error('Groq AI Request Failed', { error: error.message });
    throw error;
  }
}
