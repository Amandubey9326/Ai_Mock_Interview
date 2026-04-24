import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';
import type { Role, Difficulty } from '../types';

interface ScheduledInterview {
  id: string;
  role: Role;
  difficulty: Difficulty;
  scheduledAt: string;
  notified: boolean;
}

const SCHEDULE_KEY = 'hiremind_schedule';

function loadSchedule(): ScheduledInterview[] {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSchedule(items: ScheduledInterview[]) {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(items));
}

const roleOptions: { value: Role; label: string }[] = [
  { value: 'Frontend', label: '🎨 Frontend' },
  { value: 'Backend', label: '⚙️ Backend' },
  { value: 'DSA', label: '🧩 DSA' },
  { value: 'HR', label: '🤝 HR' },
  { value: 'DevOps', label: '🚀 DevOps' },
  { value: 'SystemDesign', label: '🏗️ System Design' },
  { value: 'DataScience', label: '📊 Data Science' },
  { value: 'QAManual', label: '🔍 QA Manual' },
  { value: 'QAAutomation', label: '🤖 QA Automation' },
];

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduledInterview[]>([]);
  const [role, setRole] = useState<Role>('Frontend');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [dateTime, setDateTime] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    setSchedule(loadSchedule());

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check for upcoming interviews every minute
    const interval = setInterval(() => {
      const items = loadSchedule();
      const now = Date.now();
      let updated = false;

      for (const item of items) {
        const scheduledTime = new Date(item.scheduledAt).getTime();
        const diff = scheduledTime - now;

        // Notify 5 minutes before
        if (diff > 0 && diff <= 5 * 60 * 1000 && !item.notified) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🎙️ Interview Reminder', {
              body: `Your ${item.role} (${item.difficulty}) interview starts in 5 minutes!`,
            });
          }
          item.notified = true;
          updated = true;
        }
      }

      if (updated) {
        saveSchedule(items);
        setSchedule([...items]);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleAdd = () => {
    if (!dateTime) {
      showToast('Please select a date and time.', 'error');
      return;
    }

    const scheduledDate = new Date(dateTime);
    if (scheduledDate <= new Date()) {
      showToast('Please select a future date.', 'error');
      return;
    }

    const newItem: ScheduledInterview = {
      id: Date.now().toString(),
      role,
      difficulty,
      scheduledAt: scheduledDate.toISOString(),
      notified: false,
    };

    const updated = [...schedule, newItem].sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
    setSchedule(updated);
    saveSchedule(updated);
    setDateTime('');
    showToast('Interview scheduled!', 'success');
  };

  const handleDelete = (id: string) => {
    const updated = schedule.filter((s) => s.id !== id);
    setSchedule(updated);
    saveSchedule(updated);
    showToast('Schedule removed.', 'success');
  };

  const upcoming = schedule.filter((s) => new Date(s.scheduledAt) > new Date());
  const past = schedule.filter((s) => new Date(s.scheduledAt) <= new Date());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">📅 Schedule Practice</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Plan your interview practice sessions and get browser reminders.</p>
        </motion.div>

        {/* Add Schedule Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
              >
                {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
            />
          </div>
          <button
            onClick={handleAdd}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Schedule Interview
          </button>
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Upcoming</h2>
            <div className="space-y-2">
              {upcoming.map((s) => (
                <div key={s.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{s.role}</span>
                    <span className="mx-2 text-gray-400">·</span>
                    <span className="text-sm text-gray-500">{s.difficulty}</span>
                    <p className="text-xs text-gray-400 mt-1">{new Date(s.scheduledAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/interview/start"
                      className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Start
                    </Link>
                    <button onClick={() => handleDelete(s.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past */}
        {past.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Past</h2>
            <div className="space-y-2 opacity-60">
              {past.slice(0, 5).map((s) => (
                <div key={s.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{s.role}</span>
                    <span className="mx-2 text-gray-400">·</span>
                    <span className="text-sm text-gray-500">{s.difficulty}</span>
                    <p className="text-xs text-gray-400 mt-1">{new Date(s.scheduledAt).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleDelete(s.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {schedule.length === 0 && (
          <div className="text-center py-12">
            <span className="text-5xl block mb-4">📅</span>
            <p className="text-gray-500 dark:text-gray-400">No scheduled interviews yet. Plan your practice above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
