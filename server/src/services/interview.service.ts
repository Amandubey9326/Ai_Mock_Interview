import prisma from '../lib/prisma';
import type { Role, Difficulty } from '@prisma/client';
import * as aiService from './ai.service';

export async function createSession(userId: string, role: Role, difficulty: Difficulty) {
  const interview = await prisma.interview.create({
    data: { userId, role, difficulty },
  });

  return { id: interview.id };
}

export async function generateQuestion(interviewId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { questions: { select: { question: true } } },
  });

  if (!interview) {
    const error = new Error('Interview not found');
    (error as any).status = 404;
    throw error;
  }

  const previousQuestions = interview.questions.map((q) => q.question);
  const aiResult = await aiService.generateQuestion(interview.role, interview.difficulty, previousQuestions);

  const question = await prisma.interviewQuestion.create({
    data: {
      interviewId,
      question: aiResult.question,
    },
  });

  return {
    id: question.id,
    interviewId: question.interviewId,
    question: question.question,
    type: aiResult.type || 'descriptive',
    options: aiResult.options,
    correctAnswer: aiResult.correctAnswer,
  };
}

export async function submitAnswer(questionId: string, answer: string) {
  const question = await prisma.interviewQuestion.findUnique({
    where: { id: questionId },
    include: { interview: true },
  });

  if (!question) {
    const error = new Error('Question not found');
    (error as any).status = 404;
    throw error;
  }

  const evaluation = await aiService.evaluateAnswer(question.question, answer);

  const updated = await prisma.interviewQuestion.update({
    where: { id: questionId },
    data: {
      userAnswer: answer,
      aiFeedback: {
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        improvements: evaluation.improvements,
      },
      score: evaluation.score,
    },
  });

  return {
    id: updated.id,
    question: updated.question,
    userAnswer: updated.userAnswer,
    score: updated.score,
    aiFeedback: updated.aiFeedback,
  };
}

export async function listUserInterviews(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [interviews, total] = await Promise.all([
    prisma.interview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.interview.count({ where: { userId } }),
  ]);

  return { interviews, total };
}

export async function getInterviewDetail(interviewId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { questions: true },
  });

  if (!interview) {
    const error = new Error('Interview not found');
    (error as any).status = 404;
    throw error;
  }

  return interview;
}
