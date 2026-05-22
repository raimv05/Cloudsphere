import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile, logout } from '../redux/slices/authSlice.js';
import { motion } from 'framer-motion';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-height-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md w-full space-y-8 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-8 rounded-2xl shadow-2xl text-left"
      >
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Dashboard
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Welcome back to Cloudsphere, your workspace is ready.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-slate-400 text-sm">Fetching your profile...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-sm text-red-400">
            Failed to load profile: {error}
          </div>
        ) : user ? (
          <div className="space-y-6">
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold uppercase shadow-lg shadow-purple-500/20">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-700/50 pt-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <p className="text-sm font-medium text-slate-200 mt-0.5">{user.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">User ID</label>
                  <p className="text-xs font-mono text-slate-300 mt-0.5 break-all">{user._id}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Created</label>
                  <p className="text-sm font-medium text-slate-300 mt-0.5">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-slate-900 transition duration-150"
            >
              Sign Out
            </motion.button>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-sm">
            No profile information available.
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;
