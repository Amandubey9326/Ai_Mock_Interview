import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';
import { createInterview } from '../api/interviews';
import type { Role, Difficulty } from '../types';

const roles: { value: Role; label: string; icon: string }[] = [
  { value: 'Frontend', label: 'Frontend', icon: '🎨' },
  { value: 'Backend', label: 'Backend', icon: '⚙️' },
  { value: 'DSA', label: 'DSA', icon: '🧩' },
  { value: 'HR', label: 'HR', icon: '🤝' },
  { value: 'DevOps', label: 'DevOps', icon: '🚀' },
  { value: 'SystemDesign', label: 'System Design', icon: '🏗️' },
  { value: 'DataScience', label: 'Data Science', icon: '📊' },
  { value: 'QAManual', label: 'QA Manual', icon: '🔍' },
  { value: 'QAAutomation', label: 'QA Automation', icon: '🤖' },
];

const difficulties: { value: Difficulty; label: string; color: string; selectedColor: string }[] = [
  { value: 'Easy', label: 'Easy', color: 'border-gray-200 dark:border-gray-600', selectedColor: 'border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 shadow-green-100 dark:shadow-none' },
  { value: 'Medium', label: 'Medium', color: 'border-gray-200 dark:border-gray-600', selectedColor: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 shadow-yellow-100 dark:shadow-none' },
  { value: 'Hard', label: 'Hard', color: 'border-gray-200 dark:border-gray-600', selectedColor: 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 shadow-red-100 dark:shadow-none' },
];

const roleGradients: Record<string, string> = {
  Frontend: 'from-pink-500/10 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/20',
  Backend: 'from-gray-500/10 to-slate-500/10 dark:from-gray-500/20 dark:to-slate-500/20',
  DSA: 'from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20',
  HR: 'from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20',
  DevOps: 'from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20',
  SystemDesign: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20',
  DataScience: 'from-purple-500/10 to-fuchsia-500/10 dark:from-purple-500/20 dark:to-fuchsia-500/20',
  QAManual: 'from-yellow-500/10 to-lime-500/10 dark:from-yellow-500/20 dark:to-lime-500/20',
  QAAutomation: 'from-cyan-500/10 to-sky-500/10 dark:from-cyan-500/20 dark:to-sky-500/20',
};

export default function StartInterviewPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedRole || !selectedDifficulty) return;
    setLoading(true);
    try {
      const session = await createInterview({ role: selectedRole, difficulty: selectedDifficulty });
      showToast('Interview session started!', 'success');
      navigate(`/interview/${session.id}`);
    } catch {
      showToast('Failed to create interview session. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Motivational banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px]"
        >
          <div className="rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-5 text-center relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <p className="relative text-lg sm:text-xl font-bold text-white">
              Ready to ace your next interview? 🚀
            </p>
            <p className="relative text-sm text-white/80 mt-1">
              Pick your role and difficulty, then show us what you've got!
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Start Interview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">Select a role and difficulty to begin your mock interview.</p>
        </motion.div>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Choose a Role</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {roles.map((role, i) => {
              const isSelected = selectedRole === role.value;
              const gradient = roleGradients[role.value] || '';
              return (
                <motion.button
                  key={role.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{
                    scale: 1.05,
                    rotateY: 5,
                    rotateX: 5,
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedRole(role.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-lg shadow-indigo-100 dark:shadow-none'
                      : `border-gray-200 dark:border-gray-600 bg-gradient-to-br ${gradient} hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md`
                  }`}
                  style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
                >
                  <span className="text-5xl drop-shadow-sm">{role.icon}</span>
                  <span className={`text-sm font-medium ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {role.label}
                  </span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-indigo-500"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Choose Difficulty</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {difficulties.map((diff) => {
              const isSelected = selectedDifficulty === diff.value;
              return (
                <motion.button
                  key={diff.value}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedDifficulty(diff.value)}
                  className={`py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                    isSelected
                      ? `${diff.selectedColor} shadow-md`
                      : `${diff.color} bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500`
                  }`}
                >
                  {diff.label}
                </motion.button>
              );
            })}
          </div>
        </section>

        <motion.button
          onClick={handleSubmit}
          disabled={!selectedRole || !selectedDifficulty || loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Start Interview'}
        </motion.button>
      </div>
    </div>
  );
}
