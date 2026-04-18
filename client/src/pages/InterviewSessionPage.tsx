import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ScoreIndicator from '../components/ScoreIndicator';
import FeedbackCard from '../components/FeedbackCard';
import { useToast } from '../components/Toast';
import { generateQuestion, submitAnswer, getInterviewDetail } from '../api/interviews';
import type { QuestionResponse, EvaluationResponse, Difficulty } from '../types';

const TIMER_SECONDS = 5 * 60;

interface AnsweredQuestion {
  question: string;
  score: number;
  timeSpent: number;
}

function AIAvatar() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="inline-block" aria-hidden="true">
      <rect x="3" y="4" width="18" height="14" rx="3" className="fill-indigo-100 dark:fill-indigo-900/50 stroke-indigo-500 dark:stroke-indigo-400" strokeWidth="1.5" />
      <circle cx="9" cy="11" r="1.5" className="fill-indigo-500 dark:fill-indigo-400" />
      <circle cx="15" cy="11" r="1.5" className="fill-indigo-500 dark:fill-indigo-400" />
      <path d="M10 14.5C10 14.5 11 15.5 12 15.5C13 15.5 14 14.5 14 14.5" className="stroke-indigo-500 dark:stroke-indigo-400" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="1" x2="12" y2="4" className="stroke-indigo-400 dark:stroke-indigo-500" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="1" r="1" className="fill-indigo-400 dark:fill-indigo-500" />
    </svg>
  );
}

function ScoreReaction({ score }: { score: number }) {
  let emoji: string;
  let text: string;

  if (score >= 8) {
    emoji = '🎉';
    text = 'Excellent!';
  } else if (score >= 5) {
    emoji = '👍';
    text = 'Good job!';
  } else {
    emoji = '💪';
    text = 'Keep practicing!';
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className="flex items-center gap-2"
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{text}</span>
    </motion.div>
  );
}

const difficultyBorderColors: Record<string, string> = {
  Easy: 'border-t-green-400 dark:border-t-green-500',
  Medium: 'border-t-yellow-400 dark:border-t-yellow-500',
  Hard: 'border-t-red-400 dark:border-t-red-500',
};

function useCountdown(seconds: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const reset = useCallback(() => {
    setRemaining(seconds);
  }, [seconds]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onExpireRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { remaining, reset, stop };
}

function TimerDisplay({ remaining }: { remaining: number }) {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  let colorClass = 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
  if (remaining <= 60) {
    colorClass = 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 animate-pulse';
  } else if (remaining <= 180) {
    colorClass = 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
  }

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-lg font-bold ${colorClass}`}>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}

function SessionSummary({ answered, onBack }: { answered: AnsweredQuestion[]; onBack: () => void }) {
  if (answered.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm text-center"
      >
        <p className="text-gray-500 dark:text-gray-400 mb-4">No questions answered in this session.</p>
        <button onClick={onBack} className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          Back to Dashboard
        </button>
      </motion.div>
    );
  }

  const scores = answered.map((a) => a.score);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const bestScore = Math.max(...scores);
  const worstScore = Math.min(...scores);
  const totalTime = answered.reduce((a, b) => a + b.timeSpent, 0);
  const mins = Math.floor(totalTime / 60);
  const secs = totalTime % 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm"
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Session Summary 🎯</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard label="Questions" value={String(answered.length)} />
        <SummaryCard label="Avg Score" value={avgScore.toFixed(1)} />
        <SummaryCard label="Best Score" value={String(bestScore)} />
        <SummaryCard label="Worst Score" value={String(worstScore)} />
        <SummaryCard label="Time Spent" value={`${mins}m ${secs}s`} />
      </div>
      <button
        onClick={onBack}
        className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
      >
        Back to Dashboard
      </button>
    </motion.div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}

export default function InterviewSessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [question, setQuestion] = useState<QuestionResponse | null>(null);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [interviewDifficulty, setInterviewDifficulty] = useState<Difficulty | null>(null);
  const questionStartTime = useRef(Date.now());

  const isMCQ = question?.type === 'mcq' && question.options && question.options.length > 0;

  // Refs for timer auto-submit
  const answerRef = useRef('');
  const selectedOptionRef = useRef('');
  const questionRef = useRef<QuestionResponse | null>(null);
  const evaluationRef = useRef<EvaluationResponse | null>(null);
  const submittingRef = useRef(false);

  answerRef.current = answer;
  selectedOptionRef.current = selectedOption;
  questionRef.current = question;
  evaluationRef.current = evaluation;
  submittingRef.current = submitting;

  // Fetch interview details to get difficulty
  useEffect(() => {
    if (!id) return;
    getInterviewDetail(id)
      .then((detail) => {
        setInterviewDifficulty(detail.difficulty);
      })
      .catch(() => {
        // Non-critical — difficulty accent just won't show
      });
  }, [id]);

  const handleTimerExpire = useCallback(() => {
    if (evaluationRef.current || submittingRef.current || !questionRef.current || !id) return;
    showToast("Time's up! Auto-submitting your answer.", 'error');
    const q = questionRef.current;
    const isMcq = q?.type === 'mcq' && q.options && q.options.length > 0;
    const submittedAnswer = isMcq ? selectedOptionRef.current : answerRef.current.trim();
    if (!submittedAnswer) {
      doSubmit(id, q.id, '(No answer provided - time expired)');
    } else {
      doSubmit(id, q.id, submittedAnswer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const { remaining, reset: resetTimer, stop: stopTimer } = useCountdown(TIMER_SECONDS, handleTimerExpire);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      disableForReducedMotion: true,
    });
  };

  const doSubmit = async (interviewId: string, questionId: string, submittedAnswer: string) => {
    setSubmitting(true);
    try {
      const result = await submitAnswer(interviewId, questionId, { answer: submittedAnswer });
      setEvaluation(result);
      stopTimer();

      const timeSpent = Math.round((Date.now() - questionStartTime.current) / 1000);
      setAnsweredQuestions((prev) => [...prev, {
        question: result.question,
        score: result.score,
        timeSpent,
      }]);

      if (result.score >= 8) {
        triggerConfetti();
      }

      showToast('Answer evaluated!', 'success');
    } catch {
      showToast('Failed to evaluate answer. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchQuestion = async () => {
    if (!id) return;
    setLoadingQuestion(true);
    setEvaluation(null);
    setAnswer('');
    setSelectedOption('');
    resetTimer();
    questionStartTime.current = Date.now();
    try {
      const q = await generateQuestion(id);
      setQuestion(q);
      setQuestionNumber((prev) => (prev === 1 && answeredQuestions.length === 0 ? 1 : prev + 1));
    } catch {
      showToast('Failed to generate question. Please try again.', 'error');
    } finally {
      setLoadingQuestion(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmitAnswer = async () => {
    if (!id || !question) return;
    const submittedAnswer = isMCQ ? selectedOption : answer.trim();
    if (!submittedAnswer) return;
    stopTimer();
    await doSubmit(id, question.id, submittedAnswer);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // N key to go to next question (only when feedback is shown and not typing in an input)
      if (e.key === 'n' || e.key === 'N') {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (evaluationRef.current && !submittingRef.current) {
          e.preventDefault();
          fetchQuestion();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  const difficultyBorder = interviewDifficulty ? (difficultyBorderColors[interviewDifficulty] || '') : '';

  if (showSummary) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <SessionSummary answered={answeredQuestions} onBack={() => navigate('/dashboard')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interview Session</h1>
          <div className="flex items-center gap-3">
            {!loadingQuestion && question && !evaluation && (
              <TimerDisplay remaining={remaining} />
            )}
            <button
              onClick={() => { stopTimer(); setShowSummary(true); }}
              className="bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-4 rounded-lg font-medium transition-colors"
            >
              End Interview
            </button>
          </div>
        </div>

        {loadingQuestion ? (
          <LoadingSpinner size="lg" />
        ) : question ? (
          <div className="space-y-6">
            {/* Question counter */}
            <motion.div
              key={questionNumber}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400"
            >
              Question {questionNumber}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm ${difficultyBorder ? `border-t-4 ${difficultyBorder}` : ''}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <AIAvatar />
                <h2 className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Question</h2>
                {isMCQ && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                    Objective
                  </span>
                )}
              </div>
              <p className="text-gray-800 dark:text-gray-200 text-lg">{question.question}</p>
            </motion.div>

            {!evaluation ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                {isMCQ ? (
                  <div className="space-y-3">
                    {question.options!.map((option, idx) => {
                      const label = optionLabels[idx] || String(idx + 1);
                      const isSelected = selectedOption === `${label}. ${option}`;
                      return (
                        <label
                          key={idx}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                          } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="radio"
                            name="mcq-option"
                            value={`${label}. ${option}`}
                            checked={isSelected}
                            onChange={(e) => setSelectedOption(e.target.value)}
                            disabled={submitting}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="font-semibold text-gray-500 dark:text-gray-400 min-w-[24px]">{label}.</span>
                          <span className="text-gray-800 dark:text-gray-200">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={handleTextareaKeyDown}
                    placeholder="Type your answer here..."
                    rows={6}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-4 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y placeholder-gray-400 dark:placeholder-gray-500"
                    disabled={submitting}
                  />
                )}
                <div>
                  <motion.button
                    onClick={handleSubmitAnswer}
                    disabled={isMCQ ? !selectedOption || submitting : !answer.trim() || submitting}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? <LoadingSpinner size="sm" /> : 'Submit Answer'}
                  </motion.button>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                    Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to submit
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Score:</span>
                  <ScoreIndicator score={evaluation.score} />
                  <span className="text-sm text-gray-500 dark:text-gray-400">/ 10</span>
                  <AnimatePresence>
                    <ScoreReaction score={evaluation.score} />
                  </AnimatePresence>
                </div>

                {isMCQ && question.correctAnswer && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      Correct Answer: {question.correctAnswer}
                    </span>
                  </div>
                )}

                <FeedbackCard title="Strengths" items={evaluation.aiFeedback.strengths} variant="success" />
                <FeedbackCard title="Weaknesses" items={evaluation.aiFeedback.weaknesses} variant="warning" />
                <FeedbackCard title="Improvements" items={evaluation.aiFeedback.improvements} variant="info" />

                <div>
                  <motion.button
                    onClick={fetchQuestion}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Next Question
                  </motion.button>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                    Press N for next question
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No question available. Please try again.</p>
        )}
      </div>
    </div>
  );
}
