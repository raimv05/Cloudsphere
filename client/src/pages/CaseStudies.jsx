import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  fetchCaseStudies,
  createCaseStudy,
  removeCaseStudy,
  clearCaseStudyError
} from '../redux/slices/caseStudySlice.js';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const PIE_COLORS = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

const CaseStudies = () => {
  const dispatch = useDispatch();
  const { caseStudies, loading, error } = useSelector((state) => state.caseStudies);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'onBlur'
  });

  useEffect(() => {
    dispatch(fetchCaseStudies());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCaseStudyError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data) => {
    const action = await dispatch(createCaseStudy(data));
    if (createCaseStudy.fulfilled.match(action)) {
      toast.success('Case study added successfully!');
      setIsModalOpen(false);
      reset();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this case study?')) {
      const action = await dispatch(removeCaseStudy(id));
      if (removeCaseStudy.fulfilled.match(action)) {
        toast.success('Case study deleted successfully');
      }
    }
  };

  // Provider branding styles
  const getProviderStyle = (provider) => {
    const p = provider.toLowerCase();
    if (p.includes('aws') || p.includes('amazon')) {
      return {
        badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        cardBorder: 'hover:border-orange-500/30'
      };
    }
    if (p.includes('azure') || p.includes('microsoft')) {
      return {
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        cardBorder: 'hover:border-blue-500/30'
      };
    }
    if (p.includes('gcp') || p.includes('google')) {
      return {
        badge: 'bg-green-500/10 text-green-400 border-green-500/20',
        cardBorder: 'hover:border-green-500/30'
      };
    }
    return {
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      cardBorder: 'hover:border-purple-500/30'
    };
  };

  // Filter case studies by institution, cloud provider or benefits/challenges
  const filteredCaseStudies = caseStudies.filter((cs) => {
    const q = searchQuery.toLowerCase();
    return (
      cs.institution?.toLowerCase().includes(q) ||
      cs.cloudProvider?.toLowerCase().includes(q) ||
      cs.benefits?.toLowerCase().includes(q) ||
      cs.challenges?.toLowerCase().includes(q)
    );
  });

  // Calculate Metrics
  const totalStudies = caseStudies.length;
  
  // Aggregate Cloud Provider distributions
  const providerStats = {};
  caseStudies.forEach((cs) => {
    let provider = 'Other';
    const p = cs.cloudProvider.toLowerCase();
    if (p.includes('aws') || p.includes('amazon')) provider = 'AWS';
    else if (p.includes('azure') || p.includes('microsoft')) provider = 'Microsoft Azure';
    else if (p.includes('gcp') || p.includes('google')) provider = 'Google Cloud';
    
    providerStats[provider] = (providerStats[provider] || 0) + 1;
  });

  const chartData = Object.keys(providerStats).map((name) => ({
    name,
    value: providerStats[name]
  }));

  // Top Cloud provider
  let topProvider = 'N/A';
  let topCount = 0;
  Object.keys(providerStats).forEach((p) => {
    if (providerStats[p] > topCount) {
      topCount = providerStats[p];
      topProvider = p;
    }
  });

  return (
    <div className="space-y-8 text-left">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">
            Case Studies Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access global case histories, migration benefits, and return on investment models.
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
          <span>Add Case Study</span>
        </motion.button>
      </div>

      {/* Metrics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Case Studies */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl -mr-4 -mt-4" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Migrations Documented</span>
          <h3 className="text-3xl font-extrabold text-white mt-4">{totalStudies}</h3>
          <p className="text-[10px] text-slate-500 mt-2">Active enterprise architectural transitions</p>
        </div>

        {/* Top Cloud Provider */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl -mr-4 -mt-4" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leading Cloud Environment</span>
          <h3 className="text-2xl font-extrabold text-indigo-400 mt-4 truncate">{topProvider}</h3>
          <p className="text-[10px] text-slate-500 mt-2">Preferred by {topCount} institutions</p>
        </div>

        {/* Visual Allocation Chart Widget */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Migration Breakout</span>
            <div className="mt-3 space-y-1.5 max-h-16 overflow-y-auto pr-1">
              {chartData.map((d, i) => (
                <div key={d.name} className="flex items-center space-x-1.5 text-[9px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="truncate">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
            {chartData.length === 0 ? (
              <span className="text-[9px] text-slate-600">No Data</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={15}
                    outerRadius={30}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '9px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
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
          placeholder="Search by institution, cloud provider, benefits..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md placeholder-slate-500 text-white text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/80 transition duration-200"
        />
      </div>

      {/* Case Studies Listing */}
      {loading && caseStudies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-slate-400 text-sm">Fetching case histories...</p>
        </div>
      ) : filteredCaseStudies.length === 0 ? (
        <div className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-12 text-center">
          <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 00-2 2v3m2-3H9m12 0a2 2 0 01-2 2h-1m-4-6h.01M9 16h.01" />
          </svg>
          <p className="text-slate-400 text-sm font-medium">No case histories found matching your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCaseStudies.map((cs) => {
              const isOwner = currentUser && cs.creator?._id === currentUser._id;
              const isAdmin = currentUser?.role === 'admin';
              const providerBranding = getProviderStyle(cs.cloudProvider);

              return (
                <motion.article
                  key={cs._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between transition-all duration-250 ${providerBranding.cardBorder}`}
                >
                  <div className="space-y-4">
                    {/* Header: Provider & Actions */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${providerBranding.badge}`}>
                        {cs.cloudProvider}
                      </span>

                      {(isOwner || isAdmin) && (
                        <button
                          onClick={() => handleDelete(cs._id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-150"
                          title="Delete Case Study"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Institution */}
                    <h3 className="text-lg font-bold text-white leading-snug truncate">
                      {cs.institution}
                    </h3>

                    {/* ROI Highlight Badge */}
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">ROI Achieved</span>
                      <span className="font-bold text-purple-400">{cs.roi}</span>
                    </div>

                    {/* Benefits & Challenges sections */}
                    <div className="space-y-2 text-left">
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Benefits</h4>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-3 leading-relaxed">{cs.benefits}</p>
                      </div>
                      <div className="pt-1.5">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Challenges Faced</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">{cs.challenges}</p>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-850 flex items-center justify-center text-slate-300 text-xs font-semibold uppercase">
                      {cs.creator?.name ? cs.creator.name.charAt(0) : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-350 truncate">
                        {cs.creator?.name || 'Anonymous Creator'}
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        Added on {new Date(cs.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ADD CASE STUDY MODAL */}
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
                Submit Case Study
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Publish a migrations history to assist cloud engineering metrics.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Institution */}
                <div>
                  <label htmlFor="institution" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Institution / Organization Name
                  </label>
                  <input
                    id="institution"
                    type="text"
                    {...register('institution', {
                      required: 'Institution name is required',
                      maxLength: { value: 100, message: 'Cannot exceed 100 characters' }
                    })}
                    placeholder="e.g. Stanford Medical Labs"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 placeholder-slate-600 text-white text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/80 transition duration-200"
                  />
                  {errors.institution && (
                    <p className="mt-1 text-xs text-red-400">{errors.institution.message}</p>
                  )}
                </div>

                {/* Cloud Provider & ROI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cloud Provider */}
                  <div>
                    <label htmlFor="cloudProvider" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Cloud Provider
                    </label>
                    <input
                      id="cloudProvider"
                      type="text"
                      {...register('cloudProvider', {
                        required: 'Cloud provider is required',
                        maxLength: { value: 100, message: 'Cannot exceed 100 characters' }
                      })}
                      placeholder="e.g. AWS, Microsoft Azure"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 placeholder-slate-600 text-white text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/80 transition duration-200"
                    />
                    {errors.cloudProvider && (
                      <p className="mt-1 text-xs text-red-400">{errors.cloudProvider.message}</p>
                    )}
                  </div>

                  {/* ROI */}
                  <div>
                    <label htmlFor="roi" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      ROI Achieved
                    </label>
                    <input
                      id="roi"
                      type="text"
                      {...register('roi', {
                        required: 'ROI is required',
                        maxLength: { value: 200, message: 'Cannot exceed 200 characters' }
                      })}
                      placeholder="e.g. 40% reduction, 2.5x speed"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 placeholder-slate-600 text-white text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/80 transition duration-200"
                    />
                    {errors.roi && (
                      <p className="mt-1 text-xs text-red-400">{errors.roi.message}</p>
                    )}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <label htmlFor="benefits" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Migration Benefits
                  </label>
                  <textarea
                    id="benefits"
                    rows="3"
                    {...register('benefits', {
                      required: 'Migration benefits are required'
                    })}
                    placeholder="Detail key structural improvements, scalability, and positive impacts..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 placeholder-slate-600 text-white text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/80 transition duration-200 resize-none"
                  />
                  {errors.benefits && (
                    <p className="mt-1 text-xs text-red-400">{errors.benefits.message}</p>
                  )}
                </div>

                {/* Challenges */}
                <div>
                  <label htmlFor="challenges" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Challenges Encountered
                  </label>
                  <textarea
                    id="challenges"
                    rows="3"
                    {...register('challenges', {
                      required: 'Challenges are required'
                    })}
                    placeholder="Describe friction, migration delays, training requirements, or compatibility bugs..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 placeholder-slate-600 text-white text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/80 transition duration-200 resize-none"
                  />
                  {errors.challenges && (
                    <p className="mt-1 text-xs text-red-400">{errors.challenges.message}</p>
                  )}
                </div>

                {/* Submit / Cancel Actions */}
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
                    className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition duration-150 flex items-center justify-center space-x-2"
                  >
                    <span>Add Case Study</span>
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

export default CaseStudies;
