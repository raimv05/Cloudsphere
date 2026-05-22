import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  fetchSurveys,
  createSurvey,
  submitSurveyResponse,
  clearSurveyError
} from '../redux/slices/surveySlice.js';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const CHART_COLORS = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

const Surveys = () => {
  const dispatch = useDispatch();
  const { surveys, loading, error } = useSelector((state) => state.surveys);
  const { user: currentUser } = useSelector((state) => state.auth);

  // States
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Survey Creation Form (using react-hook-form)
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    control: createControl,
    formState: { errors: createErrors },
    reset: resetCreate,
    watch: watchCreate
  } = useForm({
    defaultValues: {
      title: '',
      questions: [{ text: '', type: 'text', options: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: createControl,
    name: 'questions'
  });

  // Survey Response Form (using react-hook-form)
  const {
    register: registerResponse,
    handleSubmit: handleResponseFormSubmit,
    formState: { errors: responseErrors },
    setValue: setResponseValue,
    watch: watchResponse,
    reset: resetResponse
  } = useForm();

  useEffect(() => {
    dispatch(fetchSurveys());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearSurveyError());
    }
  }, [error, dispatch]);

  // Submit survey creation
  const handleCreateSurveySubmit = async (data) => {
    // Format questions
    const formattedQuestions = data.questions.map((q) => {
      let optionsArray = [];
      if (q.type === 'multiple_choice' && q.options) {
        optionsArray = q.options.split(',').map(o => o.trim()).filter(Boolean);
      }
      return {
        text: q.text.trim(),
        type: q.type,
        options: optionsArray
      };
    });

    const payload = {
      title: data.title.trim(),
      questions: formattedQuestions
    };

    const action = await dispatch(createSurvey(payload));
    if (createSurvey.fulfilled.match(action)) {
      toast.success('Survey created successfully!');
      setIsCreateModalOpen(false);
      resetCreate();
    }
  };

  // Select survey to respond or view analytics
  const handleSelectSurvey = (survey) => {
    setActiveSurvey(survey);
    resetResponse();
  };

  // Check if current user already submitted a response
  const hasResponded = (survey) => {
    if (!survey || !survey.responses) return false;
    return survey.responses.some(
      (r) => r.user?._id === currentUser?._id || r.user === currentUser?._id
    );
  };

  // Submit survey responses
  const onResponseSubmit = async (data) => {
    const answersArray = Object.keys(data.answers || {}).map((qId) => ({
      questionId: qId,
      value: data.answers[qId]
    }));

    const action = await dispatch(
      submitSurveyResponse({
        surveyId: activeSurvey._id,
        answers: answersArray
      })
    );

    if (submitSurveyResponse.fulfilled.match(action)) {
      toast.success('Response submitted successfully!');
      // Update active survey details from Redux state
      setActiveSurvey(action.payload.data);
    }
  };

  // Process data for charts
  const getQuestionAnalyticsData = (question, responses) => {
    if (!responses || responses.length === 0) return [];

    if (question.type === 'multiple_choice') {
      const counts = {};
      question.options.forEach((opt) => {
        counts[opt] = 0;
      });

      responses.forEach((res) => {
        const answer = res.answers.find((a) => a.questionId.toString() === question._id.toString());
        if (answer && answer.value) {
          counts[answer.value] = (counts[answer.value] || 0) + 1;
        }
      });

      return Object.keys(counts).map((key) => ({
        name: key,
        value: counts[key]
      }));
    }

    if (question.type === 'rating') {
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      responses.forEach((res) => {
        const answer = res.answers.find((a) => a.questionId.toString() === question._id.toString());
        if (answer && answer.value) {
          const val = parseInt(answer.value, 10);
          if (counts[val] !== undefined) {
            counts[val] += 1;
          }
        }
      });

      return [1, 2, 3, 4, 5].map((val) => ({
        rating: `${val} ★`,
        responses: counts[val]
      }));
    }

    if (question.type === 'text') {
      const texts = [];
      responses.forEach((res) => {
        const answer = res.answers.find((a) => a.questionId.toString() === question._id.toString());
        if (answer && answer.value) {
          texts.push({
            user: res.user?.name || 'Anonymous User',
            text: answer.value,
            date: new Date(res.createdAt).toLocaleDateString()
          });
        }
      });
      return texts;
    }

    return [];
  };

  // Filter surveys
  const filteredSurveys = surveys.filter((s) =>
    s.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left">
      <AnimatePresence mode="wait">
        {!activeSurvey ? (
          // SURVEY LIST VIEW
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Header & Create Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">
                  Surveys Hub
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Participate in research surveys or compile aggregate metrics reports.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/20 transition-all duration-150"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Create New Survey</span>
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
                placeholder="Search surveys by title..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md placeholder-slate-500 text-white text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/80 transition duration-200"
              />
            </div>

            {/* Survey Cards Grid */}
            {loading && surveys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                <p className="text-slate-400 text-sm">Loading surveys...</p>
              </div>
            ) : filteredSurveys.length === 0 ? (
              <div className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-12 text-center">
                <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
                <p className="text-slate-400 text-sm font-medium">No surveys available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSurveys.map((survey) => {
                  const userResponded = hasResponded(survey);
                  return (
                    <motion.div
                      key={survey._id}
                      whileHover={{ y: -4 }}
                      onClick={() => handleSelectSurvey(survey)}
                      className="cursor-pointer bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700/80 transition-all duration-200"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            userResponded
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}>
                            {userResponded ? 'Responded' : 'Pending Response'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {survey.responses?.length || 0} responses
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">
                          {survey.title}
                        </h3>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          This survey contains <span className="text-purple-400 font-semibold">{survey.questions?.length}</span> dynamic questions evaluating cloud standards.
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase">
                            {survey.creator?.name ? survey.creator.name.charAt(0) : 'S'}
                          </div>
                          <span className="text-xs text-slate-400 truncate max-w-[120px]">
                            {survey.creator?.name || 'Survey Hub'}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-purple-400 flex items-center space-x-1 hover:text-purple-300">
                          <span>{userResponded ? 'View Analytics' : 'Take Survey'}</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          // INDIVIDUAL SURVEY ANCHORED VIEW (Form or Analytics)
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Header / Back action */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  // Fetch list updates and clear selection
                  dispatch(fetchSurveys());
                  setActiveSurvey(null);
                }}
                className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition duration-150"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white m-0 leading-tight">
                  {activeSurvey.title}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Created by {activeSurvey.creator?.name || 'Administrator'} • {activeSurvey.responses?.length || 0} total answers
                </p>
              </div>
            </div>

            {hasResponded(activeSurvey) ? (
              // ANALYTICS DASHBOARD FOR THE SURVEY
              <div className="space-y-8">
                <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 text-emerald-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold">You have submitted responses for this survey. Real-time aggregated results are shown below.</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {activeSurvey.questions.map((q, idx) => {
                    const data = getQuestionAnalyticsData(q, activeSurvey.responses);
                    
                    return (
                      <div
                        key={q._id}
                        className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between"
                      >
                        <div className="mb-4">
                          <span className="text-xs text-slate-500 font-mono">Question {idx + 1} ({q.type})</span>
                          <h3 className="text-base font-bold text-white mt-1 leading-snug">
                            {q.text}
                          </h3>
                        </div>

                        {/* Rendering different chart types based on Question Type */}
                        {q.type === 'multiple_choice' && data.length > 0 && (
                          <div className="h-64 w-full flex flex-col justify-between mt-2">
                            <div className="h-44 w-full flex items-center justify-center">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={65}
                                    dataKey="value"
                                    paddingAngle={2}
                                  >
                                    {data.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mt-2">
                              {data.map((entry, index) => (
                                <div key={entry.name} className="flex items-center space-x-2">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                  <span className="truncate">{entry.name}: {entry.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {q.type === 'rating' && data.length > 0 && (
                          <div className="h-60 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={data} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="rating" stroke="#64748b" fontSize={10} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                                <Bar dataKey="responses" fill="#a855f7" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {q.type === 'text' && (
                          <div className="mt-2 space-y-3 max-h-60 overflow-y-auto pr-1">
                            {data.length === 0 ? (
                              <p className="text-xs text-slate-500 italic py-4">No text responses submitted yet.</p>
                            ) : (
                              data.map((res, rid) => (
                                <div key={rid} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-left">
                                  <p className="text-xs text-slate-200 leading-relaxed font-normal">{res.text}</p>
                                  <div className="flex justify-between items-center mt-2.5 pt-1.5 border-t border-slate-900 text-[10px] text-slate-500">
                                    <span>{res.user}</span>
                                    <span>{res.date}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // ANSWER SURVEY FORM VIEW
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8"
              >
                <form onSubmit={handleResponseFormSubmit(onResponseSubmit)} className="space-y-8 text-left">
                  {activeSurvey.questions.map((q, idx) => (
                    <div key={q._id} className="space-y-4">
                      <label className="block text-sm font-semibold text-slate-300 leading-normal">
                        <span className="text-purple-400 font-mono text-xs block mb-1">Question {idx + 1}</span>
                        {q.text}
                      </label>

                      {/* TEXT QUESTION */}
                      {q.type === 'text' && (
                        <textarea
                          rows={3}
                          {...registerResponse(`answers.${q._id}`, { required: 'This question is required' })}
                          placeholder="Type your response here..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-955/60 placeholder-slate-600 text-white text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/80 transition duration-200 resize-none"
                        />
                      )}

                      {/* MULTIPLE CHOICE QUESTION */}
                      {q.type === 'multiple_choice' && (
                        <div className="space-y-2">
                          <input
                            type="hidden"
                            {...registerResponse(`answers.${q._id}`, { required: 'Please select an option' })}
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {q.options.map((opt) => {
                              const isSelected = watchResponse(`answers.${q._id}`) === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setResponseValue(`answers.${q._id}`, opt, { shouldValidate: true })}
                                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl border text-left text-sm transition-all duration-150 ${
                                    isSelected
                                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-md shadow-purple-500/5'
                                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700/80 hover:text-slate-200'
                                  }`}
                                >
                                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                    isSelected ? 'border-purple-500' : 'border-slate-700'
                                  }`}>
                                    {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                                  </span>
                                  <span className="truncate">{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* RATING 1-5 QUESTION */}
                      {q.type === 'rating' && (
                        <div className="space-y-2">
                          <input
                            type="hidden"
                            {...registerResponse(`answers.${q._id}`, { required: 'Please select a rating' })}
                          />
                          <div className="flex items-center space-x-3">
                            {[1, 2, 3, 4, 5].map((val) => {
                              const isSelected = watchResponse(`answers.${q._id}`) === val.toString();
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setResponseValue(`answers.${q._id}`, val.toString(), { shouldValidate: true })}
                                  className={`w-12 h-12 rounded-xl border text-sm font-bold flex items-center justify-center transition-all duration-150 ${
                                    isSelected
                                      ? 'bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-500/10 scale-105'
                                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700/80 hover:text-slate-200'
                                  }`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                            <span className="text-xs text-slate-500 pl-2">
                              (1 = Lowest, 5 = Highest)
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Dynamic slide-in styled validation error banner */}
                      <AnimatePresence>
                        {responseErrors.answers?.[q._id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="text-xs text-red-400 font-semibold mt-1">
                              {responseErrors.answers[q._id].message}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-slate-800 flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setActiveSurvey(null)}
                      className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition duration-150"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition duration-150 flex items-center justify-center space-x-2"
                    >
                      Submit Responses
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE SURVEY OVERLAY MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 z-55 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-150"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-xl font-bold text-white mb-2">
                Create New Research Survey
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Design custom questions to evaluate enterprise cloud integrations.
              </p>

              <form onSubmit={handleCreateSubmit(handleCreateSurveySubmit)} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Survey Title
                  </label>
                  <input
                    type="text"
                    {...registerCreate('title', { required: 'Survey title is required' })}
                    placeholder="e.g. Cloud Security Compliance Q3"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-955/60 placeholder-slate-650 text-white text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/80 transition duration-200"
                  />
                  <AnimatePresence>
                    {createErrors.title && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <span className="text-xs text-red-400 mt-1 block">
                          {createErrors.title.message}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Dynamic Questions Builder */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Questions
                    </label>
                    <button
                      type="button"
                      onClick={() => append({ text: '', type: 'text', options: '' })}
                      className="text-xs font-semibold text-purple-405 hover:text-purple-300 flex items-center space-x-1 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20"
                    >
                      <span>+ Add Question</span>
                    </button>
                  </div>

                  <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                    {fields.map((field, index) => {
                      const qType = watchCreate(`questions.${index}.type`);
                      return (
                        <div
                          key={field.id}
                          className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3 relative"
                        >
                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (fields.length === 1) {
                                toast.error('A survey must have at least one question');
                                return;
                              }
                              remove(index);
                            }}
                            className="absolute top-3 right-3 text-slate-500 hover:text-red-400"
                            title="Remove Question"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>

                          <div className="grid grid-cols-3 gap-3">
                            {/* Question Text */}
                            <div className="col-span-2">
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                Question Text
                              </label>
                              <input
                                type="text"
                                {...registerCreate(`questions.${index}.text`, { required: 'Question text is required' })}
                                placeholder={`Question ${index + 1}`}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-white text-xs focus:outline-none focus:border-purple-500"
                              />
                              <AnimatePresence>
                                {createErrors.questions?.[index]?.text && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <span className="text-[10px] text-red-400 mt-1 block">
                                      {createErrors.questions[index].text.message}
                                    </span>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Question Type */}
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                Type
                              </label>
                              <select
                                {...registerCreate(`questions.${index}.type`)}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-white text-xs focus:outline-none focus:border-purple-500"
                              >
                                <option value="text">Text Response</option>
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="rating">Rating (1-5)</option>
                              </select>
                            </div>
                          </div>

                          {/* Options Input for MC */}
                          {qType === 'multiple_choice' && (
                            <div className="pt-1">
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                Options (separated by commas)
                              </label>
                              <input
                                type="text"
                                {...registerCreate(`questions.${index}.options`, {
                                  required: 'Options are required for multiple choice questions',
                                  validate: (val) => {
                                    if (!val) return 'Options are required';
                                    const opts = val.split(',').map(o => o.trim()).filter(Boolean);
                                    if (opts.length === 0) return 'At least one option is required';
                                    return true;
                                  }
                                })}
                                placeholder="e.g. AWS, Microsoft Azure, Google Cloud"
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-white text-xs focus:outline-none focus:border-purple-500"
                              />
                              <AnimatePresence>
                                {createErrors.questions?.[index]?.options && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <span className="text-[10px] text-red-400 mt-1 block">
                                      {createErrors.questions[index].options.message}
                                    </span>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submit / Cancel Actions */}
                <div className="flex space-x-3 pt-2 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition duration-150"
                  >
                    Save Survey
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

export default Surveys;
