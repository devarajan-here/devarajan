import { useLocation, useNavigate, useParams } from 'react-router';
import './SocBlueprint.css';

type UniverseDomainData = {
  title: string;
  subtitle: string;
  metrics: string[];
  overview: string;
  path: string[];
  tools: string[];
  practice: string[];
  outputs: string[];
  commands?: string[];
};

const CLOUD_DOMAINS: Record<string, UniverseDomainData> = {
  'local-cloud-lab': {
    title: 'Floci Local Cloud Lab',
    subtitle: 'Practice AWS, Azure, and GCP locally without an account or credit card',
    metrics: ['Local', 'Credential-free', 'Repeatable', '$0 labs'],
    overview: 'Floci provides local emulators for AWS, Azure, and Google Cloud. Use it to learn service APIs, infrastructure as code, logging, and security controls without connecting to a real tenant or putting real credentials on your laptop.',
    path: ['Install Docker and the Floci CLI', 'Start one local cloud emulator', 'Create a storage resource with the matching CLI', 'Inspect the resource in Floci UI', 'Destroy and repeat the lab from code'],
    tools: ['Floci CLI', 'Floci UI', 'Docker', 'AWS CLI', 'Azure CLI', 'gcloud CLI', 'Terraform / OpenTofu'],
    practice: ['Build an S3-style evidence bucket locally', 'Publish and consume a queue message', 'Create a least-privilege test policy', 'Apply a small Terraform module against localhost'],
    outputs: ['Lab notes', 'CLI command history', 'Infrastructure code', 'Security checklist'],
    commands: ['# Windows PowerShell', 'irm https://floci.io/install.ps1 | iex', 'floci start; floci env | Invoke-Expression', 'floci doctor'],
  },
  aws: {
    title: 'AWS Security Learning',
    subtitle: 'Storage, serverless, identity, audit logs, and detection',
    metrics: ['S3', 'Lambda', 'IAM', 'CloudTrail'],
    overview: 'Learn AWS by following the life of one request: authenticate with IAM, call a service API, capture the event in CloudTrail-style telemetry, and evaluate whether the action should be allowed or alerted on.',
    path: ['Learn regions, accounts, ARNs, and API calls', 'Create S3 and DynamoDB resources locally', 'Add Lambda and event-driven processing', 'Model IAM allow and deny decisions', 'Investigate activity through audit telemetry'],
    tools: ['Floci AWS emulator', 'AWS CLI', 'boto3', 'Terraform', 'Prowler', 'CloudTrail concepts'],
    practice: ['Create and version an S3-style bucket', 'Trigger a Lambda-style function from a queue', 'Compare broad and least-privilege IAM policies', 'Write a detection for suspicious API activity'],
    outputs: ['AWS architecture sketch', 'IAM policy', 'Terraform module', 'Detection query'],
    commands: ['floci start; floci env | Invoke-Expression', 'aws s3 mb s3://security-lab', '"hello cloud" | Out-File hello.txt', 'aws s3 cp hello.txt s3://security-lab/'],
  },
  azure: {
    title: 'Azure Security Learning',
    subtitle: 'Storage, Functions, identity, activity logs, and Microsoft security controls',
    metrics: ['Blob', 'Functions', 'Entra ID', 'Activity Logs'],
    overview: 'Build Azure fundamentals around subscriptions, resource groups, Entra identity, role assignments, and control-plane activity. Start with local storage and messaging, then transfer the mental model to an authorized Azure sandbox.',
    path: ['Understand tenants, subscriptions, and resource groups', 'Practice Blob, Queue, and Table operations locally', 'Build an event-driven Function workflow', 'Map RBAC roles to least privilege', 'Design activity-log and identity detections'],
    tools: ['Floci Azure emulator', 'Azure CLI', 'Azurite-compatible SDKs', 'Bicep', 'Terraform', 'Microsoft Sentinel concepts'],
    practice: ['Create a Blob container and upload evidence', 'Send and consume a Queue message', 'Review risky role-assignment scenarios', 'Draft a Sentinel-style detection use case'],
    outputs: ['Azure resource map', 'RBAC matrix', 'IaC template', 'Detection playbook'],
    commands: ['docker run --rm -p 4577:4577 floci/floci-az:latest', '# Configure the local endpoint using the Floci Azure guide', 'az storage container create -n security-lab'],
  },
  gcp: {
    title: 'Google Cloud Security Learning',
    subtitle: 'Storage, Pub/Sub, IAM, audit logs, and workload protection',
    metrics: ['GCS', 'Pub/Sub', 'IAM', 'Audit Logs'],
    overview: 'Learn GCP through projects, service accounts, IAM bindings, resource hierarchy, and audit events. Local emulation gives you a safe place to practice storage and messaging before using a controlled cloud sandbox.',
    path: ['Learn organizations, folders, projects, and resources', 'Create Cloud Storage resources locally', 'Build a Pub/Sub message flow', 'Model service-account and IAM bindings', 'Design detections from Cloud Audit Logs'],
    tools: ['Floci GCP emulator', 'gcloud CLI', 'Google Cloud SDKs', 'Terraform', 'Security Command Center concepts'],
    practice: ['Create and populate a GCS-style bucket', 'Publish and consume a Pub/Sub message', 'Review service-account privilege paths', 'Write an audit-log investigation checklist'],
    outputs: ['GCP hierarchy diagram', 'IAM review', 'Terraform module', 'Investigation notes'],
    commands: ['docker run --rm -p 4588:4588 floci/floci-gcp:latest', '$env:CLOUDSDK_API_ENDPOINT_OVERRIDES_STORAGE="http://localhost:4588/"', '$env:CLOUDSDK_CORE_PROJECT="floci-local"', 'gcloud storage buckets create gs://security-lab'],
  },
  iam: {
    title: 'Cloud Identity & IAM',
    subtitle: 'Principals, roles, policies, trust, and least privilege',
    metrics: ['Principals', 'Permissions', 'Trust', 'Review'],
    overview: 'Cloud IAM is the control plane for human users, workloads, automation, and cross-account trust. Learn to reason about effective permission, escalation paths, temporary credentials, and strong authentication across all providers.',
    path: ['Identify every human and workload principal', 'Read policy syntax and inheritance', 'Trace trust and role-assumption paths', 'Reduce standing privilege', 'Monitor identity changes and risky access'],
    tools: ['IAM Access Analyzer concepts', 'Entra ID concepts', 'GCP Policy Analyzer concepts', 'Prowler', 'Cloudsplaining'],
    practice: ['Translate one role across AWS, Azure, and GCP', 'Find wildcard permissions in sample policies', 'Build a break-glass access checklist', 'Design an identity-change alert'],
    outputs: ['Principal inventory', 'Privilege-path map', 'Least-privilege policy', 'Identity detection'],
  },
  'cloud-detection': {
    title: 'Cloud Detection & Logging',
    subtitle: 'Audit events, posture signals, alert logic, and investigation context',
    metrics: ['Telemetry', 'Posture', 'Detection', 'Triage'],
    overview: 'Cloud detection engineering connects control-plane audit events, identity signals, network telemetry, and workload logs. The goal is to detect meaningful behavior while retaining enough context to investigate quickly.',
    path: ['Inventory provider and workload log sources', 'Normalize identity and API fields', 'Map suspicious behaviors to ATT&CK', 'Write and test detection logic', 'Create triage context and response actions'],
    tools: ['CloudTrail', 'Azure Activity Logs', 'GCP Audit Logs', 'Sigma', 'OpenSearch', 'Microsoft Sentinel'],
    practice: ['Detect a public-storage configuration change', 'Alert on a new privileged role assignment', 'Trace one API request across services', 'Build a cloud alert triage card'],
    outputs: ['Log-source matrix', 'Detection rule', 'Test event set', 'Triage runbook'],
  },
  containers: {
    title: 'Containers & Kubernetes Security',
    subtitle: 'Images, identities, admission, network policy, and runtime behavior',
    metrics: ['Images', 'Cluster', 'Runtime', 'Supply Chain'],
    overview: 'Container security spans the build pipeline, image registry, Kubernetes control plane, workload identity, network boundaries, secrets, and runtime behavior. Treat the full lifecycle as one connected system.',
    path: ['Build and scan a minimal container image', 'Understand pods, namespaces, and service accounts', 'Apply resource and network boundaries', 'Review admission and secret handling', 'Detect suspicious runtime behavior'],
    tools: ['Docker', 'Kubernetes', 'kind / minikube', 'Trivy', 'Kubescape', 'Falco'],
    practice: ['Scan a deliberately vulnerable image', 'Remove root and excessive Linux capabilities', 'Write a namespace network policy', 'Investigate a runtime alert'],
    outputs: ['Hardened Dockerfile', 'Kubernetes manifests', 'Scan report', 'Runtime rule'],
  },
  'infrastructure-as-code': {
    title: 'Infrastructure as Code Security',
    subtitle: 'Repeatable environments, policy checks, and local dry runs',
    metrics: ['Plan', 'Policy', 'Test', 'Drift'],
    overview: 'Infrastructure as code makes cloud security reviewable and repeatable. Validate syntax, permissions, network exposure, encryption, and logging before deployment, then compare the desired configuration with reality.',
    path: ['Describe a small architecture in Terraform or OpenTofu', 'Run format, validate, and plan checks', 'Scan configuration for policy violations', 'Apply against a local emulator', 'Test and destroy the environment cleanly'],
    tools: ['Terraform', 'OpenTofu', 'Checkov', 'tfsec', 'OPA / Conftest', 'Floci'],
    practice: ['Create a storage-and-queue module', 'Block public access through policy', 'Run an IaC scanner in CI', 'Rebuild the lab from a clean state'],
    outputs: ['IaC module', 'Policy tests', 'CI check', 'Drift checklist'],
  },
  'malware-analytics': {
    title: 'Cloud Malware Analytics',
    subtitle: 'Safe sample intake, isolated analysis, telemetry, and intelligence output',
    metrics: ['Isolation', 'Triage', 'Behavior', 'Evidence'],
    overview: 'A cloud-oriented malware analysis pipeline receives samples safely, stores them with strict access control, performs static and dynamic triage in isolated workers, and turns observations into detections and threat intelligence. Use harmless test files until you have a purpose-built isolated lab.',
    path: ['Design a quarantined sample intake workflow', 'Hash and inventory every artifact', 'Run static triage on harmless samples', 'Collect process, file, DNS, and network behavior', 'Create YARA, Sigma, and intelligence outputs'],
    tools: ['REMnux', 'FLARE-VM', 'Ghidra', 'YARA', 'CAPEv2', 'VirusTotal for permitted hashes', 'Object storage concepts'],
    practice: ['Use the EICAR test file instead of live malware', 'Build a local upload-to-queue workflow', 'Extract metadata and hashes in an isolated worker', 'Create a detection from observed behavior'],
    outputs: ['Sample manifest', 'Behavior timeline', 'YARA rule', 'IOC package', 'Analyst report'],
  },
  'incident-response': {
    title: 'Cloud Incident Response',
    subtitle: 'Prepare, investigate, contain, recover, and improve',
    metrics: ['Prepare', 'Scope', 'Contain', 'Recover'],
    overview: 'Cloud incident response depends on fast access to audit logs, identity history, resource snapshots, and automation. Practice decisions in a local lab, while recognizing that real provider containment requires approved accounts and provider-native controls.',
    path: ['Prepare logging, contacts, and evidence access', 'Validate the alert and affected identities', 'Scope resources and API activity', 'Contain credentials and workloads safely', 'Recover, review root cause, and improve controls'],
    tools: ['Provider audit logs', 'SIEM', 'Timesketch', 'Velociraptor concepts', 'Terraform', 'Incident ticketing'],
    practice: ['Investigate a simulated public bucket change', 'Build a credential-compromise timeline', 'Draft reversible containment actions', 'Run a lessons-learned review'],
    outputs: ['Incident timeline', 'Scope matrix', 'Containment plan', 'Lessons-learned report'],
  },
};

const INTEL_DOMAINS: Record<string, UniverseDomainData> = {
  lifecycle: {
    title: 'Intelligence Lifecycle', subtitle: 'Requirements, collection, processing, analysis, dissemination, and feedback', metrics: ['PIRs', 'Sources', 'Analysis', 'Action'],
    overview: 'Threat intelligence begins with a decision that needs support. The lifecycle keeps collection focused, analysis transparent, and reporting tied to stakeholder action instead of producing disconnected feeds.',
    path: ['Define priority intelligence requirements', 'Create a collection plan', 'Normalize and validate collected data', 'Analyze with explicit confidence', 'Disseminate and gather feedback'],
    tools: ['MISP', 'OpenCTI', 'MITRE ATT&CK', 'STIX / TAXII', 'Analyst notebook'], practice: ['Write three PIRs for a sample company', 'Create a source reliability rubric', 'Turn raw observations into an assessment', 'Review whether the report answered the PIR'], outputs: ['PIR set', 'Collection plan', 'Source matrix', 'Intelligence assessment'],
  },
  'ioc-analysis': {
    title: 'IOC Analysis', subtitle: 'Validate, enrich, relate, and operationalize observable artifacts', metrics: ['Hashes', 'Domains', 'IPs', 'Context'],
    overview: 'Indicators are clues, not verdicts. Analyze their source, age, prevalence, relationships, and operational context before using them for blocking, detection, hunting, or attribution.',
    path: ['Normalize the observable', 'Check source and timestamp', 'Enrich with passive and reputation data', 'Pivot to related infrastructure or behavior', 'Assign confidence and an expiration plan'],
    tools: ['VirusTotal', 'AlienVault OTX', 'URLhaus', 'AbuseIPDB', 'MISP'], practice: ['Enrich a known benign hash', 'Compare domain age and passive DNS', 'Document false-positive risks', 'Build a time-bounded watchlist'], outputs: ['Enrichment record', 'Confidence score', 'Relationship graph', 'Detection recommendation'],
  },
  'mitre-attack': {
    title: 'MITRE ATT&CK Analysis', subtitle: 'Translate observed behavior into techniques and defensive coverage', metrics: ['Tactics', 'Techniques', 'Evidence', 'Coverage'],
    overview: 'ATT&CK provides a shared language for adversary behavior. Map only what the evidence supports, retain the underlying observation, and use the mapping to improve detection and investigation coverage.',
    path: ['Describe the behavior in plain language', 'Identify the tactic and candidate technique', 'Validate procedure examples and data sources', 'Record confidence and alternatives', 'Connect the mapping to detections and gaps'],
    tools: ['MITRE ATT&CK', 'ATT&CK Navigator', 'Sigma', 'DeTT&CT'], practice: ['Map a public incident report', 'Build a Navigator layer', 'Identify required telemetry', 'Propose one coverage improvement'], outputs: ['Technique mapping', 'Navigator layer', 'Coverage gap', 'Detection idea'],
  },
  'osint-collection': {
    title: 'OSINT Collection', subtitle: 'Ethical collection, validation, provenance, and source protection', metrics: ['Scope', 'Provenance', 'Reliability', 'Safety'],
    overview: 'Open-source intelligence combines public information with disciplined sourcing. Collect only what is lawful and necessary, preserve provenance, separate fact from inference, and protect sensitive research notes.',
    path: ['Define the intelligence requirement', 'Select lawful and relevant sources', 'Capture source, time, and provenance', 'Corroborate important claims', 'Store and share findings responsibly'],
    tools: ['WHOIS / RDAP', 'Certificate Transparency', 'urlscan.io', 'Shodan', 'Maltego'], practice: ['Build a source log for a public domain', 'Corroborate one claim with two sources', 'Track confidence separately from severity', 'Write a concise collection summary'], outputs: ['Source log', 'Entity map', 'Reliability rating', 'Collection summary'],
  },
  'actor-tracking': {
    title: 'Actor & Campaign Tracking', subtitle: 'Track behaviors, infrastructure, targeting, and change over time', metrics: ['TTPs', 'Timeline', 'Victims', 'Confidence'],
    overview: 'Actor tracking is a structured record of observed behavior and relationships. Avoid overconfident attribution: compare multiple hypotheses, note contradictions, and explain confidence clearly.',
    path: ['Create an entity and naming model', 'Build a chronological activity timeline', 'Compare recurring techniques and infrastructure', 'Assess targeting and likely objectives', 'Review alternative explanations and confidence'],
    tools: ['OpenCTI', 'MISP', 'ATT&CK Navigator', 'Graph tooling', 'Timeline tooling'], practice: ['Compare two public campaign reports', 'Normalize overlapping aliases', 'Build a confidence-scored timeline', 'Write competing attribution hypotheses'], outputs: ['Actor profile', 'Campaign timeline', 'TTP matrix', 'Confidence statement'],
  },
  'malware-intelligence': {
    title: 'Malware Intelligence', subtitle: 'Connect technical behavior to families, campaigns, and defensive action', metrics: ['Family', 'Behavior', 'Config', 'Links'],
    overview: 'Malware intelligence uses analysis results to identify capabilities, configuration, infrastructure, and relationships. The goal is actionable context for detection and response, not handling live samples without an isolated lab.',
    path: ['Start with verified hashes and metadata', 'Summarize capabilities and execution behavior', 'Extract configuration and infrastructure carefully', 'Compare code or behavior with known families', 'Publish detections and confidence-scored relationships'],
    tools: ['YARA', 'Ghidra', 'CAPEv2', 'MalwareBazaar', 'OpenCTI'], practice: ['Analyze a published sandbox report', 'Cluster samples by shared behavior', 'Write a safe YARA exercise on benign files', 'Map capabilities to ATT&CK'], outputs: ['Family profile', 'Behavior summary', 'YARA rule', 'Relationship set'],
  },
  'infrastructure-tracking': {
    title: 'Infrastructure Tracking', subtitle: 'Pivot across DNS, certificates, hosting, and time', metrics: ['DNS', 'TLS', 'Hosting', 'Timeline'],
    overview: 'Infrastructure analysis follows relationships among domains, IP addresses, certificates, autonomous systems, and hosting providers. Time matters: shared hosting and recycled addresses can make old links misleading.',
    path: ['Start from a validated seed indicator', 'Review passive DNS and certificate history', 'Compare hosting and registration patterns', 'Build time-bounded relationships', 'Score each link and identify false-positive risks'],
    tools: ['SecurityTrails', 'Certificate Transparency', 'urlscan.io', 'Shodan', 'Graph databases'], practice: ['Pivot from a public training domain', 'Build a dated relationship graph', 'Separate dedicated from shared infrastructure', 'Create monitoring candidates'], outputs: ['Infrastructure graph', 'Pivot log', 'Confidence notes', 'Watchlist'],
  },
  'detection-content': {
    title: 'Intelligence-Led Detection', subtitle: 'Convert intelligence into durable behavioral detection content', metrics: ['Sigma', 'YARA', 'Hunts', 'Testing'],
    overview: 'Useful intelligence changes defense. Convert high-confidence behaviors into rules, queries, enrichment, and hunting hypotheses. Prefer durable behavior over short-lived indicators when telemetry allows.',
    path: ['Select a behavior relevant to your environment', 'Identify required log sources and fields', 'Write vendor-neutral detection logic', 'Test against positive and negative samples', 'Deploy with triage context and review dates'],
    tools: ['Sigma', 'YARA', 'Splunk SPL', 'KQL', 'Elastic ES|QL', 'Atomic Red Team'], practice: ['Turn an ATT&CK technique into a Sigma rule', 'Create benign positive test data', 'Document false positives', 'Add intelligence context to the alert'], outputs: ['Detection rule', 'Test cases', 'Hunt query', 'Triage guidance'],
  },
  'intelligence-reporting': {
    title: 'Intelligence Reporting', subtitle: 'Communicate judgments, confidence, implications, and actions', metrics: ['Audience', 'Judgment', 'Confidence', 'Action'],
    overview: 'An intelligence report should make the key judgment clear, show why it is believed, state uncertainty honestly, and explain what the reader can do next. Technical detail belongs in supporting sections.',
    path: ['Define the audience and decision', 'Lead with the key assessment', 'Separate evidence from analytical judgment', 'State confidence and information gaps', 'Recommend proportionate defensive actions'],
    tools: ['Structured analytic techniques', 'STIX', 'MISP', 'OpenCTI', 'ATT&CK Navigator'], practice: ['Write a one-paragraph executive assessment', 'Add an analyst-confidence statement', 'Create technical appendices for IOCs and TTPs', 'Run peer review for clarity and bias'], outputs: ['Executive brief', 'Technical report', 'IOC package', 'Detection recommendations'],
  },
};

export default function UniverseDomain() {
  const navigate = useNavigate();
  const location = useLocation();
  const { domain = '' } = useParams();
  const isCloud = location.pathname.startsWith('/cloud/');
  const dataSet = isCloud ? CLOUD_DOMAINS : INTEL_DOMAINS;
  const fallback = isCloud ? 'local-cloud-lab' : 'lifecycle';
  const data = dataSet[domain] ?? dataSet[fallback];
  const themeClass = isCloud ? 'cloud-blueprint' : 'intel-blueprint';
  const homeRoute = isCloud ? '/nebula/cloud' : '/nebula/threat-intel';
  const universeName = isCloud ? 'Cloud Nebula' : 'Threat Intel Cluster';

  return (
    <div className={`soc-blueprint ${themeClass}`}>
      <div className="scanline" />
      <button className="back-btn" onClick={() => navigate(homeRoute)}>← {universeName}</button>
      <div className="soc-container">
        <header>
          <div className="header-tag">// {isCloud ? 'safe local-first cloud learning' : 'evidence-led intelligence practice'}</div>
          <h1>{data.title} <span>Blueprint</span></h1>
          <div className="subtitle">[ {data.subtitle.toUpperCase()} ]</div>
        </header>

        <div className="metric-row">
          {data.metrics.map((metric) => (
            <div className="metric" key={metric}><span className="metric-val">{metric}</span><div className="metric-label">Core Focus</div></div>
          ))}
        </div>

        {isCloud && (
          <div className="local-lab-banner">
            <div>
              <span className="lab-kicker">NO CREDIT CARD LAB</span>
              <strong>Practice locally with Floci</strong>
              <p>AWS, Azure, and GCP emulators run on your machine with throwaway credentials. No cloud account, real keys, or billing setup is required.</p>
            </div>
            <a href="https://floci.io/" target="_blank" rel="noreferrer">Open Floci guide ↗</a>
          </div>
        )}

        <div className="section-title" style={{ color: 'var(--accent)' }}>Overview</div>
        <div className="card blue" style={{ marginBottom: 30 }}><p>{data.overview}</p></div>

        <div className="section-title" style={{ color: 'var(--accent3)' }}>Learning Path</div>
        <div className="phases" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {data.path.map((step, index) => (
            <div className="phase" key={step}><div className="phase-num">{index + 1}</div><h4>{step}</h4><div className="phase-time">// stage {index + 1}</div></div>
          ))}
        </div>

        {data.commands && (
          <div className="local-command-card">
            <div className="card-header"><div className="card-title">Local Lab Starter</div><span className="badge badge-green">Safe Practice</span></div>
            <pre>{data.commands.join('\n')}</pre>
            <p>Run only on your own machine. Local emulators teach APIs and workflows, but they do not replace every provider-native feature.</p>
          </div>
        )}

        <div className="grid-3" style={{ marginTop: 30 }}>
          <div className="card orange">
            <div className="card-header"><div className="card-title">Tools & Platforms</div><span className="badge badge-orange">Stack</span></div>
            <div className="tag-list">{data.tools.map((tool) => <span className="tag orange" key={tool}>{tool}</span>)}</div>
          </div>
          <div className="card green">
            <div className="card-header"><div className="card-title">Practice Missions</div><span className="badge badge-green">Hands-on</span></div>
            <ul className="resp-list">{data.practice.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="card yellow">
            <div className="card-header"><div className="card-title">Portfolio Outputs</div><span className="badge badge-yellow">Evidence</span></div>
            <ul className="resp-list">{data.outputs.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>

        <div className="learning-note">
          <strong>{isCloud ? 'Lab boundary:' : 'Analyst discipline:'}</strong>{' '}
          {isCloud
            ? 'Use local emulators and harmless test data first. Use real cloud tenants or malware samples only in explicitly authorized, isolated environments.'
            : 'Treat indicators and attribution as confidence-scored assessments. Preserve provenance, respect privacy, and never present an inference as a confirmed fact.'}
        </div>
      </div>
    </div>
  );
}
