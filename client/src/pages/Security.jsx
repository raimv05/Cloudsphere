import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  fetchSecurityReports,
  createSecurityReport,
  clearSecurityError
} from '../redux/slices/securitySlice.js';
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

const RISK_COLORS = {
  Low: '#10b981',      // Emerald Green
  Medium: '#f59e0b',   // Amber Gold
  High: '#f97316',     // Orange
  Critical: '#ef4444'  // Crimson Red
};

const COMPLIANCE_COLORS = {
  'Compliant': '#10b981',
  'Non-Compliant': '#ef4444',
  'Under Review': '#f59e0b'
};

const Security = () => {
  const dispatch = useDispatch();
  const { reports, loading, error } = useSelector((state) => state.security);
  const { user: currentUser } = useSelector((state) => state.auth);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [complianceFilter, setComplianceFilter] = useState('All');

  // Modal & Expand states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState(null);

  // New report creation state
  const [newInstitution, setNewInstitution] = useState('');
  const [newRiskLevel, setNewRiskLevel] = useState('Low');
  const [newComplianceStatus, setNewComplianceStatus] = useState('Under Review');
  const [newFindings, setNewFindings] = useState(['']);

  useEffect(() => {
    dispatch(fetchSecurityReports());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearSecurityError());
    }
  }, [error, dispatch]);

  // Handle findings array inputs
  const handleAddFinding = () => {
    setNewFindings([...newFindings, '']);
  };

  const handleRemoveFinding = (index) => {
    if (newFindings.length === 1) {
      toast.error('At least one finding must be provided');
      return;
    }
    setNewFindings(newFindings.filter((_, i) => i !== index));
  };

  const handleFindingChange = (index, value) => {
    const updated = [...newFindings];
    updated[index] = value;
    setNewFindings(updated);
  };

  // Submit new report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!newInstitution.trim()) {
      toast.error('Institution name is required');
      return;
    }

    const filteredFindings = newFindings.map(f => f.trim()).filter(Boolean);
    if (filteredFindings.length === 0) {
      toast.error('At least one non-empty finding is required');
      return;
    }

    const payload = {
      institution: newInstitution.trim(),
      riskLevel: newRiskLevel,
      complianceStatus: newComplianceStatus,
      findings: filteredFindings
    };

    const action = await dispatch(createSecurityReport(payload));
    if (createSecurityReport.fulfilled.match(action)) {
      toast.success('Security report added successfully!');
      setIsModalOpen(false);
      // Reset form
      setNewInstitution('');
      setNewRiskLevel('Low');
      setNewComplianceStatus('Under Review');
      setNewFindings(['']);
    }
  };

  const toggleExpandReport = (id) => {
    if (expandedReportId === id) {
      setExpandedReportId(null);
    } else {
      setExpandedReportId(id);
    }
  };

  // Filter reports
  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.institution?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'All' || r.riskLevel === riskFilter;
    const matchesCompliance = complianceFilter === 'All' || r.complianceStatus === complianceFilter;
    return matchesSearch && matchesRisk && matchesCompliance;
  });

  // Calculate Metrics
  const totalReports = reports.length;
  
  const compliantCount = reports.filter(r => r.complianceStatus === 'Compliant').length;
  const complianceRate = totalReports > 0 ? Math.round((compliantCount / totalReports) * 100) : 0;

  const criticalHighCount = reports.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High').length;
  const totalFindings = reports.reduce((acc, r) => acc + (r.findings?.length || 0), 0);

  // Recharts Chart Data
  // 1. Risk Level Chart Data
  const riskCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  reports.forEach(r => {
    if (riskCounts[r.riskLevel] !== undefined) {
      riskCounts[r.riskLevel]++;
    }
  });
  const riskChartData = Object.keys(riskCounts).map(level => ({
    name: level,
    count: riskCounts[level]
  }));

  // 2. Compliance Status Chart Data
  const complianceCounts = { 'Compliant': 0, 'Non-Compliant': 0, 'Under Review': 0 };
  reports.forEach(r => {
    if (complianceCounts[r.complianceStatus] !== undefined) {
      complianceCounts[r.complianceStatus]++;
    }
  });
  const complianceChartData = Object.keys(complianceCounts).map(status => ({
    name: status,
    value: complianceCounts[status]
  }));

  // Animations Configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 text-left"
    >
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">
            Security Compliance Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Assess vulnerabilities, log risk audits, and monitor enterprise cloud security posture.
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
          <span>Add Security Report</span>
        </motion.button>
      </div>

      {/* Metrics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Reports */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl -mr-4 -mt-4" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reports Logged</span>
          <h3 className="text-3xl font-extrabold text-white mt-4">{totalReports}</h3>
          <p className="text-[10px] text-slate-500 mt-2">Active institution compliance checks</p>
        </motion.div>

        {/* Compliance Rate */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl -mr-4 -mt-4" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliance Rate</span>
          <h3 className="text-3xl font-extrabold text-emerald-400 mt-4">{complianceRate}%</h3>
          <p className="text-[10px] text-slate-500 mt-2">Reports evaluated as fully Compliant</p>
        </motion.div>

        {/* Severe Risks */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-xl -mr-4 -mt-4" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Severe Risk Environments</span>
          <h3 className="text-3xl font-extrabold text-red-400 mt-4">{criticalHighCount}</h3>
          <p className="text-[10px] text-slate-500 mt-2">High or Critical severity reports</p>
        </motion.div>

        {/* Total Findings */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-xl -mr-4 -mt-4" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Vulnerability Logs</span>
          <h3 className="text-3xl font-extrabold text-amber-400 mt-4">{totalFindings}</h3>
          <p className="text-[10px] text-slate-500 mt-2">Identified security threats & issues</p>
        </motion.div>
      </div>

      {/* Recharts Analytics Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6"
        >
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-slate-400">
            Reports by Severity Level
          </h3>
          <div className="h-64 w-full">
            {totalReports === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-650 text-xs">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskChartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {riskChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Compliance Status Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6"
        >
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-slate-400">
            Compliance Status Breakdown
          </h3>
          <div className="h-64 w-full flex flex-col md:flex-row items-center justify-between">
            {totalReports === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-slate-650 text-xs">
                No data available
              </div>
            ) : (
              <>
                <div className="h-48 w-full md:w-1/2 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={complianceChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {complianceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COMPLIANCE_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 mt-4 md:mt-0 space-y-2">
                  {complianceChartData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-900 rounded-xl">
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COMPLIANCE_COLORS[entry.name] }} />
                        <span>{entry.name}</span>
                      </div>
                      <span className="text-xs font-bold text-white">{entry.value} {entry.value === 1 ? 'report' : 'reports'}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Filter and Search Bar */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by institution name..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/40 placeholder-slate-500 text-white text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/80 transition duration-200"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex w-full md:w-auto items-center gap-3">
          {/* Risk Dropdown */}
          <div className="flex-1 md:flex-initial">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-slate-350 text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Severity</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
              <option value="Critical">Critical Risk</option>
            </select>
          </div>

          {/* Compliance Dropdown */}
          <div className="flex-1 md:flex-initial">
            <select
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-slate-350 text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Compliance</option>
              <option value="Compliant">Compliant</option>
              <option value="Non-Compliant">Non-Compliant</option>
              <option value="Under Review">Under Review</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Reports Table Listing */}
      <motion.div variants={itemVariants} className="space-y-4">
        {loading && reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            {/* Custom Premium Loader */}
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/10" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
            </div>
            <p className="text-slate-400 text-sm">Fetching security logs...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-12 text-center">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-slate-400 text-sm font-medium">No security logs found matching query.</p>
          </div>
        ) : (
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-slate-800/60 text-left">
                <thead className="bg-slate-950/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4">Institution</th>
                    <th scope="col" className="px-6 py-4">Risk Severity</th>
                    <th scope="col" className="px-6 py-4">Compliance Status</th>
                    <th scope="col" className="px-6 py-4 text-center">Vulnerabilities</th>
                    <th scope="col" className="px-6 py-4">Audited By</th>
                    <th scope="col" className="px-6 py-4">Audit Date</th>
                    <th scope="col" className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                  {filteredReports.map((report) => {
                    const isExpanded = expandedReportId === report._id;
                    const formattedDate = new Date(report.createdAt).toLocaleDateString();

                    return (
                      <React.Fragment key={report._id}>
                        <tr className="hover:bg-slate-850/30 transition-colors duration-150">
                          {/* Institution */}
                          <td className="px-6 py-4 font-bold text-white max-w-[200px] truncate">
                            {report.institution}
                          </td>
                          {/* Risk Badge */}
                          <td className="px-6 py-4">
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                              style={{
                                color: RISK_COLORS[report.riskLevel],
                                borderColor: `${RISK_COLORS[report.riskLevel]}25`,
                                backgroundColor: `${RISK_COLORS[report.riskLevel]}10`
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: RISK_COLORS[report.riskLevel] }} />
                              {report.riskLevel}
                            </span>
                          </td>
                          {/* Compliance Badge */}
                          <td className="px-6 py-4">
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                              style={{
                                color: COMPLIANCE_COLORS[report.complianceStatus],
                                borderColor: `${COMPLIANCE_COLORS[report.complianceStatus]}25`,
                                backgroundColor: `${COMPLIANCE_COLORS[report.complianceStatus]}10`
                              }}
                            >
                              {report.complianceStatus}
                            </span>
                          </td>
                          {/* Findings count */}
                          <td className="px-6 py-4 text-center font-bold text-slate-350">
                            {report.findings?.length || 0}
                          </td>
                          {/* Auditor name */}
                          <td className="px-6 py-4 text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-[9px] font-extrabold uppercase">
                                {report.creator?.name ? report.creator.name.charAt(0) : 'U'}
                              </span>
                              <span className="truncate max-w-[100px]">{report.creator?.name || 'Assessor'}</span>
                            </div>
                          </td>
                          {/* Audit date */}
                          <td className="px-6 py-4 text-xs text-slate-400">
                            {formattedDate}
                          </td>
                          {/* Action toggle */}
                          <td className="px-6 py-4 text-center">
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleExpandReport(report._id)}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition duration-150 inline-flex items-center space-x-1 ${
                                isExpanded
                                  ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                              }`}
                            >
                              <span>{isExpanded ? 'Hide Findings' : 'Show Findings'}</span>
                              <svg
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                              </svg>
                            </motion.button>
                          </td>
                        </tr>

                        {/* Collapsible Findings Row */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <tr>
                              <td colSpan={7} className="p-0 bg-slate-950/20 border-t border-slate-850/50">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 py-5 space-y-3">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                      Vulnerabilities / Findings Checklist
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                      {report.findings.map((finding, idx) => (
                                        <div
                                          key={idx}
                                          className="p-3 bg-slate-950 border border-slate-900 hover:border-slate-800/80 rounded-xl flex items-start space-x-3 text-left transition-colors"
                                        >
                                          <div className="mt-0.5 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/10 text-[10px] font-bold">
                                            {idx + 1}
                                          </div>
                                          <p className="text-xs text-slate-300 leading-normal">{finding}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* ADD SECURITY REPORT MODAL */}
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
                Submit Security Report
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Log critical audit assessments, vulnerabilities, and compliance results.
              </p>

              <form onSubmit={handleSubmitReport} className="space-y-5">
                {/* Institution */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Institution / Organization Name
                  </label>
                  <input
                    type="text"
                    value={newInstitution}
                    onChange={(e) => setNewInstitution(e.target.value)}
                    placeholder="e.g. HealthCare Cloud Systems"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 placeholder-slate-600 text-white text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/80 transition duration-200"
                  />
                </div>

                {/* Risk and Compliance Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Risk Level */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Risk Level
                    </label>
                    <select
                      value={newRiskLevel}
                      onChange={(e) => setNewRiskLevel(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-white text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/80 transition duration-200"
                    >
                      <option value="Low">Low Risk</option>
                      <option value="Medium">Medium Risk</option>
                      <option value="High">High Risk</option>
                      <option value="Critical">Critical Risk</option>
                    </select>
                  </div>

                  {/* Compliance Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Compliance Status
                    </label>
                    <select
                      value={newComplianceStatus}
                      onChange={(e) => setNewComplianceStatus(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-white text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/80 transition duration-200"
                    >
                      <option value="Compliant">Compliant</option>
                      <option value="Non-Compliant">Non-Compliant</option>
                      <option value="Under Review">Under Review</option>
                    </select>
                  </div>
                </div>

                {/* Findings Builder */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Vulnerabilities / Findings
                    </label>
                    <button
                      type="button"
                      onClick={handleAddFinding}
                      className="text-[10px] font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20"
                    >
                      <span>+ Add Finding</span>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {newFindings.map((finding, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={finding}
                          onChange={(e) => handleFindingChange(index, e.target.value)}
                          placeholder={`Vulnerability / Threat ${index + 1}`}
                          className="flex-1 px-4 py-2 rounded-xl border border-slate-800 bg-slate-950/60 placeholder-slate-650 text-white text-xs focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFinding(index)}
                          className="p-2 text-slate-500 hover:text-red-400 bg-slate-950 border border-slate-850 hover:bg-red-500/10 hover:border-red-500/20 rounded-xl transition-all"
                          title="Remove Finding"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex space-x-3 pt-2 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition duration-150"
                  >
                    Log Report
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Security;
