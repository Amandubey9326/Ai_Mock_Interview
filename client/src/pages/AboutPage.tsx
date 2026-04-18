import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 overflow-hidden relative">
      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-6">
        <Link to="/" className="text-2xl font-bold text-white tracking-tight">HireMind AI</Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-white/90 hover:text-white font-medium transition-colors">Sign In</Link>
          <Link to="/signup" className="bg-white text-indigo-600 px-5 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">Get Started</Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">About Us</h1>
          <p className="text-indigo-200 text-lg">The story behind HireMind AI</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 sm:p-12 mb-12"
        >
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="shrink-0">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-5xl font-bold shadow-xl border-4 border-white/20">
                AD
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold text-white mb-1">Aman Dubey</h2>
              <p className="text-indigo-300 font-medium text-lg mb-2">Trainee Engineer | Software Engineer</p>
              <p className="text-indigo-200/60 text-sm">2+ years of experience in software engineering</p>
            </div>
          </div>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-8 mb-16"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">💡 Why I Built This</h3>
            <p className="text-indigo-100 leading-relaxed">
              Interview preparation has always been stressful and unstructured — especially for developers early in their careers.
              I spent countless hours searching for the right questions, practicing alone with no feedback, and never knowing if I was
              actually improving. I built HireMind AI to solve that problem — not just for myself, but for every developer who deserves
              a better way to prepare.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">🎯 The Mission</h3>
            <p className="text-indigo-100 leading-relaxed">
              HireMind AI is an AI-powered mock interview platform that generates role-specific questions, evaluates your answers
              in real-time with detailed scoring, analyzes your resume, and tracks your progress over time. The goal is simple:
              give every developer the confidence to walk into any interview and perform at their best.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">🚀 What Makes It Different</h3>
            <ul className="space-y-3 text-indigo-100">
              <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5">✓</span> 9 tech roles covered — Frontend, Backend, DSA, HR, DevOps, System Design, Data Science, QA Manual, QA Automation</li>
              <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5">✓</span> AI-generated unique questions every time — no repeats within a session</li>
              <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5">✓</span> Real-time scoring with strengths, weaknesses, and improvement suggestions</li>
              <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5">✓</span> Resume analyzer with ATS optimization tips and role recommendations</li>
              <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5">✓</span> AI chatbot assistant for instant help with any interview topic</li>
              <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5">✓</span> Performance dashboard with charts, badges, and leaderboard</li>
            </ul>
          </div>
        </motion.div>

        {/* Connect */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Let's Connect</h3>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <a href="https://www.linkedin.com/in/amandubey-qa/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              LinkedIn
            </a>
            <a href="https://github.com/Amandubey9326" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              GitHub
            </a>
            <a href="mailto:amandubeyy2@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors">
              ✉️ Email Me
            </a>
          </div>
          <Link to="/signup" className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all hover:scale-105 shadow-lg">
            Start Practicing Now
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-indigo-200 text-sm">
        <Link to="/" className="hover:text-white transition-colors">← Back to Home</Link>
        <span className="mx-3">|</span>
        © {new Date().getFullYear()} HireMind AI. All rights reserved.
      </footer>
    </div>
  );
}
