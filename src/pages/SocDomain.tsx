import { useNavigate, useParams } from 'react-router';
import './SocBlueprint.css';

type Domain = {
  title: string;
  subtitle: string;
  metrics: string[];
  overview: string;
  workflow: string[];
  tools: string[];
  analystFocus: string[];
  outputs: string[];
};

const DOMAINS: Record<string, Domain> = {
  siem: {
    title: 'SIEM',
    subtitle: 'Security Information and Event Management',
    metrics: ['Log Sources', 'Correlation', 'Dashboards', 'Alerting'],
    overview: 'SIEM is the central nervous system of a SOC. It collects logs from endpoints, servers, firewalls, identity systems, cloud platforms, and applications, then correlates that telemetry to detect suspicious behavior.',
    workflow: ['Collect logs from critical assets', 'Normalize and parse events', 'Apply correlation rules and detections', 'Create alerts with severity and context', 'Send confirmed alerts into triage or case management'],
    tools: ['Splunk', 'Microsoft Sentinel', 'Wazuh', 'Elastic SIEM', 'IBM QRadar', 'Graylog'],
    analystFocus: ['Know important Windows Event IDs', 'Understand firewall, DNS, proxy, and authentication logs', 'Write useful searches and dashboards', 'Tune noisy detections'],
    outputs: ['Security alerts', 'Compliance reports', 'Investigation timelines', 'Executive dashboards'],
  },
  'threat-intel': {
    title: 'Threat Intel',
    subtitle: 'IOCs, TTPs, actor tracking, and enrichment',
    metrics: ['IOCs', 'TTPs', 'Feeds', 'Context'],
    overview: 'Threat intelligence helps the SOC understand who may attack, how they operate, and what indicators or behaviors to look for. It turns raw alerts into informed investigations.',
    workflow: ['Collect IOCs from trusted feeds', 'Map activity to MITRE ATT&CK', 'Enrich SIEM and EDR alerts', 'Track campaigns and threat actors', 'Convert intelligence into detections'],
    tools: ['MISP', 'VirusTotal', 'AlienVault OTX', 'ThreatConnect', 'Recorded Future', 'MITRE ATT&CK'],
    analystFocus: ['Separate useful intelligence from noisy feeds', 'Understand hashes, IPs, domains, URLs, and file paths', 'Recognize attacker techniques', 'Write clear threat briefs'],
    outputs: ['IOC lists', 'Threat reports', 'Detection ideas', 'Campaign summaries'],
  },
  forensics: {
    title: 'Forensics',
    subtitle: 'Evidence, disk, memory, and timeline analysis',
    metrics: ['Evidence', 'Timeline', 'Memory', 'Root Cause'],
    overview: 'Digital forensics preserves and analyzes evidence after suspicious activity. It helps prove what happened, when it happened, how far it spread, and what must be fixed.',
    workflow: ['Preserve evidence and chain of custody', 'Collect disk, memory, and logs', 'Build a timeline of attacker actions', 'Identify persistence and exfiltration', 'Write findings for remediation'],
    tools: ['Autopsy', 'FTK Imager', 'Volatility', 'KAPE', 'Velociraptor', 'Plaso/log2timeline'],
    analystFocus: ['Avoid contaminating evidence', 'Understand file systems and artifacts', 'Analyze memory and process activity', 'Write clear forensic notes'],
    outputs: ['Forensic timeline', 'Root-cause report', 'Evidence package', 'Lessons learned'],
  },
  compliance: {
    title: 'Compliance',
    subtitle: 'Frameworks, controls, audit evidence, and governance',
    metrics: ['NIST', 'ISO 27001', 'SOC 2', 'Evidence'],
    overview: 'Compliance connects SOC operations to business and regulatory requirements. It proves that security controls exist, operate effectively, and are continuously improved.',
    workflow: ['Map controls to frameworks', 'Collect evidence from tools and processes', 'Track exceptions and risk acceptance', 'Support audits and assessments', 'Report gaps to leadership'],
    tools: ['ServiceNow GRC', 'Drata', 'Vanta', 'Microsoft Purview', 'Jira', 'Confluence'],
    analystFocus: ['Understand control objectives', 'Document evidence clearly', 'Know policy and procedure basics', 'Translate technical risk for management'],
    outputs: ['Audit evidence', 'Risk register', 'Policy documents', 'Control status reports'],
  },
  'alert-triage': {
    title: 'Alert Triage',
    subtitle: 'Validate, enrich, prioritize, and escalate',
    metrics: ['Severity', 'Context', 'False Positive', 'Escalation'],
    overview: 'Alert triage is the first decision point in the SOC. Analysts decide whether an alert is benign, suspicious, or confirmed malicious, then route it to the right response path.',
    workflow: ['Review alert details and affected asset', 'Check user, host, and network context', 'Enrich IOCs with reputation data', 'Decide true positive or false positive', 'Escalate confirmed incidents to T2/T3'],
    tools: ['SIEM', 'EDR console', 'VirusTotal', 'AbuseIPDB', 'Ticketing system', 'Whois/DNS tools'],
    analystFocus: ['Read logs quickly', 'Ask what changed and why', 'Avoid closing alerts without evidence', 'Write useful ticket notes'],
    outputs: ['Triaged alert', 'Escalated case', 'False-positive tuning request', 'Initial investigation notes'],
  },
  'incident-response': {
    title: 'Incident Response',
    subtitle: 'Contain, eradicate, recover, and improve',
    metrics: ['MTTD', 'MTTR', 'Containment', 'Recovery'],
    overview: 'Incident response turns confirmed security events into controlled actions. The goal is to limit impact, remove the attacker, restore services, and prevent recurrence.',
    workflow: ['Confirm scope and severity', 'Contain affected users, hosts, or networks', 'Eradicate malware or persistence', 'Recover systems safely', 'Run post-incident review'],
    tools: ['EDR', 'SOAR', 'SIEM', 'Firewall', 'IAM admin tools', 'Backup platform'],
    analystFocus: ['Follow playbooks under pressure', 'Communicate clearly', 'Preserve evidence before cleanup', 'Validate recovery before closure'],
    outputs: ['Incident timeline', 'Containment actions', 'Recovery validation', 'Lessons learned report'],
  },
  'threat-hunting': {
    title: 'Threat Hunting',
    subtitle: 'Proactive hypotheses, anomalies, and hidden attacker behavior',
    metrics: ['Hypothesis', 'Telemetry', 'Anomaly', 'Detection Gap'],
    overview: 'Threat hunting is proactive searching for attacker behavior that did not trigger an alert. It uses hypotheses, data, and attacker tradecraft to find hidden compromise.',
    workflow: ['Choose a hypothesis from ATT&CK or threat intel', 'Identify required telemetry', 'Query SIEM, EDR, DNS, proxy, and identity logs', 'Investigate anomalies', 'Turn findings into detections'],
    tools: ['Splunk/Sentinel', 'EDR advanced hunting', 'Zeek', 'Sigma', 'KQL/SPL', 'Jupyter notebooks'],
    analystFocus: ['Think in behaviors, not only IOCs', 'Know normal baseline activity', 'Document queries and assumptions', 'Convert hunts into repeatable detections'],
    outputs: ['Hunt report', 'New detection rule', 'Confirmed incident', 'Visibility gap list'],
  },
  'detection-engineering': {
    title: 'Detection Engineering',
    subtitle: 'Rules, analytics, Sigma, YARA, and detection quality',
    metrics: ['Rules', 'Coverage', 'Tuning', 'ATT&CK'],
    overview: 'Detection engineering creates and improves the logic that finds attacks. It bridges threat intelligence, logs, SIEM rules, EDR analytics, and measurable detection coverage.',
    workflow: ['Define attacker behavior to detect', 'Choose the best log source', 'Write and test detection logic', 'Reduce false positives', 'Map coverage to MITRE ATT&CK'],
    tools: ['Sigma', 'YARA', 'Splunk SPL', 'KQL', 'Detection-as-code', 'Atomic Red Team'],
    analystFocus: ['Know data fields and log quality', 'Test rules with real or simulated events', 'Version detections', 'Measure noise and coverage'],
    outputs: ['SIEM rules', 'YARA/Sigma rules', 'Detection coverage map', 'Tuning notes'],
  },
  soar: {
    title: 'SOAR',
    subtitle: 'Security orchestration, automation, and response',
    metrics: ['Playbooks', 'Automation', 'Enrichment', 'Response'],
    overview: 'SOAR automates repetitive SOC tasks and connects tools together. It speeds up enrichment, ticket creation, containment actions, and analyst workflows.',
    workflow: ['Trigger playbook from SIEM alert', 'Enrich IPs, domains, files, and users', 'Create or update ticket', 'Run approved containment actions', 'Notify analysts and stakeholders'],
    tools: ['Splunk SOAR', 'Palo Alto XSOAR', 'Tines', 'Shuffle', 'n8n', 'TheHive Cortex'],
    analystFocus: ['Automate safe repeatable tasks', 'Keep human approval for risky actions', 'Handle failures gracefully', 'Measure time saved'],
    outputs: ['Automated playbook', 'Enriched case', 'Containment action', 'Workflow metrics'],
  },
  edr: {
    title: 'EDR',
    subtitle: 'Endpoint detection, telemetry, and response',
    metrics: ['Process', 'File', 'Registry', 'Isolation'],
    overview: 'EDR monitors endpoint behavior and gives the SOC the ability to investigate and respond on hosts. It is essential for malware, ransomware, and lateral movement detection.',
    workflow: ['Collect process, file, network, and user telemetry', 'Detect suspicious endpoint behavior', 'Investigate process trees and artifacts', 'Isolate compromised host if needed', 'Remediate or rebuild'],
    tools: ['Microsoft Defender for Endpoint', 'CrowdStrike Falcon', 'SentinelOne', 'Carbon Black', 'Sophos Intercept X'],
    analystFocus: ['Read process trees', 'Understand parent-child execution', 'Know persistence locations', 'Use isolation carefully'],
    outputs: ['Endpoint alert', 'Host timeline', 'Containment action', 'Remediation evidence'],
  },
  ndr: {
    title: 'NDR',
    subtitle: 'Network detection, traffic analysis, and lateral movement',
    metrics: ['DNS', 'HTTP', 'Flows', 'Lateral Movement'],
    overview: 'NDR detects suspicious behavior in network traffic. It helps find command-and-control, scanning, lateral movement, and data exfiltration that endpoint tools may miss.',
    workflow: ['Collect flows, DNS, HTTP, TLS, and packet metadata', 'Baseline normal traffic', 'Detect suspicious patterns', 'Investigate affected hosts and destinations', 'Block or contain malicious traffic'],
    tools: ['Zeek', 'Suricata', 'Snort', 'Security Onion', 'Darktrace', 'ExtraHop'],
    analystFocus: ['Understand network protocols', 'Read DNS and HTTP logs', 'Identify beaconing and scanning', 'Correlate network and endpoint evidence'],
    outputs: ['Network alert', 'Traffic timeline', 'C2 indicators', 'Firewall block recommendation'],
  },
  'malware-analysis': {
    title: 'Malware Analysis',
    subtitle: 'Static, dynamic, and reverse engineering fundamentals',
    metrics: ['Static', 'Dynamic', 'Behavior', 'IOCs'],
    overview: 'Malware analysis identifies what a suspicious file does, how it persists, what it communicates with, and how the SOC can detect or contain it.',
    workflow: ['Collect file safely', 'Perform static analysis', 'Run dynamic sandbox analysis', 'Extract IOCs and behaviors', 'Create detections and containment guidance'],
    tools: ['Any.run', 'Cuckoo Sandbox', 'Ghidra', 'IDA Free', 'strings', 'PEStudio', 'YARA'],
    analystFocus: ['Work in isolated labs', 'Understand file types and packing', 'Extract useful indicators', 'Translate behavior into detections'],
    outputs: ['Malware report', 'YARA rule', 'IOC package', 'Containment guidance'],
  },
  'email-security': {
    title: 'Email Security',
    subtitle: 'Phishing, headers, authentication, and user protection',
    metrics: ['SPF', 'DKIM', 'DMARC', 'Phishing'],
    overview: 'Email security protects one of the most common initial access paths. SOC analysts investigate phishing, spoofing, malicious links, attachments, and account compromise.',
    workflow: ['Review reported email and headers', 'Check SPF, DKIM, and DMARC', 'Analyze URLs and attachments safely', 'Search for other recipients', 'Block sender, URL, or attachment hash'],
    tools: ['Microsoft Defender for O365', 'Proofpoint', 'Mimecast', 'URLScan', 'VirusTotal', 'MXToolbox'],
    analystFocus: ['Read full email headers', 'Recognize spoofing and impersonation', 'Analyze links safely', 'Coordinate user notification'],
    outputs: ['Phishing verdict', 'Blocked indicators', 'User advisory', 'Mailbox sweep results'],
  },
  'vulnerability-mgmt': {
    title: 'Vulnerability Management',
    subtitle: 'Exposure, patching, prioritization, and risk reduction',
    metrics: ['CVE', 'CVSS', 'Exposure', 'Remediation'],
    overview: 'Vulnerability management finds weaknesses before attackers use them. SOC teams use vulnerability context to prioritize alerts and reduce attack surface.',
    workflow: ['Scan assets regularly', 'Prioritize by exposure and exploitability', 'Assign remediation owners', 'Validate patches or mitigations', 'Track risk trends'],
    tools: ['Tenable Nessus', 'Qualys', 'Rapid7 InsightVM', 'OpenVAS', 'CISA KEV', 'EPSS'],
    analystFocus: ['Understand CVEs and CVSS limits', 'Prioritize internet-facing risk', 'Link vulnerabilities to active threats', 'Validate fixes'],
    outputs: ['Risk-prioritized findings', 'Patch tickets', 'Exception register', 'Remediation reports'],
  },
  'cloud-security': {
    title: 'Cloud Security',
    subtitle: 'Cloud logs, posture, identity, and workload protection',
    metrics: ['IAM', 'CloudTrail', 'Posture', 'Workloads'],
    overview: 'Cloud security monitors cloud identities, workloads, storage, and configuration. It helps detect account abuse, exposed resources, and misconfigurations.',
    workflow: ['Collect cloud audit and activity logs', 'Monitor identity and privilege changes', 'Detect exposed storage or risky configurations', 'Investigate suspicious API activity', 'Remediate posture gaps'],
    tools: ['AWS CloudTrail', 'Azure Defender', 'Microsoft Sentinel', 'Prisma Cloud', 'Wiz', 'Prowler'],
    analystFocus: ['Know cloud IAM basics', 'Understand API activity logs', 'Recognize public exposure', 'Coordinate with cloud engineers'],
    outputs: ['Cloud alert', 'Posture finding', 'Identity investigation', 'Remediation ticket'],
  },
  iam: {
    title: 'IAM',
    subtitle: 'Identity, access, privilege, and account abuse',
    metrics: ['MFA', 'Privilege', 'Access', 'Abuse'],
    overview: 'IAM is central to modern security because attackers often target accounts. SOC analysts monitor identity activity for suspicious logins, privilege changes, and abuse.',
    workflow: ['Monitor authentication and MFA events', 'Detect impossible travel or risky sign-ins', 'Review privilege changes', 'Disable or reset compromised accounts', 'Improve least-privilege controls'],
    tools: ['Microsoft Entra ID', 'Okta', 'CyberArk', 'BeyondTrust', 'Duo', 'SailPoint'],
    analystFocus: ['Understand MFA and conditional access', 'Know normal user behavior', 'Investigate account takeover', 'Use privilege carefully'],
    outputs: ['Identity alert', 'Account containment', 'Access review', 'Privilege risk report'],
  },
  'case-management': {
    title: 'Case Management',
    subtitle: 'Tickets, evidence, analyst workflow, and reporting',
    metrics: ['Tickets', 'Evidence', 'SLA', 'Reporting'],
    overview: 'Case management keeps SOC work organized. It preserves investigation notes, evidence, ownership, actions taken, and final outcomes.',
    workflow: ['Create case from alert or report', 'Assign owner and severity', 'Collect evidence and notes', 'Track response actions', 'Close with outcome and lessons learned'],
    tools: ['TheHive', 'ServiceNow', 'Jira', 'Cortex', 'Confluence', 'PagerDuty'],
    analystFocus: ['Write clear notes', 'Track every action', 'Preserve evidence links', 'Close cases with useful summaries'],
    outputs: ['Investigation case', 'Evidence trail', 'SLA metrics', 'Final incident report'],
  },
};

export default function SocDomain() {
  const navigate = useNavigate();
  const { domain = '' } = useParams();
  const data = DOMAINS[domain] ?? DOMAINS.siem;

  return (
    <div className="soc-blueprint">
      <div className="scanline" />
      <button className="back-btn" onClick={() => navigate('/nebula/blue-team')}>Back to Blue Team Galaxy</button>
      <div className="soc-container">
        <header>
          <div className="header-tag">// blue team planet</div>
          <h1>{data.title} <span>Blueprint</span></h1>
          <div className="subtitle">[ {data.subtitle.toUpperCase()} ]</div>
        </header>

        <div className="metric-row">
          {data.metrics.map((metric) => (
            <div className="metric" key={metric}>
              <span className="metric-val">{metric}</span>
              <div className="metric-label">Core Focus</div>
            </div>
          ))}
        </div>

        <div className="section-title" style={{ color: 'var(--accent)' }}>Overview</div>
        <div className="card blue" style={{ marginBottom: 30 }}>
          <p>{data.overview}</p>
        </div>

        <div className="section-title" style={{ color: 'var(--accent3)' }}>Workflow</div>
        <div className="phases" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {data.workflow.map((step, index) => (
            <div className="phase" key={step}>
              <div className="phase-num">{index + 1}</div>
              <h4>{step}</h4>
              <div className="phase-time">// step {index + 1}</div>
            </div>
          ))}
        </div>

        <div className="grid-3" style={{ marginTop: 30 }}>
          <div className="card orange">
            <div className="card-header"><div className="card-title">Tools</div><span className="badge badge-orange">Stack</span></div>
            <div className="tag-list">{data.tools.map((tool) => <span className="tag orange" key={tool}>{tool}</span>)}</div>
          </div>
          <div className="card green">
            <div className="card-header"><div className="card-title">Analyst Focus</div><span className="badge badge-green">Skills</span></div>
            <ul className="resp-list">{data.analystFocus.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="card blue">
            <div className="card-header"><div className="card-title">Outputs</div><span className="badge badge-blue">Deliverables</span></div>
            <ul className="resp-list">{data.outputs.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
      </div>
    </div>
  );
}
