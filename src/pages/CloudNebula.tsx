import LearningUniverse, { type LearningNode } from './LearningUniverse';

const CLOUD_NODES: LearningNode[] = [
  { name: 'Local Cloud Lab', tagline: 'Floci · no account · no credit card', route: '/cloud/local-cloud-lab', color: '#c084fc', radius: 3.2, speed: 0.26, tilt: 0.35, size: 0.64, angle: 0.25, rings: true },
  { name: 'AWS', tagline: 'S3 · Lambda · IAM · CloudTrail', route: '/cloud/aws', color: '#f59e0b', radius: 5, speed: 0.19, tilt: 0.55, size: 0.52, angle: 2.1 },
  { name: 'Microsoft Azure', tagline: 'Blob · Functions · Entra · Activity Logs', route: '/cloud/azure', color: '#38bdf8', radius: 6.7, speed: 0.145, tilt: 0.82, size: 0.52, angle: 4.8, rings: true },
  { name: 'Google Cloud', tagline: 'GCS · Pub/Sub · IAM · Audit Logs', route: '/cloud/gcp', color: '#34d399', radius: 8.4, speed: 0.112, tilt: 0.62, size: 0.5, angle: 1.25 },
  { name: 'Cloud IAM', tagline: 'Identity · roles · least privilege', route: '/cloud/iam', color: '#818cf8', radius: 10.1, speed: 0.09, tilt: 1.05, size: 0.47, angle: 3.4 },
  { name: 'Detection & Logging', tagline: 'Audit trails · posture · alerting', route: '/cloud/cloud-detection', color: '#22d3ee', radius: 11.8, speed: 0.073, tilt: 0.48, size: 0.46, angle: 5.65, rings: true },
  { name: 'Containers & K8s', tagline: 'Images · workloads · runtime security', route: '/cloud/containers', color: '#60a5fa', radius: 13.5, speed: 0.06, tilt: 1.18, size: 0.48, angle: 2.6 },
  { name: 'Infrastructure as Code', tagline: 'Terraform · policy · safe dry runs', route: '/cloud/infrastructure-as-code', color: '#a78bfa', radius: 15.1, speed: 0.05, tilt: 0.72, size: 0.45, angle: 0.7 },
  { name: 'Cloud Incident Response', tagline: 'Contain · investigate · recover', route: '/cloud/incident-response', color: '#f472b6', radius: 16.7, speed: 0.043, tilt: 0.9, size: 0.47, angle: 5.35 },
];

export default function CloudNebula() {
  return (
    <LearningUniverse
      title="CLOUD SECURITY NEBULA"
      subtitle="AWS · Azure · GCP · Local labs · Detection engineering"
      coreLabel="FLOCI LOCAL LAB CORE"
      nodes={CLOUD_NODES}
      palette={['#8b5cf6', '#67e8f9', '#2563eb']}
      variant="cloud"
    />
  );
}
