import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import apiClient from '../api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [copied, setCopied] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setResetToken('');
    try {
      const { data } = await apiClient.post<{ message: string; resetToken: string }>('/auth/forgot-password', { email });
      setResetToken(data.resetToken);
      showToast('Reset token generated!', 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to generate reset token.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToken = async () => {
    await navigator.clipboard.writeText(resetToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 relative">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">HireMind AI</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Forgot your password?</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Get Reset Token'}
            </button>
          </form>

          {resetToken && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <p className="text-sm text-green-700 dark:text-green-400 mb-2 font-medium">Your reset token:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-white dark:bg-gray-800 p-2 rounded border border-green-200 dark:border-green-700 text-gray-800 dark:text-gray-200 break-all">
                  {resetToken}
                </code>
                <button
                  onClick={copyToken}
                  className="shrink-0 px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <Link
                to="/reset-password"
                className="inline-block mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium"
              >
                Go to Reset Password →
              </Link>
            </motion.div>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium">
              ← Back to Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
