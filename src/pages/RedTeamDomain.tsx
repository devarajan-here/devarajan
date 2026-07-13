import { useNavigate, useParams } from 'react-router';
import './SocBlueprint.css';

type RedDomain = {
  title: string;
  subtitle: string;
  metrics: string[];
  overview: string;
  methodology: string[];
  tools: string[];
  operatorFocus: string[];
  deliverables: string[];
};

const RED_DOMAINS: Record<string, RedDomain> = {
  'engagement-planning': {
    title: 'Engagement Planning',
    subtitle: 'Scope, rules of engagement, safety, and evidence handling',
    metrics: ['Scope', 'Authorization', 'Safety', 'Evidence'],
    overview: 'A professional red-team engagement begins with written authorization, clearly defined targets, success criteria, communication channels, and stop conditions. Good planning protects the organization while allowing realistic testing.',
    methodology: ['Confirm written authorization and objectives', 'Define in-scope and excluded systems', 'Agree communication and emergency stop procedures', 'Prepare evidence handling and activity logging', 'Conduct a kickoff and validate readiness'],
    tools: ['Rules of Engagement', 'Scope Matrix', 'Risk Register', 'Secure Notes', 'Evidence Repository'],
    operatorFocus: ['Respect scope at all times', 'Use the least disruptive validation', 'Maintain precise activity logs', 'Escalate unexpected impact immediately'],
    deliverables: ['Signed authorization', 'Engagement plan', 'Communication matrix', 'Testing timeline'],
  },
  reconnaissance: {
    title: 'Reconnaissance',
    subtitle: 'Authorized asset discovery and attack-surface mapping',
    metrics: ['Assets', 'Exposure', 'Identity', 'Priority'],
    overview: 'Reconnaissance builds an accurate view of the approved attack surface. It identifies public assets, technologies, identity exposure, and likely trust relationships without exceeding the agreed scope.',
    methodology: ['Review supplied asset inventory', 'Map approved public infrastructure', 'Identify technologies and exposed services', 'Correlate findings with organizational context', 'Prioritize paths for controlled validation'],
    tools: ['Amass', 'Shodan', 'Nmap', 'WHOIS', 'DNS tooling', 'Burp Suite'],
    operatorFocus: ['Distinguish owned assets from third parties', 'Validate discoveries before testing', 'Minimize noisy collection', 'Document source and confidence'],
    deliverables: ['Attack-surface map', 'Asset inventory gaps', 'Exposure summary', 'Prioritized test plan'],
  },
  'web-applications': {
    title: 'Web Application Testing',
    subtitle: 'Application logic, identity, session, and data protection',
    metrics: ['OWASP', 'Identity', 'Business Logic', 'Data'],
    overview: 'Authorized web application testing evaluates whether application controls prevent realistic abuse. The focus includes identity, authorization, session handling, input validation, business logic, and sensitive-data protection.',
    methodology: ['Map approved application functionality', 'Review authentication and session controls', 'Test authorization boundaries safely', 'Validate input and business-logic controls', 'Retest confirmed remediation'],
    tools: ['Burp Suite', 'OWASP ZAP', 'Postman', 'Browser DevTools', 'Nuclei'],
    operatorFocus: ['Protect production data', 'Avoid destructive payloads', 'Prove impact with minimum evidence', 'Separate scanner output from verified findings'],
    deliverables: ['Verified findings', 'Evidence captures', 'Risk ratings', 'Remediation guidance'],
  },
  'network-testing': {
    title: 'Network Penetration Testing',
    subtitle: 'Services, segmentation, trust, and exposure validation',
    metrics: ['Services', 'Segmentation', 'Trust', 'Control'],
    overview: 'Network testing evaluates exposed services, security boundaries, management interfaces, and segmentation. The goal is to identify practical paths that could allow unauthorized access or movement.',
    methodology: ['Discover approved hosts and services', 'Validate service configuration and exposure', 'Review segmentation and trust boundaries', 'Demonstrate impact using safe techniques', 'Document control improvements and retest'],
    tools: ['Nmap', 'Wireshark', 'Nessus', 'Metasploit', 'NetExec'],
    operatorFocus: ['Control scan intensity', 'Protect fragile systems', 'Avoid persistence unless approved', 'Record every validation action'],
    deliverables: ['Service inventory', 'Segmentation findings', 'Validated attack paths', 'Hardening recommendations'],
  },
  'active-directory': {
    title: 'Active Directory Security',
    subtitle: 'Identity paths, privilege boundaries, and configuration risk',
    metrics: ['Identity', 'Privilege', 'Trust', 'Control Paths'],
    overview: 'Active Directory assessments examine how identity configuration, delegated permissions, service accounts, and trust relationships could combine into unintended privilege paths.',
    methodology: ['Review approved identity architecture', 'Map users, groups, computers, and trusts', 'Identify risky delegation and privilege paths', 'Validate selected paths with minimal impact', 'Recommend tiering and hardening controls'],
    tools: ['BloodHound', 'PingCastle', 'Purple Knight', 'PowerShell', 'NetExec'],
    operatorFocus: ['Protect credentials and directory availability', 'Avoid disruptive account changes', 'Understand path prerequisites', 'Remove temporary artifacts'],
    deliverables: ['Privilege-path map', 'Identity findings', 'Control recommendations', 'Remediation priorities'],
  },
  'cloud-testing': {
    title: 'Cloud Security Testing',
    subtitle: 'IAM, workloads, storage, and control-plane validation',
    metrics: ['IAM', 'Workloads', 'Storage', 'Control Plane'],
    overview: 'Cloud testing validates identity permissions, exposed services, storage controls, workload boundaries, and monitoring across approved cloud accounts and subscriptions.',
    methodology: ['Confirm approved tenants and accounts', 'Map identities, roles, and trust policies', 'Review public exposure and storage controls', 'Validate selected privilege paths safely', 'Confirm logging and recommend remediation'],
    tools: ['Prowler', 'ScoutSuite', 'Pacu', 'AzureHound', 'Cloud provider CLIs'],
    operatorFocus: ['Use dedicated test identities', 'Respect provider terms and quotas', 'Avoid changing shared resources', 'Capture cloud audit evidence'],
    deliverables: ['Cloud attack-path map', 'IAM findings', 'Exposure report', 'Remediation backlog'],
  },
  'social-engineering': {
    title: 'Social Engineering Assessment',
    subtitle: 'People, process, awareness, and reporting controls',
    metrics: ['Awareness', 'Process', 'Reporting', 'Resilience'],
    overview: 'Social engineering assessments measure whether approved users and business processes resist realistic influence attempts. They require strict privacy, safety, and communication controls.',
    methodology: ['Define approved scenarios and audiences', 'Create safe and clearly bounded simulations', 'Run the campaign with monitoring and stop controls', 'Measure reporting and process outcomes', 'Debrief stakeholders and improve training'],
    tools: ['GoPhish', 'Approved mail infrastructure', 'Awareness platform', 'Campaign dashboard'],
    operatorFocus: ['Protect participant privacy', 'Never request real passwords', 'Avoid fear or harmful pretexts', 'Coordinate rapid campaign shutdown'],
    deliverables: ['Campaign metrics', 'Process observations', 'Awareness recommendations', 'Executive summary'],
  },
  'post-exploitation': {
    title: 'Post-Exploitation Validation',
    subtitle: 'Business impact, detection coverage, and secure cleanup',
    metrics: ['Impact', 'Detection', 'Containment', 'Cleanup'],
    overview: 'Post-exploitation validation demonstrates the business significance of an approved attack path without causing unnecessary risk. It also measures whether defensive teams can observe and contain the activity.',
    methodology: ['Confirm the approved validation objective', 'Use controlled access and test data', 'Measure visibility across defensive controls', 'Demonstrate limited business impact', 'Remove artifacts and verify cleanup'],
    tools: ['C2 lab platform', 'EDR telemetry', 'SIEM', 'Secure evidence storage'],
    operatorFocus: ['Use test data wherever possible', 'Limit access duration and privileges', 'Maintain continuous communications', 'Verify complete cleanup'],
    deliverables: ['Impact narrative', 'Detection observations', 'Attack timeline', 'Cleanup confirmation'],
  },
  reporting: {
    title: 'Red Team Reporting',
    subtitle: 'Evidence, business risk, remediation, and retesting',
    metrics: ['Evidence', 'Risk', 'Remediation', 'Retest'],
    overview: 'Reporting turns technical activity into decisions. A useful report explains the complete attack path, business impact, observed defensive controls, root causes, and prioritized remediation.',
    methodology: ['Normalize the engagement activity log', 'Build the attack-path narrative', 'Map root causes and defensive observations', 'Prioritize practical remediation', 'Present findings and perform retesting'],
    tools: ['Attack-flow diagrams', 'MITRE ATT&CK', 'CVSS context', 'Evidence repository', 'Ticketing platform'],
    operatorFocus: ['Write for technical and executive readers', 'Separate facts from assumptions', 'Protect sensitive evidence', 'Make every recommendation actionable'],
    deliverables: ['Executive report', 'Technical report', 'Attack-flow diagram', 'Remediation roadmap'],
  },
};

export default function RedTeamDomain() {
  const navigate = useNavigate();
  const { domain = '' } = useParams();
  const data = RED_DOMAINS[domain] ?? RED_DOMAINS['engagement-planning'];

  return (
    <div className="soc-blueprint red-blueprint">
      <div className="scanline" />
      <button className="back-btn" onClick={() => navigate('/nebula/red-team')}>← Red Team Galaxy</button>
      <div className="soc-container">
        <header>
          <div className="header-tag">// authorized adversary simulation</div>
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
        <div className="card red" style={{ marginBottom: 30 }}><p>{data.overview}</p></div>

        <div className="section-title" style={{ color: 'var(--accent3)' }}>Authorized Methodology</div>
        <div className="phases" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {data.methodology.map((step, index) => (
            <div className="phase" key={step}>
              <div className="phase-num">{index + 1}</div>
              <h4>{step}</h4>
              <div className="phase-time">// phase {index + 1}</div>
            </div>
          ))}
        </div>

        <div className="grid-3" style={{ marginTop: 30 }}>
          <div className="card orange">
            <div className="card-header"><div className="card-title">Tools</div><span className="badge badge-orange">Stack</span></div>
            <div className="tag-list">{data.tools.map((tool) => <span className="tag orange" key={tool}>{tool}</span>)}</div>
          </div>
          <div className="card red">
            <div className="card-header"><div className="card-title">Operator Focus</div><span className="badge badge-red">Discipline</span></div>
            <ul className="resp-list">{data.operatorFocus.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="card yellow">
            <div className="card-header"><div className="card-title">Deliverables</div><span className="badge badge-yellow">Outputs</span></div>
            <ul className="resp-list">{data.deliverables.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>

        <div className="red-safety-note">
          <strong>Authorization boundary:</strong> Perform security testing only with explicit written permission, agreed scope, and documented safety controls.
        </div>
      </div>
    </div>
  );
}
