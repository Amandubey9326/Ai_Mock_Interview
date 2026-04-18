import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { updateProfile, changePassword } from '../api/profile';
import apiClient from '../api/client';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingName(true);
    try {
      const updated = await updateProfile(name.trim());
      updateUser(updated);
      showToast('Name updated!', 'success');
    } catch {
      showToast('Failed to update name.', 'error');
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    setSavingPassword(true);
    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      showToast('Password changed!', 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to change password.';
      showToast(msg, 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-8"
        >
          Profile
        </motion.h1>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Account Info</h2>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><span className="font-medium text-gray-800 dark:text-gray-200">Name:</span> {user?.name}</p>
            <p><span className="font-medium text-gray-800 dark:text-gray-200">Email:</span> {user?.email}</p>
            <p><span className="font-medium text-gray-800 dark:text-gray-200">Joined:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
          </div>
        </motion.div>

        {/* Edit Name */}
        <motion.form
          onSubmit={handleUpdateName}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Edit Name</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
            placeholder="Your name"
          />
          <button
            type="submit"
            disabled={savingName || !name.trim()}
            className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {savingName ? 'Saving...' : 'Save Name'}
          </button>
        </motion.form>

        {/* Change Password */}
        <motion.form
          onSubmit={handleChangePassword}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Change Password</h2>
          <div className="space-y-3 mb-4">
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Current password"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="New password (min 6 characters)"
            />
          </div>
          <button
            type="submit"
            disabled={savingPassword || !oldPassword || newPassword.length < 6}
            className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {savingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </motion.form>

        {/* Delete Account */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6 shadow-sm mt-6"
        >
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Danger Zone</h2>
          <p className="text-sm text-red-600 dark:text-red-400/80 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            className="w-full border border-red-300 dark:border-red-700 rounded-lg p-3 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
            placeholder="Enter your password to confirm"
          />
          <button
            onClick={async () => {
              if (!deletePassword) return;
              setDeleting(true);
              try {
                await apiClient.delete('/auth/account', { data: { password: deletePassword } });
                showToast('Account deleted.', 'success');
                logout();
                navigate('/');
              } catch (err: any) {
                const msg = err?.response?.data?.message || 'Failed to delete account.';
                showToast(msg, 'error');
              } finally {
                setDeleting(false);
              }
            }}
            disabled={deleting || !deletePassword}
            className="bg-red-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {deleting ? 'Deleting...' : 'Delete My Account'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
