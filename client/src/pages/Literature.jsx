import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchPapers, createPaper, removePaper, clearPaperError } from '../redux/slices/paperSlice.js';

const Literature = () => {
  const dispatch = useDispatch();
  const { papers, loading, error } = useSelector((state) => state.papers);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'onBlur'
  });

  // Fetch papers on mount
  useEffect(() => {
    dispatch(fetchPapers());
  }, [dispatch]);

  // Clean up error notifications
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearPaperError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data) => {
    const resultAction = await dispatch(createPaper(data));
    if (createPaper.fulfilled.match(resultAction)) {
      toast.success('Research paper added successfully!');
      setIsModalOpen(false);
      reset();
    } else {
      toast.error(resultAction.payload || 'Failed to add research paper');
    }
  };

  const handleDelete = async (paperId) => {
    if (window.confirm('Are you sure you want to delete this research paper?')) {
      const resultAction = await dispatch(removePaper(paperId));
      if (removePaper.fulfilled.match(resultAction)) {
        toast.success('Research paper deleted successfully');
      } else {
        toast.error(resultAction.payload || 'Failed to delete research paper');
      }
    }
  };

  // Filter papers based on search query (title, author name, category, or summary)
  const filteredPapers = papers.filter((paper) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = paper.title?.toLowerCase().includes(query);
    const authorMatch = paper.author?.name?.toLowerCase().includes(query);
    const categoryMatch = paper.category?.toLowerCase().includes(query);
    const summaryMatch = paper.summary?.toLowerCase().includes(query);
    return titleMatch || authorMatch || categoryMatch || summaryMatch;
  });

  // Unique categories list for quick tags (optional/aesthetic)
  const categoryColors = {
    cloud: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    security: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    infrastructure: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    research: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    default: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  const getCategoryStyle = (cat) => {
    const normalized = cat?.toLowerCase();
    if (normalized.includes('cloud')) return categoryColors.cloud;
    if (normalized.includes('secur')) return categoryColors.security;
    if (normalized.includes('infra') || normalized.includes('network')) return categoryColors.infrastructure;
    if (normalized.includes('research') || normalized.includes('paper')) return categoryColors.research;
    return categoryColors.default;
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">
            Literature Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access, search, and submit enterprise research publications.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/20 transition-all duration-150"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Research Paper</span>
        </motion.button>
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full max-w-xl">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, author, category or keywords..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md placeholder-slate-500 text-white text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/80 transition duration-200"
        />
      </div>

      {/* Papers Listing Grid */}
      {loading && papers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-slate-400 text-sm">Fetching publications...</p>
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-12 text-center">
          <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-400 text-sm font-medium">No research papers found matching your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredPapers.map((paper) => {
              const isOwner = currentUser && paper.author?._id === currentUser._id;
              const isAdmin = currentUser?.role === 'admin';
              return (
                <motion.article
                  key={paper._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700/80 transition-colors duration-200"
                >
                  <div className="space-y-4">
                    {/* Category & Actions */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryStyle(paper.category)}`}>
                        {paper.category}
                      </span>

                      {(isOwner || isAdmin) && (
                        <button
                          onClick={() => handleDelete(paper._id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-150"
                          title="Delete Paper"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">
                      {paper.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                      {paper.summary}
                    </p>
                  </div>

                  {/* Metadata Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-semibold uppercase">
                      {paper.author?.name ? paper.author.name.charAt(0) : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-300 truncate">
                        {paper.author?.name || 'Unknown User'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(paper.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Form Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 z-55 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-150"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-xl font-bold text-white mb-2">
                Submit Research Paper
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Fill in the details below to publish your paper to Cloudsphere.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Title Input */}
                <div>
                  <label htmlFor="title" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Paper Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    {...register('title', {
                      required: 'Paper title is required',
                      maxLength: { value: 200, message: 'Title cannot exceed 200 characters' }
                    })}
                    placeholder="Enter descriptive title"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 placeholder-slate-600 text-white text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/80 transition duration-200"
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
                  )}
                </div>

                {/* Category Input */}
                <div>
                  <label htmlFor="category" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Category Tag
                  </label>
                  <input
                    id="category"
                    type="text"
                    {...register('category', {
                      required: 'Category is required',
                      maxLength: { value: 100, message: 'Category name cannot exceed 100 characters' }
                    })}
                    placeholder="e.g. Cloud Security, Micro-networks"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 placeholder-slate-600 text-white text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/80 transition duration-200"
                  />
                  {errors.category && (
                    <p className="mt-1 text-xs text-red-400">{errors.category.message}</p>
                  )}
                </div>

                {/* Summary Textarea */}
                <div>
                  <label htmlFor="summary" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Executive Summary
                  </label>
                  <textarea
                    id="summary"
                    rows="5"
                    {...register('summary', {
                      required: 'Paper summary is required',
                      minLength: { value: 10, message: 'Summary must be at least 10 characters long' },
                      maxLength: { value: 2000, message: 'Summary cannot exceed 2000 characters' }
                    })}
                    placeholder="Describe main findings, objectives, and conclusions..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 placeholder-slate-600 text-white text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/80 transition duration-200 resize-none"
                  />
                  {errors.summary && (
                    <p className="mt-1 text-xs text-red-400">{errors.summary.message}</p>
                  )}
                </div>

                {/* Actions Button */}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition duration-150 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading && (
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    <span>Submit Publication</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Literature;
