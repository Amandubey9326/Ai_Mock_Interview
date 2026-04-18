import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ScoreIndicator from '../components/ScoreIndicator';
import FeedbackCard from '../components/FeedbackCard';
import { useToast } from '../components/Toast';
import { listInterviews, getInterviewDetail } from '../api/interviews';
import type { InterviewSession, InterviewDetail } from '../types';

const PAGE_SIZE = 10;

const difficultyColors: Record<string, string> = {
  Easy: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  Medium: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
  Hard: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<InterviewDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    listInterviews(page, PAGE_SIZE)
      .then((res) => {
        setSessions(res.interviews);
        setTotal(res.total);
      })
      .catch(() => {
        showToast('Failed to load interview history.', 'error');
      })
      .finally(() => setLoading(false));
  }, [page, showToast]);

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(id);
    setDetailLoading(true);
    try {
      const d = await getInterviewDetail(id);
      setDetail(d);
    } catch {
      setDetail(null);
      showToast('Failed to load session details.', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const exportPDF = (session: InterviewSession, interviewDetail: InterviewDetail) => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;

    const addText = (text: string, fontSize: number, isBold = false, color: [number, number, number] = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, maxWidth);
      for (const line of lines) {
        if (y > 270) { doc.addPage(); y = margin; }
        doc.text(line, margin, y);
        y += fontSize * 0.5;
      }
      y += 2;
    };

    addText('HireMind AI - Interview Report', 18, true, [79, 70, 229]);
    y += 4;
    addText(`Role: ${session.role}`, 12, true);
    addText(`Difficulty: ${session.difficulty}`, 12);
    addText(`Date: ${new Date(session.createdAt).toLocaleDateString()}`, 12);
    y += 6;

    interviewDetail.questions.forEach((q, idx) => {
      addText(`Question ${idx + 1}: ${q.question}`, 11, true);
      if (q.userAnswer) addText(`Answer: ${q.userAnswer}`, 10, false, [55, 65, 81]);
      if (q.score !== null) addText(`Score: ${q.score}/10`, 10, true, [79, 70, 229]);
      if (q.aiFeedback) {
        if (q.aiFeedback.strengths.length) addText(`Strengths: ${q.aiFeedback.strengths.join(', ')}`, 9, false, [22, 163, 74]);
        if (q.aiFeedback.weaknesses.length) addText(`Weaknesses: ${q.aiFeedback.weaknesses.join(', ')}`, 9, false, [234, 179, 8]);
        if (q.aiFeedback.improvements.length) addText(`Improvements: ${q.aiFeedback.improvements.join(', ')}`, 9, false, [59, 130, 246]);
      }
      y += 4;
    });

    doc.save(`interview-${session.role}-${session.difficulty}-${new Date(session.createdAt).toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
        >
          Interview History
        </motion.h1>

        {loading && <LoadingSpinner size="lg" />}

        {!loading && sessions.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">No past sessions found.</p>
        )}

        {!loading && sessions.length > 0 && (
          <>
            <ul className="space-y-3">
              {sessions.map((s, i) => {
                const isExpanded = expandedId === s.id;
                return (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Gradient accent bar */}
                    <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <button
                      onClick={() => toggleExpand(s.id)}
                      className="w-full text-left px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900 dark:text-white">{s.role}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${difficultyColors[s.difficulty] || 'bg-indigo-100 text-indigo-700'}`}>
                          {s.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                        <motion.span
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-gray-400"
                        >
                          ▼
                        </motion.span>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700">
                            {detailLoading && <LoadingSpinner size="sm" />}
                            {!detailLoading && detail && detail.id === s.id && (
                              <div className="mt-4 space-y-6">
                                {detail.questions.length === 0 && (
                                  <p className="text-gray-500 dark:text-gray-400 text-sm">No questions in this session.</p>
                                )}
                                {detail.questions.map((q, idx) => (
                                  <div key={q.id} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700/50">
                                    <div className="flex items-start justify-between mb-2">
                                      <h3 className="font-medium text-gray-900 dark:text-white">
                                        Q{idx + 1}: {q.question}
                                      </h3>
                                      {q.score !== null && <ScoreIndicator score={q.score} />}
                                    </div>
                                    {q.userAnswer && (
                                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-2 mb-3">
                                        <span className="font-medium">Your answer:</span> {q.userAnswer}
                                      </p>
                                    )}
                                    {q.aiFeedback && (
                                      <div className="grid gap-3 sm:grid-cols-3">
                                        <FeedbackCard title="Strengths" items={q.aiFeedback.strengths} variant="success" />
                                        <FeedbackCard title="Weaknesses" items={q.aiFeedback.weaknesses} variant="warning" />
                                        <FeedbackCard title="Improvements" items={q.aiFeedback.improvements} variant="info" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {detail.questions.length > 0 && (
                                  <button
                                    onClick={() => exportPDF(s, detail)}
                                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export PDF
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
