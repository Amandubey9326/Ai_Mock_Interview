import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="text-8xl mb-6"
        >
          🔍
        </motion.div>
        <h1 className="text-7xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">Page not found</p>
        <p className="text-gray-500 dark:text-gray-500 mb-8 max-w-md mx-auto">
          Looks like this page went on a coffee break. Let's get you back on track.
        </p>
        <Link
          to="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Go Home
        </Link>
      </motion.div>
    </div>
  );
}
