import React, { useEffect, useRef } from 'react';
import Link from '@docusaurus/Link';

export default function HeroSection() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDarkModeRef = useRef(document.documentElement.getAttribute('data-theme') === 'dark');

  useEffect(() => {
    // Listen for theme changes
    const handleThemeChange = () => {
      isDarkModeRef.current = document.documentElement.getAttribute('data-theme') === 'dark';
    };

    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Get dark mode preference
    const isDarkMode = isDarkModeRef.current;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Static grid for reduced motion
      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const gridSize = 60;
      const offsetX = (container.offsetWidth % gridSize) / 2;
      const offsetY = (container.offsetHeight % gridSize) / 2;

      // Get current theme for static grid
      const currentIsDarkMode = isDarkModeRef.current;
      // Use theme-aware colors from CSS variables
      ctx.strokeStyle = currentIsDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;

      for (let x = offsetX; x < container.offsetWidth; x += gridSize) {
        for (let y = offsetY; y < container.offsetHeight; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 0.5, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
      return;
    }

    // Mouse position tracking
    let mouseX = 0;
    let mouseY = 0;
    let mouseMoved = false;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      mouseMoved = true;
    };

    const handleMouseLeave = () => {
      mouseMoved = false;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Animation variables
    let animationFrameId;
    const gridSize = 60;
    const interactionRadius = 120;
    const maxDisplacement = 4;

    // Draw the grid with mouse interaction
    const drawGrid = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const offsetX = (container.offsetWidth % gridSize) / 2;
      const offsetY = (container.offsetHeight % gridSize) / 2;

      // Get current theme
      const currentIsDarkMode = isDarkModeRef.current;

      // Set color based on theme
      const gridColor = currentIsDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;

      for (let x = offsetX; x < container.offsetWidth; x += gridSize) {
        for (let y = offsetY; y < container.offsetHeight; y += gridSize) {
          let drawX = x;
          let drawY = y;

          // Calculate distance from mouse
          if (mouseMoved) {
            const distance = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));

            if (distance < interactionRadius) {
              // Calculate displacement based on distance and mouse direction
              const angle = Math.atan2(y - mouseY, x - mouseX);
              const displacementFactor = (interactionRadius - distance) / interactionRadius;
              const displacement = displacementFactor * maxDisplacement;

              drawX = x + Math.cos(angle) * displacement;
              drawY = y + Math.sin(angle) * displacement;

              // Add subtle glow effect in dark mode
              if (currentIsDarkMode) {
                const alpha = 0.2 * displacementFactor;
                ctx.shadowColor = 'rgba(59, 130, 246, ' + alpha + ')';
                ctx.shadowBlur = 10 * displacementFactor;
              }
            }
          }

          // Draw the point
          ctx.beginPath();
          ctx.arc(drawX, drawY, 0.5, 0, 2 * Math.PI);
          ctx.stroke();

          // Reset shadow
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }
      }

      animationFrameId = requestAnimationFrame(drawGrid);
    };

    drawGrid();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="hero hero--primary hero-enhanced"
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        paddingLeft: 0,
        paddingRight: 0,
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, var(--ifm-color-primary-darker) 0%, var(--ifm-color-primary) 50%, var(--ifm-color-primary-light) 100%)'
      }}
    >
      {/* Gradient overlay for depth */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.2) 100%)',
        zIndex: 0
      }} />

      {/* Animated background canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          opacity: 0.6
        }}
      />

      {/* Floating particles effect */}
      <div className="particles-container" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none'
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              position: 'absolute',
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Content layer with glassmorphism */}
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="row">
          <div className="col col--12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* Glassmorphic badge */}
            <div className="hero-badge" style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '50px',
              padding: '0.5rem 1.5rem',
              marginBottom: '2rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'white',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              animation: 'fadeInDown 1s ease-out',
              position: 'relative',
              zIndex: 10
            }}>
              Learn Physical AI & Humanoid Robotics
            </div>

            <h1 className="hero__title" style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: '800',
              marginBottom: '1.5rem',
              color: 'white',
              textShadow: '2px 2px rgba(255, 255, 255, 0.9)',
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
              animation: 'fadeInUp 1s ease-out 0.2s backwards',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              position: 'relative',
              zIndex: 10
            }}>
              Humanoid Robotics<br/>
              <span style={{
                color: 'white',
                display: 'inline-block',
                fontWeight: '800'
              }}>Mastery Guide</span>
            </h1>

            <p className="hero__subtitle" style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
              marginBottom: '1rem',
              color: 'rgba(255, 255, 255, 0.95)',
              maxWidth: '700px',
              lineHeight: '1.6',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              animation: 'fadeInUp 1s ease-out 0.4s backwards'
            }}>
              Master Physical AI & Advanced Robotics Development
            </p>

            <p style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
              marginBottom: '3rem',
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: '650px',
              lineHeight: '1.6',
              animation: 'fadeInUp 1s ease-out 0.6s backwards'
            }}>
              From ROS 2 fundamentals to advanced humanoid control systems
            </p>

            <div className="hero-buttons" style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              animation: 'fadeInUp 1s ease-out 0.8s backwards'
            }}>
              <Link
                className="button button-hero button-hero--primary"
                to="/docs/module-1-introduction-physical-ai"
                style={{
                  background: 'white',
                  color: 'var(--ifm-color-primary)',
                  padding: '1rem 2.5rem',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  borderRadius: '50px',
                  border: 'none',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
                }}
              >
                Start Learning
              </Link>
              <Link
                className="button button-hero button-hero--secondary"
                to="/docs/category/module-1---introduction-to-physical-ai"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  padding: '1rem 2.5rem',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  borderRadius: '50px',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                }}
              >
                View Chapters
              </Link>
            </div>

            {/* Feature highlights */}
            <div style={{
              display: 'flex',
              gap: '2rem',
              marginTop: '4rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              animation: 'fadeInUp 1s ease-out 1s backwards'
            }}>
              {[
                { icon: '🤖', text: 'Physical AI' },
                { icon: '🔧', text: 'ROS 2 Expert' },
                { icon: '🎮', text: 'Simulations' },
                { icon: '🚀', text: 'Advanced Control' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        overflow: 'hidden',
        lineHeight: 0,
        zIndex: 1
      }}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{
          width: '100%',
          height: '80px',
          fill: 'var(--ifm-background-color)'
        }}>
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>
    </section>
  );
}