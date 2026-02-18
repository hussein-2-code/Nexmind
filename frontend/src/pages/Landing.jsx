import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../templatemo-prism-flux.css';

const portfolioData = [
  {
    id: 1,
    title: 'Neural Network',
    description:
      'Advanced AI system with deep learning capabilities for predictive analytics and pattern recognition.',
    image: 'images/neural-network.jpg',
    tech: ['TensorFlow', 'Python', 'CUDA'],
  },
  {
    id: 2,
    title: 'Quantum Cloud',
    description:
      'Next-generation cloud infrastructure leveraging quantum computing for unprecedented processing power.',
    image: 'images/quantum-cloud.jpg',
    tech: ['AWS', 'Kubernetes', 'Docker'],
  },
  {
    id: 3,
    title: 'Blockchain Vault',
    description:
      'Secure decentralized storage solution using advanced encryption and distributed ledger technology.',
    image: 'images/blockchain-vault.jpg',
    tech: ['Ethereum', 'Solidity', 'Web3'],
  },
  {
    id: 4,
    title: 'Cyber Defense',
    description:
      'Military-grade cybersecurity framework with real-time threat detection and automated response.',
    image: 'images/cyber-defense.jpg',
    tech: ['Zero Trust', 'AI Defense', 'Encryption'],
  },
  {
    id: 5,
    title: 'Data Nexus',
    description:
      'Big data processing platform capable of analyzing petabytes of information in real-time.',
    image: 'images/data-nexus.jpg',
    tech: ['Apache Spark', 'Hadoop', 'Kafka'],
  },
  {
    id: 6,
    title: 'AR Interface',
    description:
      'Augmented reality system for immersive data visualization and interactive experiences.',
    image: 'images/ar-interface.jpg',
    tech: ['Unity', 'ARCore', 'Computer Vision'],
  },
  {
    id: 7,
    title: 'IoT Matrix',
    description:
      'Intelligent IoT ecosystem connecting millions of devices with edge computing capabilities.',
    image: 'images/iot-matrix.jpg',
    tech: ['MQTT', 'Edge AI', '5G'],
  },
];

const skillsData = [
  { name: 'React.js', icon: '⚛️', level: 95, category: 'frontend' },
  { name: 'Node.js', icon: '🟢', level: 90, category: 'backend' },
  { name: 'TypeScript', icon: '📘', level: 88, category: 'frontend' },
  { name: 'AWS', icon: '☁️', level: 92, category: 'cloud' },
  { name: 'Docker', icon: '🐳', level: 85, category: 'cloud' },
  { name: 'Python', icon: '🐍', level: 93, category: 'backend' },
  { name: 'Kubernetes', icon: '☸️', level: 82, category: 'cloud' },
  { name: 'GraphQL', icon: '◈', level: 87, category: 'backend' },
  { name: 'TensorFlow', icon: '🤖', level: 78, category: 'emerging' },
  { name: 'Blockchain', icon: '🔗', level: 75, category: 'emerging' },
  { name: 'Vue.js', icon: '💚', level: 85, category: 'frontend' },
  { name: 'MongoDB', icon: '🍃', level: 90, category: 'backend' },
];

const statsConfig = [
  { icon: '🚀', label: 'Projects Completed', target: 150, description: 'Successfully delivered enterprise-level solutions across multiple industries with 100% on-time completion rate.' },
  { icon: '⚡', label: 'Client Satisfaction %', target: 99, description: 'Maintaining excellence through continuous feedback loops and agile development methodologies.' },
  { icon: '🏆', label: 'Industry Awards', target: 25, description: 'Recognized globally for innovation in digital transformation and technological advancement.' },
  { icon: '💎', label: 'Code Commits Daily', target: 500, description: 'Continuous integration and deployment with automated testing ensuring maximum code quality.' },
];

const sections = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'stats', label: 'Metrics' },
  { id: 'skills', label: 'Arsenal' },
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
      setCurrentIndex((prev) => (prev + 1) % portfolioData.length);
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
    const totalItems = portfolioData.length;
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
      ? skillsData
      : skillsData.filter((skill) => skill.category === activeCategory);

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
              <div className="orbit-core">PF</div>
            </div>
            <div className="loader-label">
              Initializing PRISM FLUX
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
              <span className="prism">PRISM</span>
              <span className="flux">FLUX</span>
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
                Sign Up
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
        <div className="carousel-container">
          <div className="carousel" id="carousel">
            {portfolioData.map((item, index) => (
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
                  (prev) => (prev - 1 + portfolioData.length) % portfolioData.length,
                )
              }
            >
              ‹
            </button>
            <button
              type="button"
              className="carousel-btn"
              onClick={() =>
                setCurrentIndex((prev) => (prev + 1) % portfolioData.length)
              }
            >
              ›
            </button>
          </div>

          <div className="carousel-indicators" id="indicators">
            {portfolioData.map((item, index) => (
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
            Refracting Ideas
            <br />
            Into Reality
          </h2>

          <p className="philosophy-subheading">
            At PRISM FLUX, we transform complex challenges into elegant solutions through the
            convergence of cutting-edge technology and visionary design. Every project is a spectrum
            of possibilities waiting to be discovered.
          </p>

          <div className="philosophy-pillars">
            <div className="pillar">
              <div className="pillar-icon">💎</div>
              <h3 className="pillar-title">Innovation</h3>
              <p className="pillar-description">
                Breaking boundaries with revolutionary approaches that redefine industry standards
                and push the limits of what&apos;s possible. Elevate your designs with premium
                vector stickers from{' '}
                <a
                  href="https://www.vectorsticker.com"
                  rel="nofollow"
                  target="_blank"
                >
                  VectorSticker
                </a>
                .
              </p>
            </div>

            <div className="pillar">
              <div className="pillar-icon">🔬</div>
              <h3 className="pillar-title">Precision</h3>
              <p className="pillar-description">
                Meticulous attention to detail ensures every pixel, every line of code, and every
                interaction is perfectly crafted by{' '}
                <a
                  href="https://templatemo.com"
                  rel="nofollow"
                  target="_blank"
                  style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}
                >
                  TemplateMo
                </a>
                , enhanced with stunning visuals from{' '}
                <a
                  href="https://unsplash.com"
                  rel="nofollow"
                  target="_blank"
                  style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}
                >
                  Unsplash
                </a>
                .
              </p>
            </div>

            <div className="pillar">
              <div className="pillar-icon">∞</div>
              <h3 className="pillar-title">Evolution</h3>
              <p className="pillar-description">
                Continuous adaptation and growth, staying ahead of trends while building timeless
                solutions for tomorrow. Boost your productivity with the easy-to-use timer tools at{' '}
                <a href="https://timermo.com" rel="nofollow" target="_blank">
                  TimerMo
                </a>
                .
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
          <h2 className="section-title">Performance Metrics</h2>
          <p className="section-subtitle">
            Real-time analytics and achievements powered by cutting-edge technology
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
            <h2 className="section-title">Technical Arsenal</h2>
            <p className="section-subtitle">
              Mastery of cutting-edge technologies and frameworks
            </p>
          </div>

          <div className="skill-categories">
            {['all', 'frontend', 'backend', 'cloud', 'emerging'].map((category) => (
              <button
                key={category}
                type="button"
                className={`category-tab${
                  activeCategory === category ? ' active' : ''
                }`}
                data-category={category}
                onClick={() => setActiveCategory(category)}
              >
                {category === 'all'
                  ? 'All Skills'
                  : category === 'frontend'
                  ? 'Frontend'
                  : category === 'backend'
                  ? 'Backend'
                  : category === 'cloud'
                  ? 'Cloud & DevOps'
                  : 'Emerging Tech'}
              </button>
            ))}
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

            <a href="mailto:hello@prismflux.io" className="info-item">
              <div className="info-icon">📧</div>
              <div className="info-text">
                <h4>Email</h4>
                <p>hello@prismflux.io</p>
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
                <span className="prism">PRISM</span>
                <span className="flux">FLUX</span>
              </span>
            </div>
            <p className="footer-description">
              Refracting complex challenges into brilliant solutions through the convergence of
              art, science, and technology.
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
          <div className="copyright">© 2026 PRISM FLUX. All rights reserved.</div>
          <div className="footer-credits">
            Designed by{' '}
            <a href="https://templatemo.com" rel="nofollow" target="_blank">
              TemplateMo
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;