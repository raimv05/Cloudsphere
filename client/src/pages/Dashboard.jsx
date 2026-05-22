import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  // 1. Line Chart Data: Network Latency (ms) across regions
  const latencyData = [
    { name: 'Jan', Cloudsphere: 42, AWS: 65, Azure: 72 },
    { name: 'Feb', Cloudsphere: 38, AWS: 62, Azure: 68 },
    { name: 'Mar', Cloudsphere: 35, AWS: 58, Azure: 70 },
    { name: 'Apr', Cloudsphere: 30, AWS: 59, Azure: 63 },
    { name: 'May', Cloudsphere: 28, AWS: 54, Azure: 61 },
    { name: 'Jun', Cloudsphere: 22, AWS: 51, Azure: 55 }
  ];

  // 2. Bar Chart Data: Monthly productivity output
  const productivityData = [
    { name: 'Jan', Papers: 145, Surveys: 90 },
    { name: 'Feb', Papers: 180, Surveys: 110 },
    { name: 'Mar', Papers: 210, Surveys: 130 },
    { name: 'Apr', Papers: 225, Surveys: 140 },
    { name: 'May', Papers: 290, Surveys: 175 },
    { name: 'Jun', Papers: 432, Surveys: 218 }
  ];

  // 3. Pie Chart Data: Cloud Provider allocation distribution
  const allocationData = [
    { name: 'Cloudsphere (Local)', value: 35 },
    { name: 'Amazon Web Services', value: 30 },
    { name: 'Google Cloud Platform', value: 20 },
    { name: 'Microsoft Azure', value: 15 }
  ];

  const PIE_COLORS = ['#a855f7', '#f97316', '#10b981', '#3b82f6'];

  const recentScans = [
    { id: 1, event: 'Port vulnerability scan completed', time: '10 mins ago', status: 'clean' },
    { id: 2, event: 'API keys automated rotation', time: '2 hours ago', status: 'success' },
    { id: 3, event: 'Firewall rules check passed', time: '5 hours ago', status: 'clean' },
    { id: 4, event: 'Anomaly detection model updated', time: 'Yesterday', status: 'success' }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  const customTooltipStyle = {
    backgroundColor: '#020617',
    borderColor: '#334155',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '11px'
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 text-left"
    >
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">
            Welcome back, {user?.name || 'Researcher'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time analytics engine and provider distributions.
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Live Session Sync: Active</span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Research Papers */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-5 -mt-5" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">Total Research Papers</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white tracking-tight">1,482</h3>
            <div className="flex items-center space-x-1.5 mt-2">
              <span className="inline-flex items-center text-xs font-semibold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-md">
                +12.3%
              </span>
              <span className="text-[11px] text-slate-500">from last month</span>
            </div>
          </div>
        </motion.div>

        {/* Total Surveys */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-5 -mt-5" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">Total Surveys Completed</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white tracking-tight">863</h3>
            <div className="flex items-center space-x-1.5 mt-2">
              <span className="inline-flex items-center text-xs font-semibold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-md">
                +5.1%
              </span>
              <span className="text-[11px] text-slate-500">since last week</span>
            </div>
          </div>
        </motion.div>

        {/* Security Reports */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-5 -mt-5" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">Security Reports</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white tracking-tight flex items-baseline">
              Secured
              <span className="text-xs font-normal text-emerald-400 ml-2">0 Threats</span>
            </h3>
            <div className="flex items-center space-x-1.5 mt-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-slate-400">All systems fully operational</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 1: Line Chart & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Network Latency Trend (Line Chart)</h3>
              <p className="text-xs text-slate-500 mt-1">Ingress delay trends (ms) across global node gateways.</p>
            </div>
            <span className="px-2.5 py-1 text-[10px] bg-slate-850 text-purple-400 font-mono rounded-lg border border-slate-700/50">Live ping</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Cloudsphere" stroke="#a855f7" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="AWS" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="Azure" stroke="#3b82f6" strokeWidth={2} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          variants={cardVariants}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 flex flex-col"
        >
          <div>
            <h3 className="text-lg font-bold text-white">Infrastructure Allocation (Pie Chart)</h3>
            <p className="text-xs text-slate-500 mt-1">Resource allocation distribution percentage.</p>
          </div>

          <div className="flex-1 h-52 w-full mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Custom Legend */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {allocationData.map((entry, index) => (
              <div key={entry.name} className="flex items-center space-x-2 text-[10px] text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                <span className="truncate">{entry.name} ({entry.value}%)</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 2: Bar Chart & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Productivity Output (Bar Chart)</h3>
              <p className="text-xs text-slate-500 mt-1">Monthly published papers and completed survey responses.</p>
            </div>
            <span className="px-2.5 py-1 text-[10px] bg-slate-850 text-green-400 font-mono rounded-lg border border-slate-700/50">Output up</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Papers" fill="#a855f7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Surveys" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Logs */}
        <motion.div
          variants={cardVariants}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-lg font-bold text-white">Live Operations Logs</h3>
            <p className="text-xs text-slate-500 mt-1">Real-time status updates and diagnostics.</p>

            <div className="mt-5 space-y-3.5">
              {recentScans.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 text-xs border-b border-slate-800/60 pb-3 last:border-b-0 last:pb-0">
                  <div className={`mt-0.5 w-2 h-2 rounded-full ${log.status === 'clean' ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 font-medium truncate">{log.event}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/60">
            <button className="w-full py-2.5 px-4 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition duration-150">
              Run Diagnostic Scan
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
