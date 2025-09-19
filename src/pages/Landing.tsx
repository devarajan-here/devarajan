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
  Linkedin, 
  Mail, 
  MapPin, 
  Phone 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
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
    dopexdev: {
      title: 'AI Phish Guard',
      duration: 'June 2025 – Present',
      techStack:
        'Tech Stack: Python, Scikit-learn, Flask, Pandas, Regex, Splunk, Microsoft Sentinel, KQL, VirusTotal API, urlscan.io API, MXToolbox',
      description: [
        'AI-powered phishing detection system that monitors inbound emails and related signals.',
        'Uses ML and log analysis to spot anomalies, phishing attempts, and risky login behaviors (~92% accuracy).',
        'Simulates Sentinel alerts with custom KQL; Flask dashboard visualizes alerts and metadata.',
        'Automated email ingestion enriches IOCs (URLs, headers, attachments) via VirusTotal, urlscan.io, and MXToolbox to score reputation and auto-flag threats.',
      ],
      link: 'https://github.com/your-github-link-here/dopexdev',
    },
    'malware-analyzer': {
      title: 'Malware Analyzer',
      techStack: 'Tech Stack: Python',
      description: [
        'Developed a Python-based tool to detect and mitigate risks from malicious URLs and embedded content.',
        'Demonstrated threat detection logic, link scanning, and basic malware signature analysis.',
      ],
      link: 'https://github.com/devarajan-here/Malware-analyzer',
    },
    'dev-ai': {
      title: 'Dev-AI Interview Assistant Tool',
      techStack: 'Tech Stack: Python, OpenAI API, NLP',
      description: [
        'Developed an AI-powered Python application designed to assist with interview preparation by providing relevant questions, real-time feedback, and practice sessions.',
        'Utilized natural language processing (NLP) techniques and OpenAI API to simulate real interview scenarios, improving user communication and problem-solving skills.',
      ],
      link: 'https://github.com/devarajan-here/Interview-Cracker-DopeXDev',
    },
    'students-corner': {
      title: 'Students Corner',
      techStack:
        'Tech Stack: Centralized platform (add stack if applicable, e.g., HTML, CSS, JS, backend framework)',
      description: [
        'Designed a centralized communication platform to improve information sharing between students and educators.',
        'Features include discussion forums, announcements, and resource-sharing modules.',
      ],
      link: 'https://github.com/devarajan-here/students-corner',
    },
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <SpaceBackground />
      {/* 3D Spaceship Layer */}
      <Spaceship />
      {/* 3D Photo Layer */}
      <Photo />
      
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
                <p className="text-white/80">Security Analyst / Cybersecurity Professional</p>
                <p className="text-white/60">Thrissur, Kerala, India</p>
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
                <span className="inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Thrissur, Kerala, India
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
                    href="/assets/Devarajan.pdf"
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
                      <h3 className="text-2xl font-semibold mb-2">Objective</h3>
                      <p className="text-white/80 leading-relaxed">
                        Aspiring Security Analyst with strong foundational knowledge in network security, threat intelligence, and log
                        analysis. Eager to contribute to proactive threat detection and risk mitigation to strengthen organizational
                        security posture, leveraging expertise in SIEM tools, AI-driven security, and incident response workflows.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="skills" className="mt-6 space-y-6">
                    <div>
                      <h4 className="text-2xl font-semibold mb-3">Technical Skills</h4>
                      <ul className="space-y-3 text-white/80">
                        <li>
                          <span className="font-semibold">SOC Operations:</span>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>SOC Monitoring, Log Analysis</li>
                            <li>SIEM: Splunk, IBM QRadar, Microsoft Sentinel</li>
                            <li>Endpoint Security, Threat Detection, Incident Response</li>
                            <li>Alert Analysis, Phishing Investigation, Incident Triage</li>
                            <li>Alert Prioritization, Correlation Rule Testing</li>
                            <li>Workflow Automation: Tines, Slack</li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-semibold">Security Concepts:</span>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Threat Intelligence, Network Security</li>
                            <li>Frameworks: MITRE ATT&CK, Cyber Kill Chain</li>
                            <li>Risk &amp; Vulnerability Analysis</li>
                            <li>DLP Tools, Email Security Analysis</li>
                            <li>Security Controls Evaluation, ISO 27001 Compliance</li>
                            <li>IP Addressing, Subnetting</li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-semibold">AI/ML for Security:</span>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Machine Learning Models, Anomaly Detection</li>
                            <li>Phishing Detection, Suspicious Login Behavior Detection</li>
                            <li>Generative AI Fundamentals</li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-semibold">Operating Systems:</span>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Linux</li>
                            <li>Windows Event Logs</li>
                            <li>Active Directory</li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-semibold">Tools &amp; Technologies:</span>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Packet Analysis (Wireshark)</li>
                            <li>Pentest Tools (basic exposure)</li>
                            <li>Virtual Machines, Wazuh</li>
                            <li>KQL, Regex</li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-semibold">Programming:</span>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Python (automation, scripting, Scikit-learn, Flask, Pandas)</li>
                            <li>SQL</li>
                            <li>C</li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="soft-skills" className="mt-6">
                    <h3 className="text-2xl font-semibold mb-3">Soft Skills</h3>
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
                    <h3 className="text-2xl font-semibold mb-3">Languages</h3>
                    <ul className="list-disc list-inside space-y-1 text-white/80">
                      <li>English (Fluent)</li>
                      <li>Malayalam (Native)</li>
                      <li>Hindi (Fluent)</li>
                      <li>Tamil (Conversational)</li>
                    </ul>
                  </TabsContent>

                  <TabsContent value="experience" className="mt-6">
                    <h3 className="text-2xl font-semibold mb-4">Professional & Practical Experience</h3>
                    <p className="text-white/70 mb-6">
                      Chronological overview of internships and hands-on learning experiences.
                    </p>
                    <div className="space-y-8">
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-white"></div>
                        <div className="absolute left-0 top-2 bottom-[-2rem] w-px bg-white/20" />
                        <h4 className="text-xl font-semibold">Cybersecurity Analyst Intern</h4>
                        <p className="text-white/60">bblewrap | June 2024 – December 2024</p>
                        <ul className="list-disc list-inside text-white/80 mt-2 space-y-1">
                          <li>Identified application-level vulnerabilities in Manappuram Finance MADU app and supported remediation.</li>
                          <li>Performed log analysis and event correlation to detect potential security incidents.</li>
                          <li>Evaluated security controls and improved threat detection capabilities.</li>
                        </ul>
                      </div>
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-white"></div>
                        <div className="absolute left-0 top-2 bottom-[-2rem] w-px bg-white/20" />
                        <h4 className="text-xl font-semibold">Cybersecurity Engineer</h4>
                        <p className="text-white/60">Finpro Technologies | January 2025</p>
                        <ul className="list-disc list-inside text-white/80 mt-2 space-y-1">
                          <li>Supported ISO 27001-aligned GRC initiatives.</li>
                          <li>Documented policies, risk assessments, and compliance controls.</li>
                          <li>Assisted pre-sales demos and mapped capabilities to client needs.</li>
                        </ul>
                      </div>
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-white"></div>
                        <div className="absolute left-0 top-2 bottom-[-2rem] w-px bg-white/20" />
                        <h4 className="text-xl font-semibold">Home Lab Setup</h4>
                        <p className="text-white/60">Self-Initiated Learning</p>
                        <ul className="list-disc list-inside text-white/80 mt-2 space-y-1">
                          <li>VMs with Splunk and Wazuh; simulated attacks/defense; Windows Event Log parsing; phishing investigation.</li>
                        </ul>
                      </div>
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-white"></div>
                        <div className="absolute left-0 top-2 bottom-[-2rem] w-px bg-white/20" />
                        <h4 className="text-xl font-semibold">TryHackMe & LetsDefend</h4>
                        <p className="text-white/60">Online Platforms</p>
                        <ul className="list-disc list-inside text-white/80 mt-2 space-y-1">
                          <li>Trained on SOC workflows, SIEM concepts, endpoint protection, and phishing analysis.</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="projects" className="mt-6">
                    <h3 className="text-2xl font-semibold mb-4">Key Projects</h3>
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
                    <h3 className="text-2xl font-semibold mb-4">Education</h3>
                    <ul className="list-disc list-inside space-y-2 text-white/80">
                      <li>B.Tech in Computer Science — APJAKTU (First Class) | 2020–2024</li>
                      <li>College: SNMIMT SNM Institute of Management and Technology</li>
                      <li>Plus Two in Computer Science — MES P Vemballur High School | 2018–2020</li>
                      <li>Class X — T.H.S Kodungallur | 2017–2018</li>
                    </ul>
                  </TabsContent>

                  <TabsContent value="certifications" className="mt-6">
                    <h3 className="text-2xl font-semibold mb-4">Certifications</h3>
                    <ul className="list-disc list-inside space-y-2 text-white/80">
                      <li>CompTIA Security+ — CompTIA | 08/2025 (Credential ID: COMP001022645550)</li>
                      <li>Generative AI Fundamentals — GeeksforGeeks</li>
                      <li>Google Cybersecurity Professional — Coursera | 03/2024</li>
                      <li>Ethical Hacking Associate — RedTeam</li>
                      <li>Ethical Hacking Essentials — EC-Council</li>
                      <li>Foundations of Cybersecurity — Coursera | 12/2023</li>
                    </ul>
                  </TabsContent>

                  <TabsContent value="leadership" className="mt-6">
                    <h3 className="text-2xl font-semibold mb-4">Leadership & Extracurriculars</h3>
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
                  <span>Thrissur, Kerala, India</span>
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