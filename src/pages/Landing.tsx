import ContactForm from '@/components/ContactForm';
import SpaceBackground from '@/components/SpaceBackground';
import Spaceship from '@/components/Spaceship';
import Photo from '@/components/Photo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  ExternalLink,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function Landing() {
  // Project modal state and data
  const [projectOpen, setProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showPhotoModel, setShowPhotoModel] = useState(false);

  useEffect(() => {
    const loadPhotoModel = () => setShowPhotoModel(true);
    const idleCallback = 'requestIdleCallback' in window
      ? window.requestIdleCallback(loadPhotoModel, { timeout: 6500 })
      : undefined;
    const timer = idleCallback
      ? undefined
      : window.setTimeout(loadPhotoModel, 6500);

    return () => {
      if (idleCallback) window.cancelIdleCallback(idleCallback);
      if (timer) window.clearTimeout(timer);
    };
  }, []);
  const projectsData: Record<
    string,
    {
      title: string;
      duration?: string;
      techStack?: string;
      description: string[];
      link?: string;
    }
  > = {
    'phishing-automation': {
      title: 'Phishing Email Analysis Automation (Lab Project)',
      duration: '2025',
      techStack: 'Tech Stack: n8n, VirusTotal, URLScan',
      description: [
        'Built a no-code automation workflow using n8n to simulate phishing email analysis in a lab environment.',
        'Enriched URLs and indicators using VirusTotal and URLScan.',
        'Implemented conditional logic to differentiate attachment vs non-attachment email flows.',
        'Configured Slack and email notifications to simulate SOC-style alert escalation.',
        'Focused on learning phishing triage workflows and SOAR-style automation concepts.',
      ],
    },
    'ad-attack-lab': {
      title: 'Active Directory Attack Simulation Lab',
      techStack: 'Tech Stack: Active Directory, Wazuh, Splunk, Kali Linux',
      description: [
        'Deployed an Active Directory lab environment to study authentication-related attack techniques.',
        'Simulated Kerberoasting and credential abuse scenarios in a controlled setup.',
        'Collected and analyzed logs using Wazuh and Splunk to understand attack behavior and detection signals.',
      ],
    },
    'malware-analyzer': {
      title: 'Malware Analyzer',
      techStack: 'Tech Stack: Python',
      description: [
        'Developed a basic tool for URL and embedded content analysis in a lab environment.',
        'Integrated reputation checks and pattern-based indicators to assist manual risk assessment.',
        'Focused on understanding malware triage and analysis fundamentals.',
      ],
      link: 'https://github.com/devarajan-here/Malware-analyzer',
    },
    'email-spoofing': {
      title: 'Email Spoofing & Security – Defensive Lab',
      techStack: 'Tech Stack: SPF, DKIM, DMARC, Email Header Analysis',
      description: [
        'Created a hands-on lab to understand spoofed emails from a defensive and SOC perspective.',
        'Demonstrated how spoofed emails are delivered when authentication (SPF, DKIM, DMARC) is weak.',
        'Analyzed email headers to map findings to defensive controls and explain spoofing incidents.',
      ],
      link: 'https://github.com/devarajan-here/Email-Spoofing-Email-Security',
    },
    'ad-org-design': {
      title: 'AD Organizational Design & Security Lab',
      techStack: 'Tech Stack: Active Directory, Windows Server, PowerShell',
      description: [
        'Designed an Active Directory OU structure with role-based access control (RBAC).',
        'Focused on enterprise identity management and security misconfiguration awareness.',
        'Validated security test cases and attacker walkthroughs from a Blue Team perspective.',
      ],
      link: 'https://github.com/devarajan-here/active-directory-organizational-design-home-lab',
    },
    'soc-simulation': {
      title: 'SOC Basic Simulation',
      techStack: 'Tech Stack: SOC Workflows, Alert Triage, Incident Investigation',
      description: [
        'Consolidated multiple SOC labs covering alert triage, threat analysis, and incident investigation.',
        'Aligned with SOC workflows to build strong fundamentals in defensive security operations.',
        'Touched on phishing, malware analysis, and threat intelligence components.',
      ],
      link: 'https://github.com/devarajan-here/SOC-basic-simulation',
    },
    'siem-labs': {
      title: 'SIEM–SOC Labs | Splunk & Wazuh',
      techStack: 'Tech Stack: Splunk, Wazuh, Zeek, Linux, Windows',
      description: [
        'Deployed Splunk Enterprise and Wazuh SIEM with Linux/Windows log onboarding.',
        'Integrated Zeek IDS for network traffic visibility (DNS, HTTP).',
        'Built detections for SSH brute-force, web exploitation, and FIM (File Integrity Monitoring).',
      ],
      link: 'https://github.com/devarajan-here/SIEM-SOC-Labs-Splunk-Wazuh-',
    },
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <SpaceBackground />
      {/* 3D Spaceship Layer */}
      <Spaceship />
      {/* 3D Photo Layer */}
      {showPhotoModel && <Photo />}

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative z-10 px-4">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 tracking-tight"
          >
            Devarajan
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <button
              type="button"
              aria-label="More About Me"
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 rounded-md bg-white text-black font-medium tracking-wide hover:bg-white/90 transition border border-black/10 shadow-sm z-20"
            >
              More About Me
            </button>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="pt-16 pb-28 md:py-20 relative z-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-2">About Me</h2>
              <div className="mt-1 space-y-1">
                <p className="text-2xl font-semibold tracking-tight">Devarajan P M</p>
                <p className="text-white/80">Security Analyst</p>
                <p className="text-white/60">Kerala, India</p>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-white/80">
                <a href="tel:+918330857529" className="inline-flex items-center gap-2 hover:text-white transition group">
                  <Phone className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" /> +91 8330857529
                </a>
                <span className="opacity-40">•</span>
                <a href="mailto:devarajanpm79@gmail.com" className="inline-flex items-center gap-2 hover:text-white transition group">
                  <Mail className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" /> devarajanpm79@gmail.com
                </a>
                <span className="opacity-40">•</span>
                <a
                  href="https://www.linkedin.com/in/devarajan-p-m/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-white transition group"
                >
                  <Linkedin className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" /> LinkedIn
                  <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </a>
                <span className="opacity-40">•</span>
                <a
                  href="https://www.github.com/devarajan-here"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-white transition group"
                >
                  <Github className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" /> GitHub
                  <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </a>
                <span className="opacity-40">•</span>
                <a
                  href="https://www.instagram.com/dev_raj_an_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-white transition group"
                >
                  <Instagram className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" /> Instagram
                  <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </a>
                <span className="opacity-40">â€¢</span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Kerala, India
                </span>
              </div>

              {/* Download Resume Button */}
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                  asChild
                >
                  <a
                    href="https://drive.google.com/file/d/19d0n3FhSLUH5F57ChQFUEb3BDP8J9_qq/view?usp=drive_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Download my resume"
                  >
                    Download My Resume
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="flex flex-wrap gap-2 bg-white/10 border border-white/10">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="soft-skills">Soft Skills</TabsTrigger>
                    <TabsTrigger value="certifications">Certifications</TabsTrigger>
                    <TabsTrigger value="languages">Languages</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="leadership">Leadership</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 space-y-6">
                    <div>
                      <h3 className="text-2xl font-semibold mb-2 text-glow-white">Objective</h3>
                      <p className="text-white/80 leading-relaxed">
                        Security Analyst and CompTIA Security+ certified professional with hands-on experience in SOC
                        tooling, Active Directory lab security, and security automation. Currently supporting training
                        environments at Cyber Lancers by deploying Proxmox-based labs, designing AD CTF challenges, and
                        implementing SIEM alert automation. Strong foundation in log analysis, phishing investigation, and
                        compliance-oriented security practices.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="skills" className="mt-6 space-y-6">
                    <div>
                      <h4 className="text-2xl font-semibold mb-3 text-glow-white">Technical Skills</h4>
                      <ul className="space-y-3 text-white/80">
                        <li>
                          <span className="font-semibold">SIEM & SOC:</span>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Splunk, QRadar, Wazuh</li>
                            <li>Log Analysis, Alert Triage, Incident Escalation</li>
                            <li>Phishing Investigation</li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-semibold">Infrastructure & Platforms:</span>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Proxmox VE, Active Directory Lab Setup</li>
                            <li>Linux (Kali/Ubuntu)</li>
                            <li>Foundational AWS security concepts (IAM, Security Groups, CloudTrail)</li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-semibold">Security Domains:</span>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Threat Intelligence, MITRE ATT&CK</li>
                            <li>Vulnerability Assessment (basic)</li>
                            <li>Email Security (SPF, DKIM, DMARC)</li>
                            <li>CTF Development</li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-semibold">Tools & Automation:</span>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Python, Bash Scripting, n8n, SQL</li>
                            <li>Wireshark, Burp Suite, Caido, Proctor AI</li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="soft-skills" className="mt-6">
                    <h3 className="text-2xl font-semibold mb-3 text-glow-white">Soft Skills</h3>
                    <ul className="list-disc list-inside space-y-1 text-white/80">
                      <li>Analytical Thinking</li>
                      <li>Problem Solving</li>
                      <li>Attention to Detail</li>
                      <li>Ticket Handling</li>
                      <li>Fast Learner</li>
                      <li>Time Management</li>
                      <li>Security Mindset</li>
                      <li>Team Collaboration</li>
                    </ul>
                  </TabsContent>

                  <TabsContent value="languages" className="mt-6">
                    <h3 className="text-2xl font-semibold mb-3 text-glow-white">Languages</h3>
                    <ul className="list-disc list-inside space-y-1 text-white/80">
                      <li>English (Fluent)</li>
                      <li>Malayalam (Native)</li>
                      <li>Hindi (Fluent)</li>
                      <li>Tamil (Conversational)</li>
                    </ul>
                  </TabsContent>

                  <TabsContent value="experience" className="mt-6">
                    <h3 className="text-2xl font-semibold mb-4 text-glow-white">Professional & Practical Experience</h3>
                    <p className="text-white/70 mb-6">
                      Chronological overview of internships and hands-on learning experiences.
                    </p>
                    <div className="space-y-8">
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-white"></div>
                        <div className="absolute left-0 top-2 bottom-[-2rem] w-px bg-white/20" />
                        <h4 className="text-xl font-semibold text-glow-white">Cybersecurity Analyst</h4>
                        <p className="text-white/60">Cyber Lancers Pvt Ltd | Mysore, India | Oct 2025 – Present</p>
                        <ul className="list-disc list-inside text-white/80 mt-2 space-y-1">
                          <li>Infrastructure Automation: Supported Proxmox-based virtual lab environments and automated provisioning of 60+ student user accounts using Bash scripting. Assisted in implementing a web-based login interface to streamline student access to lab machines.</li>
                          <li>Active Directory Security: Designed and deployed Active Directory-based CTF lab scenarios focused on privilege escalation and common misconfiguration abuse for training simulations.</li>
                          <li>Email Security: Identified an email spoofing risk in the corporate domain and collaborated with internal teams to implement SPF and DMARC controls, improving protection against phishing attacks.</li>
                          <li>Security Education & Auditing: Reviewed and patched vulnerable lab machines (PEH/VulnHub) to ensure stability for student assessments. Evaluated and deployed open-source exam proctoring solutions (Proctor AI).</li>
                        </ul>
                      </div>
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-white"></div>
                        <div className="absolute left-0 top-2 bottom-[-2rem] w-px bg-white/20" />
                        <h4 className="text-xl font-semibold text-glow-white">Cybersecurity Engineer</h4>
                        <p className="text-white/60">Finpro Technologies | India (Remote) | Jan – Oct 2025</p>
                        <ul className="list-disc list-inside text-white/80 mt-2 space-y-1">
                          <li>Supported ISO 27001 ISMS activities by maintaining asset inventories and asset tagging under guidance.</li>
                          <li>Gained practical exposure to technological and organizational security controls through internal training sessions.</li>
                          <li>Assisted in preparing ISO 27001 awareness and control-mapping presentations (PPTs) for internal review.</li>
                          <li>Studied ISO 27001 clauses, Annex A controls, and risk treatment concepts under senior supervision.</li>
                          <li>Developed a foundational understanding of GRC concepts, compliance documentation, and audit readiness processes.</li>
                        </ul>
                      </div>
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-white"></div>
                        <h4 className="text-xl font-semibold text-glow-white">Cybersecurity Analyst Intern</h4>
                        <p className="text-white/60">bblewrap | India (Remote) | Jun – Dec 2024</p>
                        <ul className="list-disc list-inside text-white/80 mt-2 space-y-1">
                          <li>Conducted SIEM log analysis and event correlation using Splunk and QRadar to support incident detection and investigation.</li>
                          <li>Assisted in reviewing correlation rules and security controls to reduce false positives and improve analyst efficiency.</li>
                          <li>Supported vulnerability identification and remediation efforts for the Manappuram Finance MADU application under guidance.</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="projects" className="mt-6">
                    <h3 className="text-2xl font-semibold mb-4 text-glow-white">Key Projects</h3>
                    <p className="text-white/70 mb-6">
                      Click a project to view details.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(projectsData).map(([key, proj]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedProject(key);
                            setProjectOpen(true);
                          }}
                          className="text-left bg-white/5 border border-white/10 rounded-lg p-5 hover:bg-white/10 transition focus:outline-none"
                        >
                          <h4 className="text-xl font-semibold text-white mb-1">{proj.title}</h4>
                          {proj.duration && <p className="text-white/60 text-sm mb-2">{proj.duration}</p>}
                          <p className="text-white/80 line-clamp-3">
                            {proj.description[0]}
                          </p>
                          <span className="text-white/70 text-sm mt-3 inline-block">Click for more details</span>
                        </button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="education" className="mt-6">
                    <h3 className="text-2xl font-semibold mb-4 text-glow-white">Education</h3>
                    <ul className="list-disc list-inside space-y-2 text-white/80">
                      <li>B.Tech, Computer Science | APJAKTU - SNMIMT (First Class) | 2020 – 2024</li>
                      <li>Higher Secondary (Plus Two) | Kerala State Board | 2018 – 2020</li>
                      <li>Secondary School (THSLC / Class X) | Kerala State Board | 2017 – 2018</li>
                    </ul>
                  </TabsContent>

                  <TabsContent value="certifications" className="mt-6">
                    <h3 className="text-2xl font-semibold mb-4 text-glow-white">Certifications</h3>
                    <ul className="list-disc list-inside space-y-2 text-white/80">
                      <li>CompTIA Security+ | CompTIA (Credential ID: COMP001022645550) | Aug 2025</li>
                      <li>Google Cybersecurity Professional | Coursera | Mar 2024</li>
                      <li>Ethical Hacking Associate | RedTeam</li>
                      <li>Ethical Hacking Essentials | EC-Council</li>
                    </ul>
                  </TabsContent>

                  <TabsContent value="leadership" className="mt-6">
                    <h3 className="text-2xl font-semibold mb-4 text-glow-white">Leadership & Extracurriculars</h3>
                    <ul className="list-disc list-inside space-y-3 text-white/80">
                      <li>ISTE Member and Student Coordinator @ SNMIMT</li>
                      <li>Espaniac CSE Association Member and Student Coordinator @ SNMIMT</li>
                      <li>FOSS Club Member and Student Coordinator @ SNMIMT</li>
                      <li>Creative Head of NSS Unit 129 @ SNMIMT</li>
                    </ul>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Project Details Dialog */}
            <Dialog open={projectOpen} onOpenChange={setProjectOpen}>
              <DialogContent className="bg-black text-white border border-white/10 max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {selectedProject ? projectsData[selectedProject].title : 'Project'}
                  </DialogTitle>
                  {selectedProject && projectsData[selectedProject].duration && (
                    <DialogDescription className="text-white/60">
                      {projectsData[selectedProject].duration}
                    </DialogDescription>
                  )}
                </DialogHeader>
                {selectedProject && (
                  <div className="space-y-4">
                    {projectsData[selectedProject].techStack && (
                      <p className="text-white/80">{projectsData[selectedProject].techStack}</p>
                    )}
                    <div className="space-y-2">
                      {projectsData[selectedProject].description.map((d, i) => (
                        <p key={i} className="text-white/80 leading-relaxed">
                          {d}
                        </p>
                      ))}
                    </div>
                    {projectsData[selectedProject].link && (
                      <a
                        href={projectsData[selectedProject].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-white/90 underline"
                      >
                        View on GitHub
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="pt-16 pb-28 md:py-20 relative z-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16"
          >
            Get In Touch
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold mb-6">Let's Connect</h3>
              <p className="text-white/80 mb-8">
                I'm always interested in new opportunities and collaborations.
                Feel free to reach out if you'd like to work together!
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-white/60" />
                  <span>devarajanpm79@gmail.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-white/60" />
                  <span>+91 8330857529</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-white/60" />
                  <span>Kerala, India</span>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 group"
                  asChild
                >
                  <a href="https://www.linkedin.com/in/devarajan-p-m/" target="_blank" rel="noopener noreferrer" aria-label="Open LinkedIn profile">
                    <Linkedin className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </a>
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 group"
                  asChild
                >
                  <a href="https://www.github.com/devarajan-here" target="_blank" rel="noopener noreferrer" aria-label="Open GitHub profile">
                    <Github className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </a>
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 group"
                  asChild
                >
                  <a href="https://www.instagram.com/dev_raj_an_/" target="_blank" rel="noopener noreferrer" aria-label="Open Instagram profile">
                    <Instagram className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </a>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 relative z-10 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/60">
            © 2024 Devarajan P M. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
