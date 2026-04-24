import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';
import { usePageTitle } from '../hooks/usePageTitle';
import { getLeaderboard, type LeaderboardEntry } from '../api/leaderboard';

export default function LeaderboardPage() {
  usePageTitle('Leaderboard');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    getLeaderboard()
      .then(setEntries)
      .catch(() => showToast('Failed to load leaderboard.', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
        >
          <span>🏆</span> Leaderboard
        </motion.h1>

        {loading && <LoadingSpinner size="lg" />}

        {!loading && entries.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">No scores yet. Be the first!</p>
        )}

        {!loading && entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500" />
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                  <th className="px-5 py-3 font-medium">Rank</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium text-right">Avg Score</th>
                  <th className="px-5 py-3 font-medium text-right">Interviews</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <motion.tr
                    key={entry.rank}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        entry.rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400' :
                        entry.rank === 2 ? 'bg-gray-100 dark:bg-gray-600/40 text-gray-600 dark:text-gray-300' :
                        entry.rank === 3 ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400' :
                        'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        {entry.rank}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{entry.name}</td>
                    <td className="px-5 py-3 text-right font-semibold text-indigo-600 dark:text-indigo-400">{entry.averageScore.toFixed(1)}</td>
                    <td className="px-5 py-3 text-right text-gray-600 dark:text-gray-400">{entry.totalInterviews}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  );
}
