import LearningUniverse, { type LearningNode } from './LearningUniverse';

const INTEL_NODES: LearningNode[] = [
  { name: 'Intel Lifecycle', tagline: 'Direction · collection · analysis · action', route: '/threat-intel/lifecycle', color: '#fbbf24', radius: 3.3, speed: 0.25, tilt: 0.35, size: 0.62, angle: 0.35, rings: true },
  { name: 'IOC Analysis', tagline: 'Hashes · IPs · domains · URLs', route: '/threat-intel/ioc-analysis', color: '#fb923c', radius: 5.2, speed: 0.18, tilt: 0.6, size: 0.5, angle: 2.2 },
  { name: 'MITRE ATT&CK', tagline: 'Behaviors · techniques · coverage', route: '/threat-intel/mitre-attack', color: '#f97316', radius: 7.1, speed: 0.135, tilt: 0.88, size: 0.52, angle: 4.9, rings: true },
  { name: 'OSINT Collection', tagline: 'Sources · validation · confidence', route: '/threat-intel/osint-collection', color: '#facc15', radius: 8.9, speed: 0.105, tilt: 0.55, size: 0.46, angle: 1.25 },
  { name: 'Actor & Campaign Tracking', tagline: 'TTPs · infrastructure · timelines', route: '/threat-intel/actor-tracking', color: '#ef4444', radius: 10.8, speed: 0.082, tilt: 1.02, size: 0.5, angle: 3.55 },
  { name: 'Malware Intelligence', tagline: 'Families · behavior · relationships', route: '/threat-intel/malware-intelligence', color: '#fb7185', radius: 12.7, speed: 0.066, tilt: 0.7, size: 0.48, angle: 5.7 },
  { name: 'Infrastructure Tracking', tagline: 'DNS · certificates · hosting pivots', route: '/threat-intel/infrastructure-tracking', color: '#f59e0b', radius: 14.5, speed: 0.054, tilt: 1.2, size: 0.45, angle: 2.75, rings: true },
  { name: 'Detection Content', tagline: 'Sigma · YARA · SIEM enrichment', route: '/threat-intel/detection-content', color: '#fdba74', radius: 16.3, speed: 0.045, tilt: 0.82, size: 0.47, angle: 0.65 },
  { name: 'Intelligence Reporting', tagline: 'PIRs · confidence · decisions', route: '/threat-intel/intelligence-reporting', color: '#fca5a5', radius: 18.1, speed: 0.038, tilt: 1.32, size: 0.46, angle: 4.25 },
];

export default function ThreatIntelCluster() {
  return (
    <LearningUniverse
      title="THREAT INTELLIGENCE CLUSTER"
      subtitle="Collect · Validate · Analyze · Detect · Communicate"
      coreLabel="INTELLIGENCE FUSION CORE"
      nodes={INTEL_NODES}
      palette={['#f59e0b', '#fde68a', '#ef4444']}
      variant="intel"
    />
  );
}
