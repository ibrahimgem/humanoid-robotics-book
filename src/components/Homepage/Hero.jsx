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
      className="hero hero--primary"
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        paddingLeft: 0,
        paddingRight: 0
      }}
    >
      {/* Animated background canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      />

      {/* Content layer - Centralized */}
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="row">
          <div className="col col--12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h1 className="hero__title">Humanoid Robotics Book</h1>
            <p className="hero__subtitle">Master Physical AI & Humanoid Robotics Development</p>
            <p className="hero__subtitle">From ROS 2 fundamentals to advanced humanoid control systems</p>
            <div className="margin-top--lg">
              <Link
                className="button button--secondary button--lg"
                to="/docs/introduction">
                Start Reading
              </Link>
              <Link
                className="button button--outline button--primary button--lg margin-left--md"
                to="/docs">
                View Chapters
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}