import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';
import { getAdminStats, getAdminUsers, type PlatformStats, type AdminUser } from '../api/admin';

export default function AdminPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([getAdminStats(), getAdminUsers(page)])
      .then(([statsData, usersData]) => {
        setStats(statsData);
        setUsers(usersData.users);
        setTotalUsers(usersData.total);
      })
      .catch((err) => {
        const msg = err?.response?.status === 403 ? 'Admin access required.' : 'Failed to load admin data.';
        setError(msg);
        showToast(msg, 'error');
      })
      .finally(() => setLoading(false));
  }, [page, showToast]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <span className="text-5xl mb-4 block">🔒</span>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🛡️ Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Platform-wide statistics and user management.</p>
        </motion.div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-24" />)}
            </div>
          </div>
        ) : stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <StatCard label="Total Users" value={stats.totalUsers} icon="👥" />
              <StatCard label="Total Interviews" value={stats.totalInterviews} icon="🎙️" />
              <StatCard label="Total Questions" value={stats.totalQuestions} icon="❓" />
              <StatCard label="Avg Score" value={stats.averageScore > 0 ? stats.averageScore.toFixed(1) : '—'} icon="⭐" />
              <StatCard label="New This Week" value={stats.newUsersThisWeek} icon="📈" />
              <StatCard label="Today's Interviews" value={stats.interviewsToday} icon="📅" />
            </div>

            {/* Role Distribution */}
            {stats.roleDistribution.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8"
              >
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Role Distribution</h2>
                <div className="space-y-2">
                  {stats.roleDistribution
                    .sort((a, b) => b.count - a.count)
                    .map((r) => {
                      const pct = stats.totalInterviews > 0 ? (r.count / stats.totalInterviews) * 100 : 0;
                      return (
                        <div key={r.role} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-28 shrink-0">{r.role}</span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div className="bg-indigo-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">{r.count}</span>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* Users Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Users ({totalUsers})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Name</th>
                      <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Email</th>
                      <th className="text-center py-2 text-gray-500 dark:text-gray-400 font-medium">Plan</th>
                      <th className="text-center py-2 text-gray-500 dark:text-gray-400 font-medium">Interviews</th>
                      <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-2.5 font-medium text-gray-800 dark:text-gray-200">
                          {u.name} {u.isAdmin && <span className="text-xs text-indigo-500">admin</span>}
                        </td>
                        <td className="py-2.5 text-gray-600 dark:text-gray-400">{u.email}</td>
                        <td className="py-2.5 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            u.plan === 'free' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                          }`}>{u.plan}</span>
                        </td>
                        <td className="py-2.5 text-center text-gray-600 dark:text-gray-400">{u._count.interviews}</td>
                        <td className="py-2.5 text-gray-500 dark:text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalUsers > 20 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">Page {page}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * 20 >= totalUsers}
                    className="px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center"
    >
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </motion.div>
  );
}
