import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import type { AIQuestionResult, AIEvaluationResult, AIResumeResult } from '../types';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemma-3n-e4b-it' });

function handleAIError(err: any): never {
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

function parseMCQFromText(text: string): AIQuestionResult | null {
  // Match patterns like "A) option" or "A. option" or "a) option"
  const optionPattern = /[A-Da-d][).]\s*.+/g;
  const matches = text.match(optionPattern);
  
  if (!matches || matches.length < 3) return null;
  
  // Extract the question part (everything before the first option)
  const firstOptionIndex = text.search(/\s*[A-Da-d][).]\s*/);
  if (firstOptionIndex <= 0) return null;
  
  const question = text.substring(0, firstOptionIndex).trim();
  const options = matches.map(m => m.replace(/^[A-Da-d][).]\s*/, '').trim());
  
  // Try to find correct answer mention
  const correctMatch = text.match(/correct\s*(?:answer|option)?\s*(?:is)?\s*:?\s*([A-Da-d])/i);
  const correctAnswer = correctMatch ? correctMatch[1].toUpperCase() : 'A';
  
  return {
    question,
    type: 'mcq',
    options,
    correctAnswer,
  };
}

function cleanMCQQuestion(question: string): string {
  // Remove options embedded in question text (A) ... B) ... etc)
  return question.replace(/\s*[A-Da-d][).]\s*.+$/s, '').trim();
}

export async function generateQuestion(
  role: string,
  difficulty: string,
  previousQuestions: string[] = [],
  company?: string
): Promise<AIQuestionResult> {
  try {
    const isQARole = role === 'QAManual' || role === 'QAAutomation';
    const roleLabel = role === 'QAManual' ? 'QA Manual Testing' : role === 'QAAutomation' ? 'QA Automation Testing' : role;
    
    const companyContext = company ? `\n\nTailor the question to match ${company}'s interview style and the kind of problems they typically ask.` : '';
    
    const avoidList = previousQuestions.length > 0
      ? `\n\nDo NOT repeat or rephrase any of these previously asked questions:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nGenerate a completely different question on a different topic.`
      : '';

    const prompt = `Generate a ${difficulty} level ${roleLabel} interview question. Randomly choose between MCQ (objective) or descriptive. Prefer MCQ more often.

If MCQ, return EXACTLY this JSON format (4 options, no A/B/C/D prefix in options):
{"type":"mcq","question":"Your question text here?","options":["Option 1","Option 2","Option 3","Option 4"],"correctAnswer":"A"}

If descriptive, return:
{"type":"descriptive","question":"Your question text here"}

IMPORTANT RULES:
- For MCQ, the "question" field must contain ONLY the question text, NOT the options.
- The options must be in the "options" array as plain strings without A/B/C/D prefixes.
- "correctAnswer" must be one of: "A", "B", "C", "D" corresponding to the option index.
- Return ONLY raw JSON. No markdown, no code blocks, no explanation.${avoidList}${companyContext}`;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    if (!content) {
      const error = new Error('AI service returned empty response');
      (error as any).status = 503;
      throw error;
    }

    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    if (parsed.type === 'mcq' && Array.isArray(parsed.options) && parsed.options.length >= 2) {
      return {
        question: cleanMCQQuestion(parsed.question),
        type: 'mcq',
        options: parsed.options,
        correctAnswer: parsed.correctAnswer || 'A',
      };
    }
    
    // Fallback: check if the AI stuffed options into the question text
    const fallback = parseMCQFromText(parsed.question || cleaned);
    if (fallback) return fallback;
    
    return { question: parsed.question, type: 'descriptive' };
  } catch (err: any) {
    handleAIError(err);
  }
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  role?: string
): Promise<AIEvaluationResult> {
  try {
    const isBehavioral = role === 'HR' || /tell me about a time|describe a situation|give an example/i.test(question);

    const starInstruction = isBehavioral
      ? `\n- starAnalysis: object with { situation: boolean, task: boolean, action: boolean, result: boolean, feedback: string } indicating if the answer covers each STAR component`
      : '';

    const prompt = `Evaluate the following interview answer. Return ONLY a JSON object (no markdown, no code blocks) with these fields:
- score: integer from 1 to 10
- strengths: array of strings
- weaknesses: array of strings  
- improvements: array of strings
- modelAnswer: string (a concise ideal answer to this question, 2-4 sentences)
- confidenceScore: integer from 1 to 10 (based on language certainty — penalize hedging words like "maybe", "I think", "probably", "I guess")
- answerStructure: object with { context: integer 0-100, solution: integer 0-100, examples: integer 0-100 } representing what percentage of the answer is context/background, actual solution/answer, and examples/evidence${starInstruction}

Question: ${question}

Answer: ${answer}`;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    if (!content) {
      const error = new Error('AI service returned empty response');
      (error as any).status = 503;
      throw error;
    }

    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (typeof parsed.score !== 'number' || parsed.score < 1 || parsed.score > 10) {
      const error = new Error('AI returned invalid score');
      (error as any).status = 500;
      throw error;
    }

    // Detect filler words in the answer
    const fillerPatterns = /\b(um|uh|like|you know|basically|actually|literally|sort of|kind of|i mean|i guess|i think maybe)\b/gi;
    const fillerMatches = answer.match(fillerPatterns) || [];

    return {
      score: parsed.score,
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      improvements: parsed.improvements || [],
      modelAnswer: parsed.modelAnswer || undefined,
      starAnalysis: parsed.starAnalysis || undefined,
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : undefined,
      fillerWords: fillerMatches.length > 0 ? fillerMatches : undefined,
      answerStructure: parsed.answerStructure || undefined,
    };
  } catch (err: any) {
    handleAIError(err);
  }
}

export async function analyzeResume(
  text: string
): Promise<AIResumeResult> {
  try {
    const prompt = `Analyze the following resume text thoroughly. Return ONLY a JSON object (no markdown, no code blocks) with these fields:
- overall_score: integer from 1 to 100 rating the resume quality
- strengths: array of strings (what the resume does well)
- weaknesses: array of strings (what needs improvement)
- missing_skills: array of strings (skills the candidate should add)
- suggestions: array of strings (specific actionable improvements)
- ats_tips: array of strings (tips to pass Applicant Tracking Systems)
- recommended_roles: array of strings (job roles this resume is best suited for)

Resume:
${text}`;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    if (!content) {
      const error = new Error('AI service returned empty response');
      (error as any).status = 503;
      throw error;
    }

    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as AIResumeResult;

    return {
      overall_score: typeof parsed.overall_score === 'number' ? parsed.overall_score : 50,
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      missing_skills: parsed.missing_skills || [],
      suggestions: parsed.suggestions || [],
      ats_tips: parsed.ats_tips || [],
      recommended_roles: parsed.recommended_roles || [],
    };
  } catch (err: any) {
    handleAIError(err);
  }
}
