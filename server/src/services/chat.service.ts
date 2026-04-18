import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemma-3n-e4b-it' });

const SYSTEM_PROMPT = `You are HireMind AI's interview preparation assistant.

CRITICAL RULES:
- Answer ONLY what the user asked. Nothing more.
- Be short and direct. 2-4 sentences max for simple questions.
- Do NOT add extra tips, suggestions, or follow-up offers unless asked.
- Do NOT say "I can also help with..." or list your capabilities.
- Use plain text only. No markdown, no **, no *, no #, no backticks.
- For code questions, keep examples minimal and relevant.
- If the answer is a single fact, give just that fact.
- IMPORTANT: When the user says "he", "she", "it", "they", "that", "this", or any pronoun, ALWAYS refer back to the conversation history to understand who or what they mean. Never ask "who do you mean" if the answer is in the previous messages.`;

function stripMarkdown(text: string): string {
  return text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```\w*\n?/g, '').replace(/```/g, '').trim())
    // Remove bold **text** and __text__
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove italic *text* and _text_
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '$1')
    .replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '$1')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove inline code
    .replace(/`(.+?)`/g, '$1')
    // Clean up list markers: *   text -> - text
    .replace(/^\s*\*\s+/gm, '- ')
    // Remove any remaining standalone * at start of lines
    .replace(/^\s*\*\s*/gm, '- ')
    // Remove any remaining ** 
    .replace(/\*\*/g, '')
    // Remove any remaining single * not part of a word
    .replace(/\*/g, '')
    .trim();
}

export async function getChatReply(message: string, history: { role: string; text: string }[] = []): Promise<string> {
  try {
    // Keep last 6 messages in full for immediate context
    // Summarize older messages into a compact context line
    const RECENT_COUNT = 6;
    let conversationContext = SYSTEM_PROMPT + '\n\n';

    if (history.length > RECENT_COUNT) {
      // Summarize older messages into key topics
      const olderMessages = history.slice(0, -RECENT_COUNT);
      const topics = olderMessages
        .filter(m => m.role === 'user')
        .map(m => m.text.slice(0, 60))
        .join(', ');
      if (topics) {
        conversationContext += `[Earlier in this conversation, the user asked about: ${topics}]\n\n`;
      }
    }

    // Add recent messages in full
    const recentHistory = history.slice(-RECENT_COUNT);
    for (const msg of recentHistory) {
      const truncated = msg.text.length > 300 ? msg.text.slice(0, 300) + '...' : msg.text;
      if (msg.role === 'user') {
        conversationContext += `User: ${truncated}\n`;
      } else {
        conversationContext += `Assistant: ${truncated}\n`;
      }
    }
    
    conversationContext += `User: ${message}\n\nIMPORTANT: Use the conversation above to understand context. If the user uses pronouns like "her", "his", "it", "they", resolve them from previous messages. Answer directly.`;

    const result = await model.generateContent(conversationContext);
    const text = result.response.text();

    if (!text) {
      const error = new Error('AI service returned empty response');
      (error as any).status = 503;
      throw error;
    }

    return stripMarkdown(text);
  } catch (err: any) {
    if (err.status === 429) {
      const error = new Error('AI rate limit reached. Please wait a moment and try again.');
      (error as any).status = 429;
      throw error;
    }
    if (err.status && err.status !== 500) throw err;
    const error = new Error('AI service unavailable. Please try again later.');
    (error as any).status = 503;
    throw error;
  }
}
