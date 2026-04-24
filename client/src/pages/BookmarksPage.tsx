import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';

export interface BookmarkedQuestion {
  id: string;
  question: string;
  role: string;
  difficulty: string;
  score: number | null;
  savedAt: string;
}

const BOOKMARKS_KEY = 'hiremind_bookmarks';

export function loadBookmarks(): BookmarkedQuestion[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookmark(bookmark: BookmarkedQuestion) {
  const existing = loadBookmarks();
  if (existing.some((b) => b.question === bookmark.question)) return false;
  existing.unshift(bookmark);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(existing));
  return true;
}

export function removeBookmark(id: string) {
  const existing = loadBookmarks().filter((b) => b.id !== id);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(existing));
}

export function isBookmarked(question: string): boolean {
  return loadBookmarks().some((b) => b.question === question);
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [filter, setFilter] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    setBookmarks(loadBookmarks());
  }, []);

  const handleDelete = (id: string) => {
    removeBookmark(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    showToast('Bookmark removed.', 'success');
  };

  const filtered = filter
    ? bookmarks.filter((b) => b.role.toLowerCase().includes(filter.toLowerCase()) || b.question.toLowerCase().includes(filter.toLowerCase()))
    : bookmarks;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">📌 Bookmarked Questions</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Questions you saved for later review.</p>
        </motion.div>

        {bookmarks.length > 0 && (
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by role or keyword..."
            className="w-full mb-6 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">📚</span>
            <p className="text-gray-500 dark:text-gray-400">
              {bookmarks.length === 0 ? 'No bookmarks yet. Save questions during interviews!' : 'No matches found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-200 mb-2">{b.question}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium">
                        {b.role}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        b.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        b.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {b.difficulty}
                      </span>
                      {b.score !== null && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">Score: {b.score}/10</span>
                      )}
                      <span className="text-xs text-gray-400">{new Date(b.savedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                    title="Remove bookmark"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
