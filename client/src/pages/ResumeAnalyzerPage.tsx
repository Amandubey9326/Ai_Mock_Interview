import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import FeedbackCard from '../components/FeedbackCard';
import { useToast } from '../components/Toast';
import { analyzeResume } from '../api/resume';
import type { ResumeAnalysis } from '../types';

function ScoreRing({ score }: { score: number }) {
  const safeScore = Math.max(0, Math.min(100, score || 0));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;
  const color = safeScore >= 75 ? '#22c55e' : safeScore >= 50 ? '#eab308' : '#ef4444';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="8"
          className="text-gray-200 dark:text-gray-700" />
        <motion.circle
          cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8"
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
          className="text-3xl font-bold text-gray-900 dark:text-white"
        >
          {safeScore}
        </motion.span>
        <span className="text-xs text-gray-500 dark:text-gray-400">out of 100</span>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-block px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
      {role}
    </span>
  );
}

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.type !== 'application/pdf') {
      showToast('Please upload a PDF file only.', 'error');
      return;
    }
    setFile(selected);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped);
      setResult(null);
    } else {
      showToast('Please upload a PDF file only.', 'error');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const analysis = await analyzeResume(file);
      // Ensure all fields have defaults to prevent render crashes
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
      showToast('Failed to analyze resume. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 px-4 py-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold text-white">
            📄 Resume Analyzer
          </motion.h1>
          <p className="text-indigo-100 mt-2">Get AI-powered feedback to make your resume stand out</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        {/* Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700/30'
            }`}
          >
            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            <div className="text-4xl mb-3">📎</div>
            {file ? (
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Drag & drop your PDF here, or click to browse
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PDF files only, max 10MB</p>
              </div>
            )}
          </div>

          <motion.button
            onClick={handleUpload}
            disabled={!file || loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Analyzing your resume...' : '🔍 Analyze Resume'}
          </motion.button>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">AI is reviewing your resume...</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">

            {/* Overall Score */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">Overall Resume Score</h2>
              <ScoreRing score={result.overall_score} />
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                {result.overall_score >= 75 ? 'Great resume! A few tweaks and you\'re golden.' :
                 result.overall_score >= 50 ? 'Decent resume. Some improvements needed.' :
                 'Needs significant work. Follow the suggestions below.'}
              </p>
            </div>

            {/* Recommended Roles */}
            {result.recommended_roles.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">🎯 Best Suited Roles</h2>
                <div className="flex flex-wrap gap-2">
                  {result.recommended_roles.map((role, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                      <RoleBadge role={role} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FeedbackCard title="✅ Strengths" items={result.strengths} variant="success" />
              <FeedbackCard title="⚠️ Weaknesses" items={result.weaknesses} variant="warning" />
              <FeedbackCard title="🔧 Missing Skills" items={result.missing_skills} variant="info" />
              <FeedbackCard title="💡 Suggestions" items={result.suggestions} variant="info" />
            </div>

            {/* ATS Tips */}
            {result.ats_tips.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
                <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-3">🤖 ATS Optimization Tips</h2>
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">Tips to help your resume pass Applicant Tracking Systems</p>
                <ul className="space-y-2">
                  {result.ats_tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
                      <span className="mt-0.5 text-amber-500">→</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Re-analyze button */}
            <button
              onClick={() => { setResult(null); setFile(null); }}
              className="w-full py-3 border-2 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            >
              Upload Another Resume
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
