import React from 'react';
import { Link, useParams } from 'react-router-dom';

const pageContent = {
  'web-development': {
    title: 'Web Development',
    subtitle: 'Production-ready web platforms for modern businesses.',
    highlights: ['React / Next.js builds', 'Secure API integrations', 'SEO and performance tuning'],
    details:
      'Our web team delivers scalable interfaces with strong UX standards, accessibility, and maintainable frontend architecture. We focus on measurable business outcomes and long-term maintainability.',
  },
  'app-development': {
    title: 'App Development',
    subtitle: 'Cross-platform products optimized for mobile experiences.',
    highlights: ['Native-like performance', 'Push notifications', 'Store release support'],
    details:
      'From prototype to production, we structure app features around real user journeys and reliable backend connectivity. Build quality, smooth interactions, and efficient release cycles are our priorities.',
  },
  'cloud-solutions': {
    title: 'Cloud Solutions',
    subtitle: 'Reliable infrastructure and deployment pipelines.',
    highlights: ['CI/CD automation', 'Monitoring and alerting', 'Cost-aware scaling'],
    details:
      'We design resilient environments with clear observability, secure deployments, and predictable scaling plans. Teams gain faster releases and fewer production incidents.',
  },
  'ai-integration': {
    title: 'AI Integration',
    subtitle: 'Practical AI workflows integrated into existing products.',
    highlights: ['Prompt workflow design', 'Model/API integration', 'Human-in-the-loop controls'],
    details:
      'We implement AI features where they create clear value: automation, summarization, recommendation, and operational assistance. Safety and output quality are treated as first-class requirements.',
  },
  'about-us': {
    title: 'About Us',
    subtitle: 'A product-driven team blending design and engineering.',
    highlights: ['12+ specialists', 'Global remote collaboration', 'Enterprise + startup experience'],
    details:
      'PRISM FLUX combines strategy, engineering, and interface design to turn complex ideas into polished digital products. We work in focused cycles with transparent communication.',
  },
  'our-team': {
    title: 'Our Team',
    subtitle: 'Designers, engineers, and product specialists working as one unit.',
    highlights: ['Frontend engineers', 'Backend architects', 'Product and UX designers'],
    details:
      'Our delivery model is cross-functional by default. Each project includes technical ownership, visual quality control, and execution discipline from kickoff to release.',
  },
  careers: {
    title: 'Careers',
    subtitle: 'Build meaningful products with a high-ownership team.',
    highlights: ['Remote-first culture', 'Mentorship and growth tracks', 'Real product impact'],
    details:
      'We hire curious builders who care about quality and collaboration. Open roles are updated quarterly and include engineering, design, and product operations positions.',
  },
  'press-kit': {
    title: 'Press Kit',
    subtitle: 'Brand assets and media resources.',
    highlights: ['Logo packages', 'Brand color guide', 'Company overview PDF'],
    details:
      'The press kit includes approved brand materials, usage guidelines, and recent company highlights for publications, interviews, and event listings.',
  },
  documentation: {
    title: 'Documentation',
    subtitle: 'Technical and product setup guides.',
    highlights: ['Setup walkthroughs', 'Environment guides', 'Troubleshooting notes'],
    details:
      'Documentation is structured for fast onboarding. Teams can find architecture notes, deployment basics, and operational runbooks in one place.',
  },
  'api-reference': {
    title: 'API Reference',
    subtitle: 'Endpoint specs and integration examples.',
    highlights: ['Auth and token flow', 'Request/response schemas', 'Error handling patterns'],
    details:
      'Our API reference provides endpoint behavior, payload examples, and best practices for safe integrations across web and mobile clients.',
  },
  blog: {
    title: 'Blog',
    subtitle: 'Product updates and engineering insights.',
    highlights: ['Release summaries', 'Architecture notes', 'Design system updates'],
    details:
      'The blog shares practical lessons from real client work, covering performance, reliability, interface design, and delivery process improvements.',
  },
  support: {
    title: 'Support',
    subtitle: 'Fast assistance for product and technical questions.',
    highlights: ['Response SLA targets', 'Issue triage flow', 'Escalation support'],
    details:
      'Support requests are prioritized by impact and urgency. Most implementation issues are resolved with a first response during working hours and tracked to closure.',
  },
};

const fallback = {
  title: 'Information',
  subtitle: 'This page is currently being prepared.',
  highlights: ['Content in progress'],
  details: 'The requested section is available as a route and ready for final project content.',
};

const InfoPage = () => {
  const { slug } = useParams();
  const content = pageContent[slug] || fallback;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#121212] border border-[#2a2a2a] rounded-lg text-[#b0b0b0] hover:text-white hover:border-[#00ffff]/40 transition-all"
        >
          Back to Landing
        </Link>

        <div className="mt-6 sm:mt-8 bg-[#121212] border border-[#2a2a2a] rounded-2xl p-6 sm:p-10 md:p-12 relative overflow-hidden">
          <div className="absolute -top-24 -right-20 w-64 h-64 bg-[#9945ff]/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-20 w-64 h-64 bg-[#00ffff]/10 rounded-full blur-3xl" />

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.2em] text-[#00ffff] mb-3">PRISM FLUX</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">{content.title}</h1>
            <p className="text-[#b0b0b0] text-base sm:text-lg md:text-xl">{content.subtitle}</p>

            <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-3">
              {content.highlights.map((item) => (
                <div
                  key={item}
                  className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-[#d7d7d7]"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 p-5 bg-[#151515] border border-[#2a2a2a] rounded-xl text-sm sm:text-base text-[#b0b0b0] leading-relaxed">
              {content.details}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
