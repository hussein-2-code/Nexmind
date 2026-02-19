import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../templatemo-prism-flux.css';

const featureData = [
  {
    id: 1,
    title: 'Projects',
    description:
      'Create projects, set scope and tech stack, and connect with the right freelancer. Manage everything in one place from brief to delivery.',
    image: 'images/data-nexus.jpg',
    tech: ['Scope', 'Milestones', 'Delivery'],
  },
  {
    id: 2,
    title: 'Real-time Chat',
    description:
      'Message freelancers and clients instantly. Built-in conversations keep all project communication in one thread—no more scattered emails.',
    image: 'images/neural-network.jpg',
    tech: ['Instant', 'Threaded', 'Secure'],
  },
  {
    id: 3,
    title: 'AI-Powered Tools',
    description:
      'Generate dashboard mockups and UI ideas from a short description. Use AI to speed up scoping and visualization before development.',
    image: 'images/quantum-cloud.jpg',
    tech: ['Groq AI', 'Mockups', 'Fast'],
  },
  {
    id: 4,
    title: 'Role-based Dashboards',
    description:
      'Clients see their projects and messages. Freelancers see assigned work and chats. Admins manage users and platform activity.',
    image: 'images/cyber-defense.jpg',
    tech: ['Client', 'Freelancer', 'Admin'],
  },
  {
    id: 5,
    title: 'Profiles & Skills',
    description:
      'Freelancers showcase skills, bio, and experience. Clients find the right match. Everyone stays in sync with clear roles and expectations.',
    image: 'images/blockchain-vault.jpg',
    tech: ['Profile', 'Skills', 'Match'],
  },
  {
    id: 6,
    title: 'Secure & Simple',
    description:
      'JWT authentication, role-based access, and a clean API. Build and scale your workflow without worrying about auth or permissions.',
    image: 'images/ar-interface.jpg',
    tech: ['JWT', 'Roles', 'API'],
  },
];

const featuresList = [
  { name: 'Create projects', icon: '📋', level: 100, category: 'platform' },
  { name: 'Real-time chat', icon: '💬', level: 100, category: 'platform' },
  { name: 'AI mockups', icon: '🤖', level: 100, category: 'platform' },
  { name: 'Client dashboard', icon: '👤', level: 100, category: 'platform' },
  { name: 'Freelancer dashboard', icon: '👨‍💻', level: 100, category: 'platform' },
  { name: 'Admin panel', icon: '⚙️', level: 100, category: 'platform' },
  { name: 'Profiles & skills', icon: '📌', level: 100, category: 'platform' },
  { name: 'Secure auth (JWT)', icon: '🔐', level: 100, category: 'platform' },
];

const statsConfig = [
  { icon: '📋', label: 'Projects', target: 500, description: 'Projects created and managed on Nexmind by clients and freelancers.' },
  { icon: '👥', label: 'Freelancers', target: 120, description: 'Skilled freelancers ready to take on your next project.' },
  { icon: '💬', label: 'Messages', target: 100, description: 'Real-time conversations keeping teams aligned on every project.' },
  { icon: '🤖', label: 'AI-Powered', target: 1, description: 'Built-in AI tools to generate mockups and speed up your workflow.' },
];

const sections = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'stats', label: 'Metrics' },
  { id: 'skills', label: 'Features' },
  { id: 'contact', label: 'Contact' },
];

const Landing = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);
  const [activeSection, setActiveSection] = useState('home');
  const [statsValues, setStatsValues] = useState(statsConfig.map(() => 0));
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Check if this is the initial page load (not navigation)
  useEffect(() => {
    // Check if the page was reloaded or if it's the first visit
    const isReload = performance.navigation?.type === 1 || 
                     window.performance?.getEntriesByType?.('navigation')[0]?.type === 'reload';
    
    // Check if there's a flag in sessionStorage indicating this is not the first load
    const hasVisited = sessionStorage.getItem('hasVisitedLanding');
    
    if (isReload || !hasVisited) {
      // This is either a reload or first visit
      setIsInitialLoad(true);
      setIsLoaded(false);
      
      // Set timeout to hide loader
      const timeout = setTimeout(() => {
        setIsLoaded(true);
        // Set flag in sessionStorage to indicate user has visited
        sessionStorage.setItem('hasVisitedLanding', 'true');
      }, 1500);
      
      return () => clearTimeout(timeout);
    } else {
      // This is navigation from another page, no loader needed
      setIsInitialLoad(false);
      setIsLoaded(true);
    }
  }, []);

  // Window resize for carousel responsiveness
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    const header = document.getElementById('header');
    if (!section || !header) return;

    const headerHeight = header.offsetHeight;
    const targetPosition = section.offsetTop - headerHeight;
    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    setIsNavOpen(false);
  };

  // Parallax + active nav + header scroll style + stats observer
  useEffect(() => {
    const header = document.getElementById('header');
    const hero = document.querySelector('.hero');
    const statsSection = document.querySelector('.stats-section');

    const handleScroll = () => {
      const y = window.scrollY;

      // Header style
      if (header) {
        if (y > 100) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
      }

      // Parallax
      if (hero) {
        hero.style.transform = `translateY(${y * 0.5}px)`;
      }

      // Active section
      const offset = y + 100;
      const sectionElements = document.querySelectorAll('section[id]');
      sectionElements.forEach((sec) => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (offset >= top && offset < top + height) {
          setActiveSection(sec.id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);

    // Stats counters with IntersectionObserver
    if (statsSection && !statsAnimated) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !statsAnimated) {
              setStatsAnimated(true);
              const duration = 2000;
              const frameRate = 16;
              const steps = duration / frameRate;

              statsConfig.forEach((stat, i) => {
                let current = 0;
                const increment = stat.target / steps;
                const interval = setInterval(() => {
                  current += increment;
                  if (current >= stat.target) {
                    current = stat.target;
                    clearInterval(interval);
                  }
                  setStatsValues((prev) => {
                    const next = [...prev];
                    next[i] = Math.floor(current);
                    return next;
                  });
                }, frameRate);
              });
            }
          });
        },
        { threshold: 0.5, rootMargin: '0px 0px -100px 0px' },
      );

      observer.observe(statsSection);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        observer.disconnect();
      };
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [statsAnimated]);

  // Carousel auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featureData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 20}s`,
      animationDuration: `${18 + Math.random() * 8}s`,
    }));
  }, []);

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1024;

  const getCarouselItemStyle = (index) => {
    const totalItems = featureData.length;
    let offset = index - currentIndex;
    if (offset > totalItems / 2) offset -= totalItems;
    else if (offset < -totalItems / 2) offset += totalItems;

    const absOffset = Math.abs(offset);
    const sign = offset < 0 ? -1 : 1;

    let spacing1 = 400;
    let spacing2 = 600;
    let spacing3 = 750;

    if (isMobile) {
      spacing1 = 280;
      spacing2 = 420;
      spacing3 = 550;
    } else if (isTablet) {
      spacing1 = 340;
      spacing2 = 520;
      spacing3 = 650;
    }

    if (absOffset === 0) {
      return {
        transform: 'translate(-50%, -50%) translateZ(0) scale(1)',
        opacity: 1,
        zIndex: 10,
      };
    }
    if (absOffset === 1) {
      const translateX = sign * spacing1;
      const rotation = isMobile ? 25 : 30;
      const scale = isMobile ? 0.88 : 0.85;
      return {
        transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(-200px) rotateY(${
          -sign * rotation
        }deg) scale(${scale})`,
        opacity: 0.8,
        zIndex: 5,
      };
    }
    if (absOffset === 2) {
      const translateX = sign * spacing2;
      const rotation = isMobile ? 35 : 40;
      const scale = isMobile ? 0.75 : 0.7;
      return {
        transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(-350px) rotateY(${
          -sign * rotation
        }deg) scale(${scale})`,
        opacity: 0.5,
        zIndex: 3,
      };
    }
    if (absOffset === 3) {
      const translateX = sign * spacing3;
      const rotation = isMobile ? 40 : 45;
      const scale = isMobile ? 0.65 : 0.6;
      return {
        transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(-450px) rotateY(${
          -sign * rotation
        }deg) scale(${scale})`,
        opacity: 0.3,
        zIndex: 2,
      };
    }
    return {
      transform: 'translate(-50%, -50%) translateZ(-500px) scale(0.5)',
      opacity: 0,
      zIndex: 1,
    };
  };

  const filteredSkills =
    activeCategory === 'all'
      ? featuresList
      : featuresList.filter((skill) => skill.category === activeCategory);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    alert(
      `Thank you ${data.name}! Your message has been transmitted successfully. We'll respond within 24 hours.`,
    );
    form.reset();
  };

  return (
    <div className="landing-body">
      {/* Loading Screen - Only shows on initial page load/reload, not navigation */}
      {isInitialLoad && (
        <div className={`loader${isLoaded ? ' hidden' : ''}`} id="loader">
          <div className="loader-content">
            <div className="loader-orbit">
              <div className="orbit-ring orbit-ring-1" />
              <div className="orbit-ring orbit-ring-2" />
              <div className="orbit-ring orbit-ring-3" />
              <div className="orbit-core">N</div>
            </div>
            <div className="loader-label">
              Nexmind
            </div>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <header className="header" id="header">
        <nav className="nav-container">
          <button
            type="button"
            className="logo"
            onClick={() => scrollToSection('home')}
          >
            <div className="logo-icon">
              <div className="logo-prism">
                <div className="prism-shape" />
              </div>
            </div>
            <span className="logo-text">
              <span className="prism">NEX</span>
              <span className="flux">MIND</span>
            </span>
          </button>

          <ul className={`nav-menu${isNavOpen ? ' active' : ''} `} id="navMenu">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  className={`nav-link${activeSection === section.id ? ' active' : ''}`}
                  onClick={() => scrollToSection(section.id)}
                >
                  {section.label}
                </button>
              </li>
            ))}
            <li>
              <Link to="/signup" className="nav-link">
                Sign up
              </Link>
            </li>
            <li>
              <Link to="/login" className="nav-link">
                Login
              </Link>
            </li>
          </ul>

          <button
            type="button"
            className={`menu-toggle${isNavOpen ? ' active' : ''}`}
            id="menuToggle"
            onClick={() => setIsNavOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      {/* Hero Section with 3D Carousel */}
      <section className="hero" id="home">
        <p className="hero-tagline">
          Connect clients and freelancers. Create projects, chat in real time, and ship with AI-powered tools.
        </p>
        <div className="carousel-container">
          <div className="carousel" id="carousel">
            {featureData.map((item, index) => (
              <div
                key={item.id}
                className="carousel-item"
                style={{
                  ...getCarouselItemStyle(index),
                  transition: 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)',
                }}
              >
                <div className="card">
                  <div className="card-number">{`0${item.id}`}</div>
                  <div className="card-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-description">{item.description}</p>
                  <div className="card-tech">
                    {item.tech.map((tech) => (
                      <span key={tech} className="tech-badge">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="card-cta"
                    onClick={() => scrollToSection('about')}
                  >
                    Explore
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="carousel-controls">
            <button
              type="button"
              className="carousel-btn"
              onClick={() =>
                setCurrentIndex(
                  (prev) => (prev - 1 + featureData.length) % featureData.length,
                )
              }
            >
              ‹
            </button>
            <button
              type="button"
              className="carousel-btn"
              onClick={() =>
                setCurrentIndex((prev) => (prev + 1) % featureData.length)
              }
            >
              ›
            </button>
          </div>

          <div className="carousel-indicators" id="indicators">
            {featureData.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`indicator${index === currentIndex ? ' active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Prism Philosophy Section (About) */}
      <section className="philosophy-section" id="about">
        <div className="philosophy-container">
          <div className="prism-line" />

          <h2 className="philosophy-headline">
            Connect. Build.
            <br />
            Ship.
          </h2>

          <p className="philosophy-subheading">
            Nexmind connects clients with skilled freelancers and brings ideas to life. Create
            projects, chat in real time, and use AI-powered tools to go from brief to delivered
            product—faster.
          </p>

          <div className="philosophy-pillars">
            <div className="pillar">
              <div className="pillar-icon">💎</div>
              <h3 className="pillar-title">Projects that ship</h3>
              <p className="pillar-description">
                Post your brief, match with the right freelancer, and manage the whole project in
                one place. Clear roles, milestones, and real-time messaging keep everyone aligned.
              </p>
            </div>

            <div className="pillar">
              <div className="pillar-icon">🔬</div>
              <h3 className="pillar-title">AI-powered workflow</h3>
              <p className="pillar-description">
                Use AI to generate dashboard mockups, refine scope, and speed up delivery. We blend
                human expertise with smart tools so you spend less time on admin and more on building.
              </p>
            </div>

            <div className="pillar">
              <div className="pillar-icon">∞</div>
              <h3 className="pillar-title">Built for growth</h3>
              <p className="pillar-description">
                Whether you&apos;re a client with one project or a freelancer managing many,
                Nexmind scales with you. Transparent communication and simple workflows from first
                brief to long-term collaboration.
              </p>
            </div>
          </div>

          <div className="philosophy-particles" id="particles">
            {particles.map((p, idx) => (
              <div
                key={idx}
                className="particle"
                style={{
                  left: p.left,
                  top: p.top,
                  animationDelay: p.animationDelay,
                  animationDuration: p.animationDuration,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" id="stats">
        <div className="section-header">
          <h2 className="section-title">Nexmind at a glance</h2>
          <p className="section-subtitle">
            The platform that connects clients and freelancers with projects and real-time chat
          </p>
        </div>

        <div className="stats-grid">
          {statsConfig.map((stat, index) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number" data-target={stat.target}>
                {statsValues[index]}
              </div>
              <div className="stat-label">{stat.label}</div>
              <p className="stat-description">{stat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Section */}
      <section className="skills-section" id="skills">
        <div className="skills-container">
          <div className="section-header">
            <h2 className="section-title">What Nexmind offers</h2>
            <p className="section-subtitle">
              Everything you need to run projects between clients and freelancers
            </p>
          </div>

          <div className="skill-categories">
            <button
              type="button"
              className="category-tab active"
              onClick={() => setActiveCategory('all')}
            >
              Platform features
            </button>
          </div>

          <div className="skills-hexagon-grid" id="skillsGrid">
            {filteredSkills.map((skill, index) => (
              <div
                key={skill.name}
                className="skill-hexagon"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="hexagon-inner">
                  <div className="hexagon-content">
                    <div className="skill-icon-hex">{skill.icon}</div>
                    <div className="skill-name-hex">{skill.name}</div>
                    <div className="skill-level">
                      <div
                        className="skill-level-fill"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                    <div className="skill-percentage-hex">{skill.level}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <div className="section-header">
          <h2 className="section-title">Initialize Connection</h2>
          <p className="section-subtitle">
            Ready to transform your vision into reality? Let&apos;s connect.
          </p>
        </div>

        <div className="contact-container">
          <div className="contact-info">
            <a
              href="https://maps.google.com/?q=Silicon+Valley+CA+94025"
              target="_blank"
              rel="noreferrer"
              className="info-item"
            >
              <div className="info-icon">📍</div>
              <div className="info-text">
                <h4>Location</h4>
                <p>Silicon Valley, CA 94025</p>
              </div>
            </a>

            <a href="mailto:hello@nexmind.io" className="info-item">
              <div className="info-icon">📧</div>
              <div className="info-text">
                <h4>Email</h4>
                <p>hello@nexmind.io</p>
              </div>
            </a>

            <a href="tel:+15551234567" className="info-item">
              <div className="info-icon">📱</div>
              <div className="info-text">
                <h4>Phone</h4>
                <p>+1 (555) 123-4567</p>
              </div>
            </a>

            <a
              href="https://calendly.com"
              target="_blank"
              rel="noreferrer"
              className="info-item"
            >
              <div className="info-icon">📅</div>
              <div className="info-text">
                <h4>Schedule Meeting</h4>
                <p>Book a consultation</p>
              </div>
            </a>
          </div>

          <form className="contact-form" id="contactForm" onSubmit={handleContactSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input type="text" id="subject" name="subject" required />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" required />
            </div>

            <button type="submit" className="submit-btn">
              Transmit Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon">
                <div className="logo-prism">
                  <div className="prism-shape" />
                </div>
              </div>
              <span className="logo-text">
                <span className="prism">NEX</span>
                <span className="flux">MIND</span>
              </span>
            </div>
            <p className="footer-description">
              Connect with freelancers, manage projects, and ship with AI-powered tools. Nexmind
              turns ideas into delivered work.
            </p>
            <div className="footer-social">
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="social-icon">
                f
              </a>
              <a href="https://www.x.com" target="_blank" rel="noreferrer" className="social-icon">
                t
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="social-icon">
                in
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="social-icon">
                ig
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Services</h4>
            <div className="footer-links">
              <Link to="/info/web-development">Web Development</Link>
              <Link to="/info/app-development">App Development</Link>
              <Link to="/info/cloud-solutions">Cloud Solutions</Link>
              <Link to="/info/ai-integration">AI Integration</Link>
            </div>
          </div>

          <div className="footer-section">
            <h4>Company</h4>
            <div className="footer-links">
              <Link to="/info/about-us">About Us</Link>
              <Link to="/info/our-team">Our Team</Link>
              <Link to="/info/careers">Careers</Link>
              <Link to="/info/press-kit">Press Kit</Link>
            </div>
          </div>

          <div className="footer-section">
            <h4>Resources</h4>
            <div className="footer-links">
              <Link to="/info/documentation">Documentation</Link>
              <Link to="/info/api-reference">API Reference</Link>
              <Link to="/info/blog">Blog</Link>
              <Link to="/info/support">Support</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">© 2026 Nexmind. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;