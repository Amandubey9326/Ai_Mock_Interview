import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const features = [
  {
    icon: '🎙️',
    title: 'AI Mock Interviews',
    description: 'Practice with AI-powered interviews tailored to your target role and difficulty level.',
  },
  {
    icon: '⚡',
    title: 'Real-time Feedback',
    description: 'Get instant, detailed feedback on your answers with strengths and areas to improve.',
  },
  {
    icon: '📄',
    title: 'Resume Analyzer',
    description: 'Upload your resume and receive AI-driven insights to make it stand out.',
  },
  {
    icon: '📈',
    title: 'Performance Tracking',
    description: 'Track your progress over time with detailed score analytics and history.',
  },
];

const stats = [
  { value: 1000, suffix: '+', label: 'Mock Interviews' },
  { value: 500, suffix: '+', label: 'Happy Users' },
  { value: 9, suffix: '', label: 'Interview Roles' },
  { value: 0, suffix: '', label: 'AI-Powered Feedback', isText: true },
];

const testimonials = [
  {
    name: 'Aman',
    role: 'Frontend Developer',
    initials: 'AC',
    color: 'bg-gradient-to-br from-pink-400 to-rose-500',
    quote: 'HireMind AI helped me land my dream job. The AI feedback was incredibly detailed and helped me identify blind spots in my answers.',
  },
  {
    name: 'Abhay',
    role: 'Backend Engineer',
    initials: 'SJ',
    color: 'bg-gradient-to-br from-blue-400 to-indigo-500',
    quote: 'I practiced system design interviews daily for two weeks. My confidence skyrocketed and I aced my Google interview!',
  },
  {
    name: 'John Lee',
    role: 'Data Scientist',
    initials: 'ML',
    color: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    quote: 'The resume analyzer caught issues I never noticed. Combined with mock interviews, it was the perfect prep combo.',
  },
];

const howItWorksSteps = [
  {
    number: '01',
    title: 'Choose Your Role',
    description: 'Pick from 9 interview categories including Frontend, Backend, System Design, and more.',
    icon: '🎯',
  },
  {
    number: '02',
    title: 'Practice with AI',
    description: 'Answer AI-generated questions in real-time with adaptive difficulty that matches your skill level.',
    icon: '🤖',
  },
  {
    number: '03',
    title: 'Get Feedback & Improve',
    description: 'Review detailed scores, track your progress over time, and watch your skills grow.',
    icon: '📊',
  },
];

const supportedRoles = [
  'Frontend', 'Backend', 'DSA', 'HR', 'DevOps',
  'System Design', 'Data Science', 'QA Manual', 'QA Automation',
];

const faqItems = [
  {
    question: 'Is HireMind AI free?',
    answer: 'Yes! We offer a free plan that includes up to 50 interviews per day. No credit card required to get started.',
  },
  {
    question: 'What roles are supported?',
    answer: 'We support 9 roles: Frontend, Backend, DSA, HR, DevOps, System Design, Data Science, QA Manual, and QA Automation.',
  },
  {
    question: 'How does AI evaluation work?',
    answer: 'Our AI evaluates your answers on a scale of 1-10, providing detailed feedback on accuracy, completeness, communication clarity, and areas for improvement.',
  },
  {
    question: 'Can I upload my resume?',
    answer: 'Yes! You can upload your resume as a PDF and receive AI-powered analysis with actionable suggestions to improve it.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. All data is encrypted in transit and at rest. We never share your personal information or interview data with third parties.',
  },
];

/* ─── Reusable Components ─── */

function FloatingElement({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-2xl opacity-20 ${className}`}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

function FeatureCard({ icon, title, description, index }: {
  icon: string;
  title: string;
  description: string;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      <span className="text-4xl block mb-4">{icon}</span>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-indigo-100 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function AnimatedCounter({ value, suffix, isText }: { value: number; suffix: string; isText?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || isText) return;
    let start = 0;
    const duration = 1500;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value, isText]);

  if (isText) {
    return <span ref={ref} className="text-3xl sm:text-4xl font-extrabold text-white">✓</span>;
  }

  return (
    <span ref={ref} className="text-3xl sm:text-4xl font-extrabold text-white">
      {isInView ? count : 0}{suffix}
    </span>
  );
}

/* ─── Section Components ─── */

function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-6"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
          >
            <AnimatedCounter value={stat.value} suffix={stat.suffix} isText={stat.isText} />
            <p className="text-indigo-200 text-sm mt-2 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
        <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
          Get interview-ready in three simple steps.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Connecting lines (desktop only) */}
        <div className="hidden md:block absolute top-16 left-[calc(33.33%-1rem)] w-[calc(33.33%+2rem)] h-0.5 bg-gradient-to-r from-white/30 via-white/50 to-white/30" />
        <div className="hidden md:block absolute top-16 right-[calc(33.33%-1rem)] w-[calc(33.33%+2rem)] h-0.5 bg-gradient-to-r from-white/30 via-white/50 to-white/30" />

        {howItWorksSteps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.2 }}
            className="relative text-center flex flex-col items-center"
          >
            {/* Number badge */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-pink-400 flex items-center justify-center text-indigo-900 font-extrabold text-xl shadow-lg shadow-pink-500/30 mb-6 relative z-10">
              {step.number}
            </div>

            {/* Mobile connecting arrow */}
            {i < howItWorksSteps.length - 1 && (
              <div className="md:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-2xl">↓</div>
            )}

            <span className="text-3xl mb-3">{step.icon}</span>
            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
            <p className="text-indigo-100 text-sm leading-relaxed max-w-xs">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function SupportedRolesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const doubled = [...supportedRoles, ...supportedRoles];

  return (
    <section ref={ref} className="relative z-10 pb-24 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center mb-10 px-6"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Supported Roles</h2>
        <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
          Practice interviews across 9 in-demand tech roles.
        </p>
      </motion.div>

      {/* Marquee row 1 */}
      <div className="relative w-full overflow-hidden mb-4">
        <div className="marquee-track flex gap-4 w-max">
          {doubled.map((role, i) => (
            <span
              key={`r1-${i}`}
              className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-semibold text-sm whitespace-nowrap hover:bg-white/20 transition-colors"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* Marquee row 2 (reverse) */}
      <div className="relative w-full overflow-hidden">
        <div className="marquee-track-reverse flex gap-4 w-max">
          {[...doubled].reverse().map((role, i) => (
            <span
              key={`r2-${i}`}
              className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-semibold text-sm whitespace-nowrap hover:bg-white/20 transition-colors"
            >
              {role}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseUsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const traditional = [
    'Generic, one-size-fits-all questions',
    'No feedback on your answers',
    'Manual progress tracking',
    'Limited role coverage',
  ];

  const hireMind = [
    'AI-personalized questions per role',
    'Real-time detailed feedback & scoring',
    'Automatic progress tracking & analytics',
    'All 9 major tech roles covered',
  ];

  return (
    <section ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why Choose HireMind AI?</h2>
        <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
          See how AI-powered prep stacks up against the old way.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Traditional */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-red-500/10 backdrop-blur-md border border-red-400/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-300 text-lg">✕</div>
            <h3 className="text-xl font-bold text-red-300">Traditional Prep</h3>
          </div>
          <ul className="space-y-3">
            {traditional.map((item) => (
              <li key={item} className="flex items-start gap-3 text-red-200/80 text-sm">
                <span className="mt-0.5 text-red-400">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* HireMind */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-emerald-500/10 backdrop-blur-md border border-emerald-400/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 text-lg">✓</div>
            <h3 className="text-xl font-bold text-emerald-300">HireMind AI</h3>
          </div>
          <ul className="space-y-3">
            {hireMind.map((item) => (
              <li key={item} className="flex items-start gap-3 text-emerald-200/80 text-sm">
                <span className="mt-0.5 text-emerald-400">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">What Our Users Say</h2>
        <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
          Join hundreds of developers who improved their interview skills with HireMind AI.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                {t.initials}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-indigo-200 text-xs">{t.role}</p>
              </div>
            </div>
            <p className="text-indigo-100 text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section ref={ref} className="relative z-10 max-w-3xl mx-auto px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
          Got questions? We have answers.
        </p>
      </motion.div>

      <div className="space-y-3">
        {faqItems.map((item, i) => (
          <motion.div
            key={item.question}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between px-6 py-4 text-left"
            >
              <span className="text-white font-semibold text-sm sm:text-base pr-4">{item.question}</span>
              <motion.span
                animate={{ rotate: openIndex === i ? 45 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-white/60 text-xl flex-shrink-0"
              >
                +
              </motion.span>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-4 text-indigo-100 text-sm leading-relaxed">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Main Page ─── */

export default function LandingPage() {
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 overflow-hidden relative">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="gradient-mesh-bg absolute inset-0 opacity-30" />
      </div>

      {/* Floating background elements */}
      <FloatingElement className="w-72 h-72 bg-white/10 top-20 -left-20 blur-sm" delay={0} />
      <FloatingElement className="w-48 h-48 bg-purple-300/20 top-40 right-10 blur-sm" delay={1.5} />
      <FloatingElement className="w-36 h-36 bg-indigo-300/20 bottom-40 left-1/4 blur-sm" delay={3} />
      <FloatingElement className="w-56 h-56 bg-white/5 bottom-20 right-1/4 blur-sm" delay={2} />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-6">
        <span className="text-2xl font-bold text-white tracking-tight">HireMind AI</span>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-white/90 hover:text-white font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="bg-white text-indigo-600 px-5 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Trusted badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-8"
          >
            <div className="flex -space-x-2">
              {['from-pink-400 to-rose-500', 'from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-yellow-400 to-orange-500'].map((gradient, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradient} border-2 border-indigo-700 flex items-center justify-center text-white text-[10px] font-bold`}
                >
                  {['A', 'S', 'M', 'J'][i]}
                </div>
              ))}
            </div>
            <span className="text-white/90 text-sm font-medium">Trusted by 500+ developers</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-6"
          >
            Master Your Next Interview with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300">
              AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto"
          >
            Practice mock interviews, get real-time AI feedback, analyze your resume, and track your
            improvement — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/signup"
              className="w-full sm:w-auto bg-white text-indigo-600 px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all hover:scale-105 shadow-lg shadow-indigo-900/30"
            >
              Get Started Free
            </Link>
            <button
              onClick={scrollToFeatures}
              className="w-full sm:w-auto border-2 border-white/40 text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              Learn More
            </button>
          </motion.div>
        </div>

        {/* Floating 3D cards with parallax-like movement */}
        <div className="relative mt-20 flex justify-center">
          <motion.div
            animate={{ y: [0, -12, 0], rotateZ: [-2, 2, -2], x: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-64 h-40 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-2xl"
            style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
          >
            <div className="text-white/80 text-sm font-medium mb-2">Sample Question</div>
            <div className="text-white text-sm">&ldquo;Explain the difference between REST and GraphQL...&rdquo;</div>
            <div className="mt-3 flex gap-2">
              <span className="px-2 py-0.5 bg-green-400/20 text-green-200 text-xs rounded-full">Backend</span>
              <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-200 text-xs rounded-full">Medium</span>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -16, 0], rotateZ: [2, -2, 2], x: [0, -8, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="hidden sm:block absolute -right-4 top-8 w-48 h-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl"
            style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
          >
            <div className="text-white/80 text-xs font-medium mb-1">Score</div>
            <div className="text-3xl font-bold text-green-300">8.5</div>
            <div className="text-white/60 text-xs mt-1">Great answer!</div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0], rotateZ: [-1, 3, -1], x: [0, 6, 0], scale: [1, 1.02, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="hidden sm:block absolute -left-4 top-4 w-44 h-28 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl"
            style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
          >
            <div className="text-white/80 text-xs font-medium mb-1">Progress</div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div className="bg-gradient-to-r from-green-400 to-emerald-300 h-2 rounded-full w-3/4" />
            </div>
            <div className="text-white/60 text-xs mt-2">12 sessions completed</div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Everything You Need to Succeed
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-indigo-200 text-lg max-w-2xl mx-auto"
          >
            Comprehensive tools to prepare you for any technical interview.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} index={i} />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Supported Roles Section */}
      <SupportedRolesSection />

      {/* Stats Counter Section */}
      <StatsSection />

      {/* Why Choose Us Section */}
      <WhyChooseUsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* About Us Section */}
      <section id="about" className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">About Us</h2>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto">The story behind HireMind AI</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 sm:p-12"
        >
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="shrink-0">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white/20">
                AD
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold text-white mb-1">Aman Dubey</h3>
              <p className="text-indigo-300 font-medium mb-4">Trainee Engineer | Software Engineer</p>
              <div className="space-y-3 text-indigo-100 text-sm leading-relaxed">
                <p>
                  Hi, I'm Aman — a software engineer with 2 years of experience building and testing web applications.
                  I created HireMind AI because I saw how stressful and unstructured interview preparation can be,
                  especially for developers early in their careers.
                </p>
                <p>
                  The idea was simple: what if you could practice real interviews anytime, get instant AI feedback on your
                  answers, and actually track your improvement over time? No more guessing if you're ready — the data tells you.
                </p>
                <p>
                  HireMind AI covers 9 tech roles, generates unique questions every time, evaluates your answers with detailed
                  scoring, analyzes your resume, and even has an AI chatbot to help you study. It's the interview prep tool
                  I wish I had when I started.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-6 justify-center sm:justify-start">
                <a href="https://www.linkedin.com/in/amandubey-qa/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  LinkedIn
                </a>
                <a href="https://github.com/Amandubey9326" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  GitHub
                </a>
                <a href="mailto:amandubeyy2@gmail.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20 transition-colors">
                  ✉️ Contact
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-10 sm:p-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Ace Your Interview?
          </h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
            Join HireMind AI today and start practicing with our AI-powered mock interviews.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all hover:scale-105 shadow-lg"
          >
            Start Practicing Now
          </Link>
        </motion.div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div>
              <span className="text-xl font-bold text-white tracking-tight">HireMind AI</span>
              <p className="text-indigo-200 text-sm mt-3 leading-relaxed">
                AI-powered interview preparation platform to help you land your dream tech job.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-2">
                {['Mock Interviews', 'Resume Analyzer', 'Performance Tracking', 'Leaderboard'].map((item) => (
                  <li key={item}>
                    <Link to="/signup" className="text-indigo-200 hover:text-white text-sm transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-indigo-200 hover:text-white text-sm transition-colors">About Us</Link>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Connect</h4>
              <div className="flex gap-3">
                {/* GitHub */}
                <a href="https://github.com/Amandubey9326" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </a>
                {/* LinkedIn */}
                <a href="https://www.linkedin.com/in/amandubey-qa/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
                {/* Email */}
                <a href="mailto:amandubeyy2@gmail.com" className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              </div>
              <p className="text-indigo-200/60 text-xs mt-3">amandubeyy2@gmail.com</p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-indigo-200 text-sm">
              © {new Date().getFullYear()} HireMind AI. All rights reserved.
            </p>
            <p className="text-indigo-300/60 text-sm">
              Built with ❤️ using React, Node.js & AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
