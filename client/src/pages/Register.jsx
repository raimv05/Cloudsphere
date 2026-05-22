import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { registerUser, clearError } from '../redux/slices/authSlice.js';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    mode: 'onBlur'
  });

  const password = watch('password');

  // Redirect if logged in
  useEffect(() => {
    if (token) {
      navigate('/profile');
    }
  }, [token, navigate]);

  // Clean up errors on mount/unmount
  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    const { name, email, password } = data;
    const resultAction = await dispatch(registerUser({ name, email, password }));
    if (registerUser.fulfilled.match(resultAction)) {
      toast.success(resultAction.payload.message || 'Account created successfully!');
      navigate('/profile');
    } else {
      toast.error(resultAction.payload || 'Failed to register');
    }
  };

  return (
    <div className="min-height-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full space-y-8 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-8 rounded-2xl shadow-2xl"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-purple-400 hover:text-purple-300 transition duration-150"
            >
              sign in to existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                {...register('name', {
                  required: 'Full name is required',
                  maxLength: {
                    value: 50,
                    message: 'Name cannot exceed 50 characters'
                  }
                })}
                className={`appearance-none rounded-xl relative block w-full px-4 py-3 border ${
                  errors.name ? 'border-red-500/80 focus:ring-red-500/50' : 'border-slate-700/60 focus:ring-purple-500/50'
                } bg-slate-950/50 placeholder-slate-500 text-white focus:outline-none focus:ring-4 focus:border-purple-500 transition duration-200 text-sm`}
                placeholder="Full Name"
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-400 text-left pl-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email-address" className="sr-only">
                Email Address
              </label>
              <input
                id="email-address"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address format'
                  }
                })}
                className={`appearance-none rounded-xl relative block w-full px-4 py-3 border ${
                  errors.email ? 'border-red-500/80 focus:ring-red-500/50' : 'border-slate-700/60 focus:ring-purple-500/50'
                } bg-slate-950/50 placeholder-slate-500 text-white focus:outline-none focus:ring-4 focus:border-purple-500 transition duration-200 text-sm`}
                placeholder="Email Address"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 text-left pl-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className={`appearance-none rounded-xl relative block w-full px-4 py-3 border ${
                  errors.password ? 'border-red-500/80 focus:ring-red-500/50' : 'border-slate-700/60 focus:ring-purple-500/50'
                } bg-slate-950/50 placeholder-slate-500 text-white focus:outline-none focus:ring-4 focus:border-purple-500 transition duration-200 text-sm`}
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400 text-left pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match'
                })}
                className={`appearance-none rounded-xl relative block w-full px-4 py-3 border ${
                  errors.confirmPassword ? 'border-red-500/80 focus:ring-red-500/50' : 'border-slate-700/60 focus:ring-purple-500/50'
                } bg-slate-950/50 placeholder-slate-500 text-white focus:outline-none focus:ring-4 focus:border-purple-500 transition duration-200 text-sm`}
                placeholder="Confirm Password"
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-400 text-left pl-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition duration-150 disabled:opacity-50 shadow-lg shadow-purple-500/25"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
              ) : (
                'Register Account'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
