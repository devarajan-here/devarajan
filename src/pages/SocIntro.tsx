import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useState } from 'react';

const MODULES = [
  {
    id: 'fundamentals',
    icon: '🛡️',
    level: 'Beginner',
    color: 'from-blue-500/20 to-blue-900/10',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-300',
    title: 'SOC Fundamentals',
    subtitle: 'What is a Security Operations Center?',
    topics: [
      'What is a SOC and why it matters',
      'SOC team roles: Tier 1 / Tier 2 / Tier 3 analysts',
      'Understanding alerts, incidents, and events',
      'The alert triage lifecycle',
      'Key KPIs in a SOC environment',
    ],
    status: 'coming-soon',
  },
  {
    id: 'tools',
    icon: '🔧',
    level: 'Intermediate',
    color: 'from-cyan-500/20 to-cyan-900/10',
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/20 text-cyan-300',
    title: 'SOC Tools & Platforms',
    subtitle: "The analyst's toolkit",
    topics: [
      'SIEM deep-dive: Splunk, Wazuh, QRadar',
      'Log ingestion, parsing, and correlation rules',
      'EDR platforms and endpoint visibility',
      'Ticketing & case management (TheHive, JIRA)',
      'Threat intelligence feeds and MISP',
    ],
    status: 'coming-soon',
  },
  {
    id: 'detection',
    icon: '🔍',
    level: 'Intermediate',
    color: 'from-indigo-500/20 to-indigo-900/10',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-500/20 text-indigo-300',
    title: 'Detection Engineering',
    subtitle: 'Building your own detections',
    topics: [
      'MITRE ATT&CK framework overview',
      'Writing SPL queries in Splunk',
      'Sigma rules — what, why, how',
      'Reducing false positives',
      'Detection-as-code principles',
    ],
    status: 'coming-soon',
  },
  {
    id: 'incident',
    icon: '🚨',
    level: 'Advanced',
    color: 'from-purple-500/20 to-purple-900/10',
    border: 'border-purple-500/30',
    badge: 'bg-purple-500/20 text-purple-300',
    title: 'Incident Response',
    subtitle: 'When things go wrong',
    topics: [
      'IR lifecycle: Identify, Contain, Eradicate, Recover',
      'Phishing investigation methodology',
      'Malware triage and sandbox analysis',
      'Ransomware response playbooks',
      'Post-incident lessons learned',
    ],
    status: 'coming-soon',
  },
  {
    id: 'threat-hunting',
    icon: '🏹',
    level: 'Advanced',
    color: 'from-violet-500/20 to-violet-900/10',
    border: 'border-violet-500/30',
    badge: 'bg-violet-500/20 text-violet-300',
    title: 'Threat Hunting',
    subtitle: 'Proactive defense',
    topics: [
      'Hypothesis-driven hunting',
      'Hunting with Zeek network data',
      'Lateral movement detection',
      'Hunting with MITRE ATT&CK',
      'Building a hunting program from scratch',
    ],
    status: 'coming-soon',
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function SocIntro() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#00010f] text-white overflow-x-hidden">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(ellipse at 20% 20%, rgba(59,130,246,0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 80%, rgba(99,102,241,0.06) 0%, transparent 60%),
            linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)`,
          backgroundSize: 'auto, auto, 48px 48px, 48px 48px',
        }}
      />

      {/* Back nav */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate('/nebula/blue-team')}
        className="fixed top-6 left-6 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 backdrop-blur border border-white/15 text-white/70 hover:bg-white/15 hover:text-white transition-all text-sm"
      >
        ← Blue Team Galaxy
      </motion.button>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold tracking-widest uppercase mb-6">
            🔵 SOC Academy
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent leading-tight">
            Security Operations
            <br />Center Academy
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Your complete learning path from SOC fundamentals to advanced threat hunting.
            Structured for aspiring and working security analysts.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            {[
              { label: 'Modules', value: '5' },
              { label: 'Topics', value: '25+' },
              { label: 'Level', value: 'All' },
              { label: 'Status', value: 'In Progress' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-blue-300">{s.value}</div>
                <div className="text-white/40 text-xs mt-1 tracking-wider uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Module cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-5"
        >
          {MODULES.map((mod, idx) => (
            <motion.div
              key={mod.id}
              variants={cardVariants}
              onMouseEnter={() => setHoveredId(mod.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`relative rounded-2xl bg-gradient-to-r ${mod.color} border ${mod.border} p-6 cursor-default transition-all duration-300 ${
                hoveredId === mod.id ? 'scale-[1.01] shadow-lg shadow-blue-500/10' : ''
              }`}
            >
              <div className="flex items-start gap-5">
                {/* Number */}
                <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 font-mono text-sm font-bold">
                  {String(idx + 1).padStart(2, '0')}
                </div>

                {/* Icon + content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-2xl">{mod.icon}</span>
                    <h3 className="text-xl font-semibold text-white">{mod.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${mod.badge}`}>
                      {mod.level}
                    </span>
                    <span className="ml-auto px-3 py-0.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/40">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-white/50 text-sm mb-4">{mod.subtitle}</p>

                  {/* Topics list */}
                  <ul className="grid sm:grid-cols-2 gap-1.5">
                    {mod.topics.map((topic) => (
                      <li key={topic} className="flex items-center gap-2 text-white/60 text-sm">
                        <span className="w-1 h-1 rounded-full bg-blue-400/60 shrink-0" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Hover glow */}
              {hoveredId === mod.id && (
                <div className="absolute inset-0 rounded-2xl ring-1 ring-blue-400/30 pointer-events-none" />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-16 text-white/25 text-sm"
        >
          🚀 Content modules are being built — check back soon!
        </motion.div>
      </div>
    </div>
  );
}
