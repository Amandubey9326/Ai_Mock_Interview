import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getDashboard, getUsage, getRoleAnalytics, getPeerComparison, type UsageData, type RoleAnalyticsItem, type PeerComparisonData } from '../api/dashboard';
import { usePageTitle } from '../hooks/usePageTitle';
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

const roleNameMap: Record<string, string> = {
  Frontend: 'Frontend',
  Backend: 'Backend',
  DSA: 'DSA',
  HR: 'HR',
  DevOps: 'DevOps',
  SystemDesign: 'System Design',
  DataScience: 'Data Science',
  QAManual: 'QA Manual',
  QAAutomation: 'QA Automation',
};

function formatRoleName(role: string): string {
  return roleNameMap[role] ?? role;
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
    { emoji: '📅', title: '7-Day Streak', unlocked: data.longestStreak >= 7 },
    { emoji: '🗓️', title: '30-Day Streak', unlocked: data.longestStreak >= 30 },
  ];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [roleAnalytics, setRoleAnalytics] = useState<RoleAnalyticsItem[] | null>(null);
  const [peerData, setPeerData] = useState<PeerComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const { user } = useAuth();

  usePageTitle('Dashboard');

  useEffect(() => {
    Promise.all([
      getDashboard(),
      getUsage(),
      getRoleAnalytics().catch(() => null),
      getPeerComparison().catch(() => null),
    ])
      .then(([dashData, usageData, roleData, peerComp]) => {
        setData(dashData);
        setUsage(usageData);
        setRoleAnalytics(roleData);
        setPeerData(peerComp);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
              <MetricCard
                label="Current Streak"
                value={data.currentStreak > 0 ? `${data.currentStreak} day${data.currentStreak !== 1 ? 's' : ''}` : '—'}
                icon="🔥"
                gradient="from-orange-500 to-red-500"
                delay={0.2}
              />
              <MetricCard
                label="Longest Streak"
                value={data.longestStreak > 0 ? `${data.longestStreak} day${data.longestStreak !== 1 ? 's' : ''}` : '—'}
                icon="🏆"
                gradient="from-yellow-500 to-amber-500"
                delay={0.3}
              />
            </div>

            {/* XP & Level */}
            {data.xp && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg p-[2px] mb-8"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {data.xp.level}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{data.xp.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{data.xp.xp} XP total</p>
                      </div>
                    </div>
                    {data.xp.nextLevelName && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Next: {data.xp.nextLevelName} ({data.xp.xpForNextLevel} XP)
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, data.xp.progress)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Peer Comparison */}
            {peerData && peerData.totalUsers > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
              >
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">📈 How You Compare</h2>
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${peerData.percentile}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-4 rounded-full ${
                          peerData.percentile >= 75 ? 'bg-green-500' :
                          peerData.percentile >= 50 ? 'bg-yellow-500' :
                          'bg-orange-500'
                        }`}
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You scored better than <span className="font-bold text-indigo-600 dark:text-indigo-400">{peerData.percentile}%</span> of {peerData.totalUsers} users
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl">
                      {peerData.percentile >= 90 ? '🏆' : peerData.percentile >= 75 ? '🌟' : peerData.percentile >= 50 ? '👍' : '💪'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

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

            {/* Role Analytics Radar Chart */}
            {roleAnalytics && roleAnalytics.some((r) => r.averageScore > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
              >
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">📊 Performance by Role</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Radar Chart */}
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={roleAnalytics.map((r) => ({ ...r, role: formatRoleName(r.role) }))}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="role" fontSize={11} stroke="#9ca3af" />
                      <PolarRadiusAxis domain={[0, 10]} fontSize={10} stroke="#9ca3af" />
                      <Tooltip formatter={(v) => [Number(v).toFixed(1), 'Avg Score']} />
                      <Radar
                        name="Average Score"
                        dataKey="averageScore"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>

                  {/* Role Breakdown Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Role</th>
                          <th className="text-center py-2 text-gray-500 dark:text-gray-400 font-medium">Avg Score</th>
                          <th className="text-center py-2 text-gray-500 dark:text-gray-400 font-medium">Questions</th>
                          <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roleAnalytics
                          .filter((r) => r.totalSessions > 0)
                          .sort((a, b) => b.averageScore - a.averageScore)
                          .map((r) => (
                            <tr key={r.role} className="border-b border-gray-100 dark:border-gray-700/50">
                              <td className="py-2.5 font-medium text-gray-800 dark:text-gray-200">
                                {formatRoleName(r.role)}
                              </td>
                              <td className="py-2.5 text-center">
                                <span className={`font-semibold ${
                                  r.averageScore >= 8 ? 'text-green-600 dark:text-green-400' :
                                  r.averageScore >= 5 ? 'text-yellow-600 dark:text-yellow-400' :
                                  'text-red-600 dark:text-red-400'
                                }`}>
                                  {r.averageScore.toFixed(1)}
                                </span>
                              </td>
                              <td className="py-2.5 text-center text-gray-600 dark:text-gray-400">{r.totalSessions}</td>
                              <td className="py-2.5">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  r.averageScore >= 8 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                  r.averageScore >= 5 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                }`}>
                                  {r.averageScore >= 8 ? '🟢 Strong' : r.averageScore >= 5 ? '🟡 Average' : '🔴 Needs Work'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        {roleAnalytics.every((r) => r.totalSessions === 0) && (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-gray-500 dark:text-gray-400">
                              No data yet. Complete some interviews to see your role breakdown.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-24" />
        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-24" />
        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-24" />
        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-24" />
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-20" />
      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-32" />
      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-72" />
      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-48" />
    </div>
  );
}
