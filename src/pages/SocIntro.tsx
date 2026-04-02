import { useState } from 'react';
import { useNavigate } from 'react-router';
import './SocBlueprint.css';

type TabId = 'overview' | 'tools' | 'people' | 'process' | 'implementation';

export default function SocIntro() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'tools', label: 'Tools & Tech' },
    { id: 'people', label: 'People & Roles' },
    { id: 'process', label: 'Process & Workflow' },
    { id: 'implementation', label: 'Implementation' },
  ];

  return (
    <div className="soc-blueprint">
      <div className="scanline" />
      <button className="back-btn" onClick={() => navigate('/nebula/blue-team')}>← Blue Team Galaxy</button>
      <div className="soc-container">
        <header>
          <div className="header-tag">// enterprise security operations</div>
          <h1>SOC <span>Infrastructure Blueprint</span></h1>
          <div className="subtitle">[ COMPLETE STRUCTURE · TOOLS · PEOPLE · PROCESS ]</div>
        </header>

        <div className="tabs">
          {tabs.map(t => (
            <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        <div className={`tab-content ${activeTab === 'overview' ? 'active' : ''}`} style={{ display: activeTab === 'overview' ? 'block' : 'none' }}>
          <div className="metric-row">
            <div className="metric"><span className="metric-val">3</span><div className="metric-label">Analyst Tiers</div></div>
            <div className="metric"><span className="metric-val">7+</span><div className="metric-label">Core Tool Layers</div></div>
            <div className="metric"><span className="metric-val">24/7</span><div className="metric-label">Operations</div></div>
            <div className="metric"><span className="metric-val">360°</span><div className="metric-label">Visibility</div></div>
          </div>
          <div className="section-title" style={{ color: 'var(--accent)' }}>Architecture Layers</div>
          <div style={{ marginBottom: 30 }}>
            {[
              { label: 'Layer 7 — Management & Governance', items: ['SOC Manager','CISO','Risk & Compliance','Reporting Dashboard'], color: '#fff', bc: 'rgba(255,255,255,0.3)' },
              { label: 'Layer 6 — Threat Intelligence', items: ['CTI Platform','IOC Feeds','Dark Web Monitor','MITRE ATT&CK'], color: 'var(--warn)', bc: 'rgba(255,204,0,0.3)' },
              { label: 'Layer 5 — Response & Orchestration', items: ['SOAR','Ticketing (ITSM)','Playbooks','IR Team'], color: 'var(--accent3)', bc: 'rgba(0,255,136,0.3)' },
              { label: 'Layer 4 — Correlation & Analytics (SIEM)', items: ['Splunk','QRadar','Wazuh','ELK Stack','UEBA'], color: 'var(--accent)', bc: 'rgba(0,212,255,0.3)' },
              { label: 'Layer 3 — Endpoint Detection (EDR / XDR)', items: ['CrowdStrike','SentinelOne','Microsoft Defender XDR','Palo Alto XDR'], color: 'var(--accent2)', bc: 'rgba(255,107,53,0.3)' },
              { label: 'Layer 2 — Network Security (IDS / IPS / Firewall)', items: ['Firewall (NGFW)','IDS','IPS','WAF','DLP','Proxy / DNS Filter'], color: 'var(--red)', bc: 'rgba(255,51,102,0.3)' },
              { label: 'Layer 1 — Asset & Data Sources', items: ['Endpoints','Servers','Network Devices','Cloud (AWS/Azure)','Applications','Active Directory','Email'], color: 'var(--dim)', bc: 'rgba(74,106,128,0.4)' },
            ].map((layer, i) => (
              <div className="arch-layer" key={i}>
                <div className="layer-label">{layer.label}</div>
                <div className="layer-items">
                  {layer.items.map(item => (
                    <div className="layer-item" key={item} style={{ color: layer.color, borderColor: layer.bc }}>{item}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOOLS */}
        <div className={`tab-content ${activeTab === 'tools' ? 'active' : ''}`} style={{ display: activeTab === 'tools' ? 'block' : 'none' }}>
          <div className="section-title" style={{ color: 'var(--accent)' }}>SIEM — Security Information & Event Management</div>
          <div className="grid-2" style={{ marginBottom: 30 }}>
            <div className="card blue">
              <div className="card-header"><div className="card-icon">📊</div><div className="card-title">What SIEM Does</div><span className="badge badge-blue">Core</span></div>
              <p>Collects logs from every device — firewalls, endpoints, servers, apps — and correlates them to detect attack patterns in real time.</p>
              <div className="tag-list"><span className="tag">Log Collection</span><span className="tag">Correlation Rules</span><span className="tag">Alerting</span><span className="tag">Dashboards</span><span className="tag">Compliance Reports</span></div>
            </div>
            <div className="card blue">
              <div className="card-header"><div className="card-icon">🔧</div><div className="card-title">SIEM Products</div><span className="badge badge-blue">Options</span></div>
              <p><strong style={{ color: '#fff' }}>Splunk</strong> — Enterprise-grade, powerful SPL query language.<br />
              <strong style={{ color: '#fff' }}>IBM QRadar</strong> — Strong network visibility.<br />
              <strong style={{ color: '#fff' }}>Wazuh</strong> — Open source, HIDS built-in.<br />
              <strong style={{ color: '#fff' }}>ELK Stack</strong> — Flexible, open source.<br />
              <strong style={{ color: '#fff' }}>Microsoft Sentinel</strong> — Cloud-native, ideal for Azure.</p>
            </div>
          </div>

          <div className="section-title" style={{ color: 'var(--accent2)' }}>EDR & XDR — Endpoint / Extended Detection & Response</div>
          <div className="grid-3" style={{ marginBottom: 30 }}>
            <div className="card orange">
              <div className="card-header"><div className="card-icon">💻</div><div className="card-title">EDR</div><span className="badge badge-orange">Endpoint</span></div>
              <p>Installed on every endpoint. Monitors process execution, file changes, registry, memory. Can isolate compromised machines remotely.</p>
              <div className="tag-list"><span className="tag orange">CrowdStrike Falcon</span><span className="tag orange">SentinelOne</span><span className="tag orange">Carbon Black</span></div>
            </div>
            <div className="card orange">
              <div className="card-header"><div className="card-icon">🌐</div><div className="card-title">XDR</div><span className="badge badge-orange">Extended</span></div>
              <p>EDR + Network + Cloud + Email unified. Correlates detections across all layers. Reduces alert fatigue by connecting related events.</p>
              <div className="tag-list"><span className="tag orange">MS Defender XDR</span><span className="tag orange">Palo Alto Cortex</span><span className="tag orange">Trend Micro XDR</span></div>
            </div>
            <div className="card orange">
              <div className="card-header"><div className="card-icon">🤖</div><div className="card-title">MDR</div><span className="badge badge-orange">Managed</span></div>
              <p>Managed Detection & Response — MDR vendors provide 24/7 monitoring as a service using their own analysts and tools.</p>
              <div className="tag-list"><span className="tag orange">CrowdStrike MDR</span><span className="tag orange">Sophos MDR</span></div>
            </div>
          </div>

          <div className="section-title" style={{ color: 'var(--red)' }}>Network Security — IDS, IPS, Firewall, WAF</div>
          <div style={{ overflowX: 'auto', marginBottom: 30 }}>
            <table className="tool-table">
              <thead><tr><th>Tool</th><th>Full Name</th><th>Function</th><th>Where Deployed</th><th>Products</th></tr></thead>
              <tbody>
                {[
                  ['NGFW','Next-Gen Firewall','Allow/block traffic, deep packet inspection','Network perimeter','Palo Alto, Fortinet, Check Point'],
                  ['IDS','Intrusion Detection System','Passively monitors traffic and alerts on suspicious patterns','Network tap / span port','Snort, Suricata, Zeek'],
                  ['IPS','Intrusion Prevention System','Inline — actively blocks malicious traffic in real time','Inline on network path','Snort (inline), Suricata, Cisco Firepower'],
                  ['WAF','Web App Firewall','Protects web apps from SQLi, XSS, OWASP Top 10','In front of web servers','Cloudflare, AWS WAF, F5, Imperva'],
                  ['DLP','Data Loss Prevention','Detects and prevents unauthorized data exfiltration','Endpoint, email, network','Symantec DLP, Forcepoint, Microsoft Purview'],
                  ['NDR','Network Detection & Response','Behavioral analytics on network traffic, detects lateral movement','Core network','Darktrace, ExtraHop, Vectra AI'],
                ].map(([tool, full, func, where, products]) => (
                  <tr key={tool}><td><div className="tool-name">{tool}</div></td><td>{full}</td><td>{func}</td><td>{where}</td><td>{products}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section-title" style={{ color: 'var(--accent3)' }}>Supporting Tools</div>
          <div className="grid-3">
            {[
              { icon: '⚡', title: 'SOAR', badge: 'Automation', desc: 'Security Orchestration, Automation & Response. Automates repetitive tasks: phishing analysis, IOC blocking, ticket creation.', tags: ['Splunk SOAR','Palo Alto XSOAR','IBM SOAR'] },
              { icon: '🔍', title: 'CTI Platform', badge: 'Intelligence', desc: 'Cyber Threat Intelligence. Aggregates IOCs from global feeds, enriches alerts, gives context about attackers.', tags: ['MISP','ThreatConnect','VirusTotal','AlienVault OTX'] },
              { icon: '🔑', title: 'IAM / PAM', badge: 'Identity', desc: 'Identity & Privileged Access Management. MFA enforcement, least-privilege, privileged session recording.', tags: ['CyberArk','BeyondTrust','Okta','Azure AD'] },
              { icon: '📧', title: 'Email Security', badge: 'Perimeter', desc: 'Anti-phishing, anti-spam, sandboxing of attachments. Email is the #1 initial access vector.', tags: ['Proofpoint','Mimecast','MS Defender for O365'] },
              { icon: '🛡️', title: 'Vulnerability Mgmt', badge: 'Risk', desc: 'Continuously scans assets for CVEs, misconfigs, and patch gaps. Prioritizes remediation by risk score.', tags: ['Tenable Nessus','Qualys','Rapid7'] },
              { icon: '🗂️', title: 'Ticketing / ITSM', badge: 'Operations', desc: 'Tracks every alert-to-resolution cycle. Measures MTTR, analyst workload, SLA compliance.', tags: ['ServiceNow','Jira','TheHive'] },
            ].map(item => (
              <div className="card green" key={item.title}>
                <div className="card-header"><div className="card-icon">{item.icon}</div><div className="card-title">{item.title}</div><span className="badge badge-green">{item.badge}</span></div>
                <p>{item.desc}</p>
                <div className="tag-list">{item.tags.map(t => <span className="tag green" key={t}>{t}</span>)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PEOPLE */}
        <div className={`tab-content ${activeTab === 'people' ? 'active' : ''}`} style={{ display: activeTab === 'people' ? 'block' : 'none' }}>
          <div className="section-title" style={{ color: 'var(--accent)' }}>Leadership</div>
          <div className="grid-2" style={{ marginBottom: 30 }}>
            <div className="person-card">
              <div className="person-role">CISO</div>
              <div className="person-level" style={{ color: 'var(--warn)' }}>// C-Suite Executive</div>
              <p>Chief Information Security Officer. Owns the entire security strategy, reports to the board.</p>
              <ul className="resp-list"><li>Security policy & governance</li><li>Budget ownership</li><li>Board/executive reporting</li><li>Regulatory compliance oversight</li><li>Risk management strategy</li></ul>
            </div>
            <div className="person-card">
              <div className="person-role">SOC Manager</div>
              <div className="person-level" style={{ color: 'var(--warn)' }}>// Operations Lead</div>
              <p>Runs day-to-day SOC operations. Manages analyst teams, SLAs, shift schedules, metrics.</p>
              <ul className="resp-list"><li>Analyst team management</li><li>SLA & KPI ownership (MTTD, MTTR)</li><li>Shift scheduling (24/7 coverage)</li><li>Tool procurement & tuning</li><li>Escalation point for major incidents</li></ul>
            </div>
          </div>

          <div className="section-title" style={{ color: 'var(--accent)' }}>Analyst Tiers</div>
          {[
            { num: 'T1', numColor: 'var(--accent3)', title: 'Tier 1 — Security Analyst (Alert Triage)', sub: '// First responder · Entry level · High volume', badge: 'Entry', badgeClass: 'badge-green',
              duties: ['Monitor SIEM dashboard 24/7','Triage incoming alerts (true/false positive)','Create initial incident tickets','Basic IOC lookup (VirusTotal, Shodan)','Escalate confirmed threats to T2'],
              tools: ['SIEM (Splunk / Wazuh / QRadar)','Ticketing system','EDR console (read-only)','Threat intel lookups'],
              skills: ['Basic networking (TCP/IP, DNS)','Log reading fundamentals','Alert triage methodology','CompTIA Security+ level'] },
            { num: 'T2', numColor: 'var(--accent)', title: 'Tier 2 — Incident Responder', sub: '// Investigation · Containment · Mid-level', badge: 'Mid', badgeClass: 'badge-blue',
              duties: ['Deep-dive investigation on T1 escalations','Contain & isolate affected endpoints','Malware triage & sandbox analysis','Attack timeline reconstruction','Evidence collection for forensics'],
              tools: ['EDR (full access — CrowdStrike/S1)','SOAR playbooks','Sandbox (Any.run, Cuckoo)','Packet capture (Wireshark)'],
              skills: ['DFIR fundamentals','Malware analysis basics','MITRE ATT&CK proficiency','Scripting (Python/Bash)'] },
            { num: 'T3', numColor: 'var(--accent2)', title: 'Tier 3 — Threat Hunter / Senior IR', sub: '// Proactive hunting · Advanced forensics · Senior', badge: 'Senior', badgeClass: 'badge-orange',
              duties: ['Proactive threat hunting','Advanced malware reverse engineering','Develop detection rules & SIEM content','Handle APT-level incidents','Forensic analysis & root cause'],
              tools: ['All SOC tools (full access)','IDA Pro / Ghidra (RE)','Sigma / Yara rule writing','Memory forensics (Volatility)'],
              skills: ['Advanced DFIR','Reverse engineering','Custom detection engineering','OSCP / GCFA / GCFE level'] },
          ].map(tier => (
            <div className="tier-block" key={tier.num}>
              <div className="tier-header">
                <div className="tier-num" style={{ color: tier.numColor }}>{tier.num}</div>
                <div className="tier-info"><h3>{tier.title}</h3><p>{tier.sub}</p></div>
                <span className={`badge ${tier.badgeClass}`}>{tier.badge}</span>
              </div>
              <div className="tier-body">
                <div className="tier-col"><h4>Primary Duties</h4><ul>{tier.duties.map(d => <li key={d}>{d}</li>)}</ul></div>
                <div className="tier-col"><h4>Tools Used</h4><ul>{tier.tools.map(d => <li key={d}>{d}</li>)}</ul></div>
                <div className="tier-col"><h4>Skills Required</h4><ul>{tier.skills.map(d => <li key={d}>{d}</li>)}</ul></div>
              </div>
            </div>
          ))}

          <div className="section-title" style={{ color: 'var(--accent)' }}>Supporting Roles</div>
          <div className="grid-3">
            {[
              { role: 'CTI Analyst', level: '// Threat Intelligence', levelColor: 'var(--accent)', desc: 'Researches threat actors, TTPs, emerging campaigns. Feeds actionable intelligence into SIEM rules.', resp: ['IOC collection & distribution','Actor attribution research','Threat landscape reporting'] },
              { role: 'Security Engineer', level: '// Tool & Infrastructure', levelColor: 'var(--accent)', desc: 'Maintains and tunes all SOC tooling. Writes SIEM correlation rules, manages SOAR playbooks.', resp: ['SIEM content development','Tool integration & health','Detection rule optimization'] },
              { role: 'Red Team / Pentest', level: '// Offensive Security', levelColor: 'var(--red)', desc: 'Simulates real attacks to test SOC detection capabilities. Works with blue team to improve detection gaps.', resp: ['Penetration testing','Purple team exercises','Detection gap analysis'] },
              { role: 'Compliance Analyst', level: '// GRC', levelColor: 'var(--warn)', desc: 'Ensures the organization meets security frameworks: ISO 27001, SOC 2, NIST CSF, PCI-DSS.', resp: ['Policy documentation','Audit support & evidence','Risk register management'] },
              { role: 'DFIR Specialist', level: '// Forensics', levelColor: 'var(--accent2)', desc: 'Digital Forensics & Incident Response specialist. Collects forensic images, performs memory analysis.', resp: ['Disk & memory acquisition','Chain of custody','Court-ready reporting'] },
              { role: 'Network Security Eng.', level: '// Infrastructure', levelColor: 'var(--accent)', desc: 'Owns the firewall, IDS/IPS, and network segmentation. Tunes network-level detections.', resp: ['Firewall rule management','Network segmentation (VLANs)','IDS/IPS signature tuning'] },
            ].map(p => (
              <div className="person-card" key={p.role}>
                <div className="person-role">{p.role}</div>
                <div className="person-level" style={{ color: p.levelColor }}>{p.level}</div>
                <p>{p.desc}</p>
                <ul className="resp-list">{p.resp.map(r => <li key={r}>{r}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>

        {/* PROCESS */}
        <div className={`tab-content ${activeTab === 'process' ? 'active' : ''}`} style={{ display: activeTab === 'process' ? 'block' : 'none' }}>
          <div className="section-title" style={{ color: 'var(--accent)' }}>Alert Lifecycle (Detection → Resolution)</div>
          <div className="phases" style={{ marginBottom: 30 }}>
            {[
              { num: '1', title: 'Detection', time: '// SIEM / EDR / IDS', items: ['Log ingested into SIEM','Correlation rule fires','Alert generated','Severity auto-assigned'] },
              { num: '2', title: 'Triage', time: '// T1 Analyst', items: ['T1 receives alert ticket','True/false positive check','Initial IOC lookups','Escalate if confirmed'] },
              { num: '3', title: 'Investigation', time: '// T2 Analyst', items: ['Timeline reconstruction','Scope determination','Asset impact mapping','Evidence preservation'] },
              { num: '4', title: 'Containment', time: '// T2 / T3', items: ['Isolate endpoint via EDR','Block IOCs in firewall','Disable compromised accounts','Stop lateral movement'] },
              { num: '5', title: 'Eradication', time: '// T3 / DFIR', items: ['Remove malware artifacts','Patch exploited vuln','Reset credentials','Rebuild if needed'] },
              { num: '6', title: 'Recovery', time: '// IT + SOC', items: ['Restore from clean backup','Monitor for recurrence','Validate system integrity','Resume operations'] },
              { num: '7', title: 'Post-Incident', time: '// Management', items: ['Lessons learned session','Detection rule improvement','Report to stakeholders','Update playbooks'] },
            ].map(phase => (
              <div className="phase" key={phase.num}>
                <div className="phase-num">{phase.num}</div>
                <h4>{phase.title}</h4>
                <div className="phase-time">{phase.time}</div>
                <ul>{phase.items.map(item => <li key={item}>{item}</li>)}</ul>
              </div>
            ))}
          </div>

          <div className="section-title" style={{ color: 'var(--accent)' }}>Key Metrics SOC Tracks</div>
          <div className="grid-4" style={{ marginBottom: 30 }}>
            {[
              { title: 'MTTD', desc: 'Mean Time to Detect — how fast you discover an attack after it begins.', target: 'Target: < 1 hour' },
              { title: 'MTTR', desc: 'Mean Time to Respond — time from detection to containment complete.', target: 'Target: < 4 hours' },
              { title: 'False Positive Rate', desc: '% of alerts that turn out to be benign. High FP rate burns out analysts.', target: 'Target: < 10%' },
              { title: 'Alert Volume', desc: 'Daily alerts per analyst. Too many = missed incidents.', target: 'Target: < 100/analyst/day' },
            ].map(m => (
              <div className="card blue" key={m.title}>
                <div className="card-title" style={{ marginBottom: 8 }}>{m.title}</div>
                <p style={{ fontSize: 12 }}>{m.desc}</p>
                <span className="badge badge-blue">{m.target}</span>
              </div>
            ))}
          </div>

          <div className="section-title" style={{ color: 'var(--accent)' }}>Shift & Coverage Model</div>
          <div className="grid-2">
            <div className="card yellow">
              <div className="card-header"><div className="card-icon">🕐</div><div className="card-title">24/7 Coverage</div></div>
              <p>For enterprise SOCs. Three 8-hour shifts. Each shift has a T1 and T2 minimum. T3 on call for critical incidents.</p>
              <div className="tag-list"><span className="tag" style={{ borderColor: 'rgba(255,204,0,0.3)', color: 'var(--warn)' }}>Day Shift</span><span className="tag" style={{ borderColor: 'rgba(255,204,0,0.3)', color: 'var(--warn)' }}>Evening Shift</span><span className="tag" style={{ borderColor: 'rgba(255,204,0,0.3)', color: 'var(--warn)' }}>Night Shift</span></div>
            </div>
            <div className="card yellow">
              <div className="card-header"><div className="card-icon">🕗</div><div className="card-title">Business Hours + On-Call</div></div>
              <p>For SMBs. Active monitoring during business hours, SOAR automation + on-call analyst for after-hours critical alerts.</p>
              <div className="tag-list"><span className="tag" style={{ borderColor: 'rgba(255,204,0,0.3)', color: 'var(--warn)' }}>9-6 Active</span><span className="tag" style={{ borderColor: 'rgba(255,204,0,0.3)', color: 'var(--warn)' }}>On-Call OOH</span><span className="tag" style={{ borderColor: 'rgba(255,204,0,0.3)', color: 'var(--warn)' }}>SOAR Automation</span></div>
            </div>
          </div>
        </div>

        {/* IMPLEMENTATION */}
        <div className={`tab-content ${activeTab === 'implementation' ? 'active' : ''}`} style={{ display: activeTab === 'implementation' ? 'block' : 'none' }}>
          <div className="section-title" style={{ color: 'var(--accent)' }}>Build Phases (Startup → Mature SOC)</div>
          <div className="phases" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 30 }}>
            {[
              { num: 'P1', title: 'Foundation', time: '// Month 1–2', items: ['Asset inventory','Deploy SIEM (Wazuh/ELK)','Onboard critical log sources','Basic alert rules','Hire T1 analysts'] },
              { num: 'P2', title: 'Detection', time: '// Month 3–4', items: ['Deploy EDR on all endpoints','Configure IDS/IPS','Tune SIEM rules','Set up ticketing','Document IR playbooks'] },
              { num: 'P3', title: 'Response', time: '// Month 5–6', items: ['Implement SOAR automation','Add CTI feeds (MISP)','Hire T2 / IR analysts','Tabletop exercises','Red team / pentest'] },
              { num: 'P4', title: 'Optimization', time: '// Month 7–12', items: ['Threat hunting program','Tune false positive rate','Vulnerability management','Metrics & KPI dashboards','Compliance mapping'] },
            ].map(phase => (
              <div className="phase" key={phase.num} style={{ background: 'rgba(0,212,255,0.04)' }}>
                <div className="phase-num">{phase.num}</div>
                <h4>{phase.title}</h4>
                <div className="phase-time">{phase.time}</div>
                <ul>{phase.items.map(item => <li key={item}>{item}</li>)}</ul>
              </div>
            ))}
          </div>

          <div className="section-title" style={{ color: 'var(--accent)' }}>Minimum Viable SOC Checklist</div>
          <ul className="checklist" style={{ marginBottom: 30 }}>
            {[
              'SIEM deployed with key log sources (AD, firewall, endpoints)',
              'EDR installed on 100% of endpoints',
              'Firewall (NGFW) at network perimeter',
              'IDS/IPS configured and feeding logs to SIEM',
              'Email security gateway in place',
              'MFA enforced on all accounts',
              'Incident response plan documented',
              'Ticketing system for alert tracking',
              'At least 2 trained T1 analysts per shift',
              'Log retention policy (min 90 days)',
              'Network segmentation (VLANs)',
              'Vulnerability scanning cadence (weekly)',
              'Backup & recovery tested and verified',
              'Security awareness training for employees',
            ].map(item => (
              <li key={item}><span className="check-icon" style={{ color: 'var(--accent3)' }}>✓</span>{item}</li>
            ))}
          </ul>

          <div className="section-title" style={{ color: 'var(--accent)' }}>Budget Tiers (Rough Guidance)</div>
          <div className="grid-3">
            <div className="card green">
              <div className="card-header"><div className="card-icon">🌱</div><div className="card-title">SMB SOC</div><span className="badge badge-green">Startup</span></div>
              <p>Open source tools, small team, business hours coverage. Suitable for companies under 500 employees.</p>
              <div className="tag-list"><span className="tag green">Wazuh</span><span className="tag green">Snort/Suricata</span><span className="tag green">TheHive</span><span className="tag green">MISP</span><span className="tag green">pfSense</span></div>
            </div>
            <div className="card blue">
              <div className="card-header"><div className="card-icon">🏢</div><div className="card-title">Mid-Market SOC</div><span className="badge badge-blue">Growing</span></div>
              <p>Mix of commercial + open source. 24/5 or 24/7 with on-call. 5–10 person team.</p>
              <div className="tag-list"><span className="tag">Splunk</span><span className="tag">SentinelOne</span><span className="tag">Palo Alto FW</span><span className="tag">Proofpoint</span></div>
            </div>
            <div className="card orange">
              <div className="card-header"><div className="card-icon">🏛️</div><div className="card-title">Enterprise SOC</div><span className="badge badge-orange">Full Scale</span></div>
              <p>Full commercial stack, 24/7 with multiple shifts, 15+ analysts, red team, CTI program.</p>
              <div className="tag-list"><span className="tag orange">Splunk Enterprise</span><span className="tag orange">CrowdStrike</span><span className="tag orange">QRadar</span><span className="tag orange">XSOAR</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
