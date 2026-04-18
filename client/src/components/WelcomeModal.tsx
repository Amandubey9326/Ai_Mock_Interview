import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeModalProps {
  show: boolean;
  onDismiss: () => void;
}

export default function WelcomeModal({ show, onDismiss }: WelcomeModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onDismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full pointer-events-auto">
              <div className="text-center mb-6">
                <span className="text-5xl">🎉</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
                  Welcome to HireMind AI!
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Here are a few tips to get started:
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">🎙️</span>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">Start a mock interview</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Head to the Interview page to practice with AI</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">📄</span>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">Upload your resume</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Get AI-powered feedback on the Resume page</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">📊</span>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">Track your progress</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View scores and trends on the Dashboard</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onDismiss}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
