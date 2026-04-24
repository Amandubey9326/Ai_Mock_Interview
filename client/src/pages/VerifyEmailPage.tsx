import { useState, useRef, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../components/Toast';
import apiClient from '../api/client';

export default function VerifyEmailPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      showToast('Please enter the 6-digit code.', 'error');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/verify-email', { code: fullCode });
      showToast('Email verified!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Verification failed.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await apiClient.post('/auth/resend-verification');
      showToast('New code sent to your email!', 'success');
    } catch {
      showToast('Failed to resend code.', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center"
      >
        <span className="text-5xl block mb-4">📧</span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verify Your Email</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          We sent a 6-digit code to your email. Enter it below.
        </p>

        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          ))}
        </div>

        <motion.button
          onClick={handleVerify}
          disabled={loading || code.join('').length !== 6}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </motion.button>

        <button
          onClick={handleResend}
          disabled={resending}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 disabled:opacity-50"
        >
          {resending ? 'Sending...' : "Didn't receive the code? Resend"}
        </button>
      </motion.div>
    </div>
  );
}
