import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import FeedbackCard from '../components/FeedbackCard';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../components/Toast';
import { analyzeResume } from '../api/resume';
import type { ResumeAnalysis } from '../types';

function ScoreRing({ score }: { score: number }) {
  const safeScore = Math.max(0, Math.min(100, score || 0));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;
  const color = safeScore >= 75 ? '#22c55e' : safeScore >= 50 ? '#eab308' : '#ef4444';
  const label = safeScore >= 75 ? 'Excellent' : safeScore >= 50 ? 'Good' : 'Needs Work';
  const labelColor = safeScore >= 75 ? 'text-green-600 dark:text-green-400' : safeScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="7"
          className="text-gray-200 dark:text-gray-700" />
        <motion.circle
          cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-bold text-gray-900 dark:text-white"
        >
          {safeScore}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={`text-xs font-semibold ${labelColor}`}
        >
          {label}
        </motion.span>
      </div>
    </div>
  );
}

const loadingMessages = [
  'Reading your resume...',
  'Analyzing content structure...',
  'Checking ATS compatibility...',
  'Evaluating skills and experience...',
  'Generating recommendations...',
];

function AnalyzingState() {
  const [msgIndex, setMsgIndex] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-10 text-center"
    >
      <div className="relative w-20 h-20 mx-auto mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 rounded-full border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400"
        />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">📄</div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-sm font-medium text-gray-600 dark:text-gray-400"
        >
          {loadingMessages[msgIndex]}
        </motion.p>
      </AnimatePresence>
      <div className="flex justify-center gap-1.5 mt-4">
        {loadingMessages.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === msgIndex ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

function StatBadge({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-3 p-3 rounded-xl border ${color}`}
    >
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </motion.div>
  );
}

export default function ResumeAnalyzerPage() {
  usePageTitle('Resume Analyzer');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.type !== 'application/pdf') {
      showToast('Please upload a PDF file only.', 'error');
      return;
    }
    if (selected && selected.size > 10 * 1024 * 1024) {
      showToast('File too large. Max 10MB.', 'error');
      return;
    }
    setFile(selected);
    setResult(null);
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;
    if (dropped.type !== 'application/pdf') {
      showToast('Please upload a PDF file only.', 'error');
      return;
    }
    if (dropped.size > 10 * 1024 * 1024) {
      showToast('File too large. Max 10MB.', 'error');
      return;
    }
    setFile(dropped);
    setResult(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const analysis = await analyzeResume(file);
      setResult({
        overall_score: typeof analysis.overall_score === 'number' ? analysis.overall_score : 50,
        strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
        weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
        missing_skills: Array.isArray(analysis.missing_skills) ? analysis.missing_skills : [],
        suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions : [],
        ats_tips: Array.isArray(analysis.ats_tips) ? analysis.ats_tips : [],
        recommended_roles: Array.isArray(analysis.recommended_roles) ? analysis.recommended_roles : [],
      });
      showToast('Resume analyzed successfully!', 'success');
    } catch {
      setError('Failed to analyze resume. Please try again.');
      showToast('Failed to analyze resume.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFile(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 px-4 py-10 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold text-white">
            📄 Resume Analyzer
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-indigo-100 mt-2"
          >
            Get AI-powered feedback, ATS optimization tips, and role recommendations
          </motion.p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <AnimatePresence mode="wait">
          {/* Upload State */}
          {!result && !loading && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8"
            >
              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]'
                    : file
                      ? 'border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/10'
                      : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                }`}
              >
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />

                {file ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <span className="text-3xl">✅</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {(file.size / 1024).toFixed(1)} KB · PDF
                    </p>
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">Click to change file</p>
                  </motion.div>
                ) : (
                  <div>
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <svg className="w-8 h-8 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Drag & drop your resume here
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">or click to browse · PDF only · Max 10MB</p>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400"
                >
                  {error}
                </motion.div>
              )}

              {/* Upload Button */}
              <motion.button
                onClick={handleUpload}
                disabled={!file}
                whileHover={file ? { scale: 1.01 } : {}}
                whileTap={file ? { scale: 0.99 } : {}}
                className="w-full mt-6 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                🔍 Analyze Resume
              </motion.button>

              {/* Tips */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                  <span className="text-lg">📊</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Overall score rating</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                  <span className="text-lg">🤖</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">ATS optimization tips</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                  <span className="text-lg">🎯</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Role recommendations</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnalyzingState />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">

            {/* Score + Stats Row */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <ScoreRing score={result.overall_score} />
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 max-w-sm mx-auto">
                {result.overall_score >= 75 ? 'Your resume is strong. A few tweaks and you\'re golden.' :
                 result.overall_score >= 50 ? 'Decent foundation. Follow the suggestions below to level up.' :
                 'Needs significant improvement. The feedback below will help you get there.'}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <StatBadge icon="✅" label="Strengths" value={result.strengths.length} color="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10" />
                <StatBadge icon="⚠️" label="Weaknesses" value={result.weaknesses.length} color="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10" />
                <StatBadge icon="🔧" label="Missing Skills" value={result.missing_skills.length} color="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10" />
                <StatBadge icon="💡" label="Suggestions" value={result.suggestions.length} color="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10" />
              </div>
            </div>

            {/* Recommended Roles */}
            {result.recommended_roles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">🎯 Best Suited Roles</h2>
                <div className="flex flex-wrap gap-2">
                  {result.recommended_roles.map((role, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.08 }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    >
                      <span className="text-xs">💼</span> {role}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Feedback Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {result.strengths.length > 0 && <FeedbackCard title="✅ Strengths" items={result.strengths} variant="success" />}
              {result.weaknesses.length > 0 && <FeedbackCard title="⚠️ Weaknesses" items={result.weaknesses} variant="warning" />}
              {result.missing_skills.length > 0 && <FeedbackCard title="🔧 Missing Skills" items={result.missing_skills} variant="info" />}
              {result.suggestions.length > 0 && <FeedbackCard title="💡 Suggestions" items={result.suggestions} variant="info" />}
            </div>

            {/* ATS Tips */}
            {result.ats_tips.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-6"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🤖</span>
                  <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300">ATS Optimization Tips</h2>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">Make sure your resume passes Applicant Tracking Systems</p>
                <div className="space-y-3">
                  {result.ats_tips.map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      className="flex items-start gap-3 bg-white/60 dark:bg-gray-800/40 rounded-xl p-3"
                    >
                      <span className="text-amber-500 font-bold text-sm mt-0.5">{i + 1}</span>
                      <span className="text-sm text-amber-800 dark:text-amber-300">{tip}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 border-2 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                📄 Upload Another Resume
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
