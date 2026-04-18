import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getDashboard, getUsage, type UsageData } from '../api/dashboard';
import type { DashboardData } from '../types';

const motivationalQuotes = [
  "Every expert was once a beginner. Keep going! 💡",
  "The only way to do great work is to love what you do. 🔥",
  "Success is the sum of small efforts repeated day in and day out. 🎯",
  "Your next interview could be the one. Stay sharp! ⚡",
  "Practice makes progress, not perfection. 🌱",
  "Believe you can and you're halfway there. 🚀",
  "Hard work beats talent when talent doesn't work hard. 💪",
  "The best preparation for tomorrow is doing your best today. ✨",
  "Don't watch the clock; do what it does — keep going. ⏰",
  "Strive for progress, not perfection. 🌟",
];

function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return motivationalQuotes[dayOfYear % motivationalQuotes.length];
}

interface Badge {
  emoji: string;
  title: string;
  unlocked: boolean;
}

function computeBadges(data: DashboardData): Badge[] {
  return [
    { emoji: '🏅', title: 'First Interview', unlocked: data.totalSessions >= 1 },
    { emoji: '🔥', title: 'On Fire', unlocked: data.totalSessions >= 5 },
    { emoji: '⭐', title: 'High Scorer', unlocked: data.averageScore >= 8 },
    { emoji: '🎯', title: 'Consistent', unlocked: data.totalSessions >= 10 },
    { emoji: '💎', title: 'Diamond', unlocked: data.averageScore >= 9 && data.totalSessions >= 10 },
  ];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([getDashboard(), getUsage()])
      .then(([dashData, usageData]) => {
        setData(dashData);
        setUsage(usageData);
      })
      .catch(() => {
        setError('Failed to load dashboard data.');
        showToast('Failed to load dashboard data.', 'error');
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Gradient header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 dark:from-indigo-800 dark:via-purple-800 dark:to-indigo-900 px-4 py-10">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold text-white"
          >
            Welcome back{user?.name ? `, ${user.name}` : ''}! 👋
          </motion.h1>
          <p className="text-indigo-100 mt-1">Here's your interview preparation overview.</p>
          {/* Daily motivational quote */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-indigo-200 text-sm mt-3 italic"
          >
            {getDailyQuote()}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6">
        {loading && <DashboardSkeleton />}

        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

        {data && !loading && (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <MetricCard
                label="Total Interviews"
                value={data.totalSessions}
                icon="🎙️"
                gradient="from-indigo-500 to-blue-500"
                delay={0}
              />
              <MetricCard
                label="Average Score"
                value={data.averageScore > 0 ? data.averageScore.toFixed(1) : '—'}
                icon="⭐"
                gradient="from-purple-500 to-pink-500"
                delay={0.1}
              />
            </div>

            {/* Usage Limits */}
            {usage && usage.plan === 'free' && usage.interviewLimit !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Daily Usage</h2>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-medium">
                    Free Plan
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Interviews today</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {usage.interviewsToday} of {usage.interviewLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          usage.interviewsToday >= usage.interviewLimit
                            ? 'bg-red-500'
                            : usage.interviewsToday >= usage.interviewLimit * 0.8
                              ? 'bg-yellow-500'
                              : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, (usage.interviewsToday / usage.interviewLimit) * 100)}%` }}
                      />
                    </div>
                  </div>
                  {usage.interviewsToday >= usage.interviewLimit && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                      ✨ You've reached today's limit. Upgrade to premium for unlimited access!
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Achievement Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
            >
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Achievements</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {computeBadges(data).map((badge) => (
                  <motion.div
                    key={badge.title}
                    whileHover={{ scale: badge.unlocked ? 1.05 : 1 }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      badge.unlocked
                        ? 'border-indigo-200 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-40 grayscale'
                    }`}
                  >
                    <span className="text-3xl">{badge.emoji}</span>
                    <span className={`text-xs font-medium text-center ${
                      badge.unlocked
                        ? 'text-gray-800 dark:text-gray-200'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {badge.title}
                    </span>
                    {badge.unlocked ? (
                      <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">Unlocked</span>
                    ) : (
                      <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">Locked</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Score Over Time Chart */}
            {data.scoreOverTime.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
              >
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Score Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.scoreOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d: string) => new Date(d).toLocaleDateString()}
                      fontSize={12}
                      stroke="#9ca3af"
                    />
                    <YAxis domain={[0, 10]} fontSize={12} stroke="#9ca3af" />
                    <Tooltip
                      labelFormatter={(d) => new Date(String(d)).toLocaleDateString()}
                      formatter={(v) => [Number(v).toFixed(1), 'Avg Score']}
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="averageScore"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Recent Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Sessions</h2>
              {data.recentSessions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No sessions yet. Start your first interview!</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.recentSessions.map((s) => (
                    <li key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{s.role}</span>
                        <span className="mx-2 text-gray-400">·</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{s.difficulty}</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                to="/history"
                className="inline-block mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                View all history →
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, gradient, delay }: {
  label: string;
  value: string | number;
  icon: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-default transition-shadow hover:shadow-lg"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl shadow-md`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-24" />
        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-24" />
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-72" />
      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-48" />
    </div>
  );
}
