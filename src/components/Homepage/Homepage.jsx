import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import HeroSection from './Hero';

export default function Homepage() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const handleMouseEnter = (index) => {
    setHoveredCard(index);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
  };

  const featureCards = [
    {
      title: '🤖 Physical AI',
      description: 'Understand embodied intelligence and how robots interact with the physical world',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      index: 0
    },
    {
      title: '🔧 ROS 2',
      description: 'Master nodes, topics, services, URDF, and rclpy for robust robotic applications',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      index: 1
    },
    {
      title: '🎮 Simulation',
      description: 'Work with Gazebo, Unity, and NVIDIA Isaac for advanced robot simulation',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      index: 2
    },
    {
      title: '🚀 Advanced Control',
      description: 'Implement humanoid kinematics, locomotion, and intelligent control systems',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      index: 3
    }
  ];

  return (
    <div className="homepage">
      {/* Hero Section with Animated Background */}
      <HeroSection />

      {/* Feature Cards Section - Premium Design */}
      <div style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        padding: '6rem 0',
        background: 'var(--ifm-background-color)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.03,
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--ifm-color-emphasis-300) 1px, transparent 0)',
          backgroundSize: '40px 40px',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text--center" style={{ marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '800',
              marginBottom: '1rem',
              color: 'var(--ifm-heading-color)',
              letterSpacing: '-0.02em'
            }}>
              What You'll Master
            </h2>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--ifm-color-emphasis-700)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Comprehensive coverage of modern humanoid robotics
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {featureCards.map((card, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: hoveredCard === index ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Gradient background */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: card.gradient,
                  opacity: hoveredCard === index ? 0.15 : 0.08,
                  transition: 'opacity 0.4s ease',
                  zIndex: 0
                }} />

                {/* Card content */}
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  background: 'var(--ifm-background-surface-color)',
                  borderRadius: '24px',
                  padding: '2.5rem',
                  minHeight: '260px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: hoveredCard === index
                    ? '0 20px 60px rgba(0, 0, 0, 0.15)'
                    : '0 10px 30px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.4s ease',
                  border: '1px solid var(--ifm-color-emphasis-200)'
                }}>
                  {/* Icon with gradient */}
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '1.5rem',
                    filter: hoveredCard === index ? 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))' : 'none',
                    transition: 'all 0.4s ease',
                    transform: hoveredCard === index ? 'scale(1.1) rotateZ(5deg)' : 'scale(1) rotateZ(0deg)'
                  }}>
                    {card.title.split(' ')[0]}
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    marginBottom: '1rem',
                    color: 'var(--ifm-heading-color)',
                    letterSpacing: '-0.01em'
                  }}>
                    {card.title.substring(card.title.indexOf(' ') + 1)}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: '1rem',
                    lineHeight: '1.7',
                    color: 'var(--ifm-color-emphasis-700)',
                    margin: 0,
                    flexGrow: 1
                  }}>
                    {card.description}
                  </p>

                  {/* Decorative corner element */}
                  <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: card.gradient,
                    opacity: hoveredCard === index ? 0.2 : 0,
                    transition: 'opacity 0.4s ease',
                    filter: 'blur(15px)'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Book Structure Preview - Premium Design */}
      <div style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        padding: '6rem 0',
        background: 'var(--ifm-background-surface-color)',
        position: 'relative'
      }}>
        <div className="container">
          <div className="text--center" style={{ marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '800',
              marginBottom: '1rem',
              color: 'var(--ifm-heading-color)',
              letterSpacing: '-0.02em'
            }}>
              Your Learning Journey
            </h2>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--ifm-color-emphasis-700)',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.7'
            }}>
              A structured progression from fundamentals to advanced implementations
            </p>
          </div>

          <div className="row">
            <div className="col col--10 col--offset-1">
              <div style={{
                background: 'var(--ifm-background-color)',
                borderRadius: '32px',
                padding: 'clamp(2rem, 5vw, 4rem)',
                boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.15)',
                border: '1px solid var(--ifm-color-emphasis-200)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Decorative gradient corner */}
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '200px',
                  height: '200px',
                  background: 'linear-gradient(135deg, var(--ifm-color-primary-light), var(--ifm-color-primary))',
                  borderRadius: '50%',
                  opacity: 0.1,
                  filter: 'blur(40px)'
                }} />

                <ol style={{
                  textAlign: 'left',
                  fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                  lineHeight: '2',
                  paddingLeft: 'clamp(1.5rem, 3vw, 2.5rem)',
                  margin: 0,
                  counterReset: 'chapter',
                  listStyleType: 'none'
                }}>
                  {[
                    { title: 'Introduction', desc: 'Physical AI and embodied intelligence concepts' },
                    { title: 'ROS 2 Fundamentals', desc: 'Nodes, topics, services, URDF, rclpy' },
                    { title: 'Simulation', desc: 'Gazebo, Unity, NVIDIA Isaac environments' },
                    { title: 'NVIDIA Isaac', desc: 'Isaac Sim, Isaac ROS, Nav2' },
                    { title: 'VLA Models', desc: 'Vision-Language-Action for robotics' },
                    { title: 'Humanoid Kinematics', desc: 'Locomotion, balance, manipulation' },
                    { title: 'Conversational Robotics', desc: 'Voice interfaces and natural language' },
                    { title: 'Capstone', desc: 'Autonomous humanoid project implementation' }
                  ].map((item, idx) => (
                    <li
                      key={idx}
                      style={{
                        marginBottom: '1.75rem',
                        paddingLeft: '1rem',
                        position: 'relative',
                        counterIncrement: 'chapter',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(8px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <span style={{
                        fontWeight: '700',
                        color: 'var(--ifm-color-primary)',
                        marginRight: '0.5rem'
                      }}>
                        {item.title}:
                      </span>
                      <span style={{
                        color: 'var(--ifm-color-emphasis-800)'
                      }}>
                        {item.desc}
                      </span>

                      {/* Chapter number badge */}
                      <div style={{
                        position: 'absolute',
                        left: '-2.5rem',
                        top: '0.25rem',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--ifm-color-primary-light), var(--ifm-color-primary))',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}>
                        {idx + 1}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why This Book Section - Premium Design */}
      <div style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        padding: '6rem 0',
        background: 'var(--ifm-background-color)',
        position: 'relative'
      }}>
        <div className="container">
          <div className="text--center" style={{ marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '800',
              marginBottom: '1rem',
              color: 'var(--ifm-heading-color)',
              letterSpacing: '-0.02em'
            }}>
              Why Humanoid Robotics?
            </h2>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--ifm-color-emphasis-700)',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.7'
            }}>
              Build the future with cutting-edge robotics expertise
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {[
              {
                icon: '🏥',
                title: 'Real-World Applications',
                desc: 'Learn how humanoid robots are revolutionizing healthcare, manufacturing, and service industries',
                color: '#667eea'
              },
              {
                icon: '🔬',
                title: 'Technical Depth',
                desc: 'Gain comprehensive understanding of complex robotics concepts with hands-on implementations',
                color: '#f093fb'
              },
              {
                icon: '⚡',
                title: 'Future-Ready Skills',
                desc: 'Master cutting-edge robotics technologies and AI integration for tomorrow\'s challenges',
                color: '#4facfe'
              }
            ].map((benefit, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  background: 'var(--ifm-background-surface-color)',
                  borderRadius: '28px',
                  padding: '3rem 2rem',
                  border: '1px solid var(--ifm-color-emphasis-200)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
                  setHoveredFeature(idx);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.08)';
                  setHoveredFeature(null);
                }}
              >
                {/* Background gradient effect */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(135deg, ${benefit.color}15, ${benefit.color}05)`,
                  opacity: hoveredFeature === idx ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                  zIndex: 0
                }} />

                {/* Icon */}
                <div style={{
                  fontSize: '3.5rem',
                  marginBottom: '1.5rem',
                  transition: 'all 0.4s ease',
                  transform: hoveredFeature === idx ? 'scale(1.1) rotateY(15deg)' : 'scale(1) rotateY(0deg)',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {benefit.icon}
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  color: 'var(--ifm-heading-color)',
                  letterSpacing: '-0.01em',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {benefit.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.7',
                  color: 'var(--ifm-color-emphasis-700)',
                  margin: 0,
                  position: 'relative',
                  zIndex: 1
                }}>
                  {benefit.desc}
                </p>

                {/* Decorative element */}
                <div style={{
                  position: 'absolute',
                  bottom: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: benefit.color,
                  borderRadius: '50%',
                  opacity: 0.05,
                  transition: 'all 0.4s ease',
                  transform: hoveredFeature === idx ? 'scale(1.5)' : 'scale(1)',
                  zIndex: 0
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA - Premium Design */}
      <div style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        padding: '6rem 0',
        background: 'linear-gradient(135deg, var(--ifm-color-primary-darker) 0%, var(--ifm-color-primary) 50%, var(--ifm-color-primary-light) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '50px 50px',
          zIndex: 0
        }} />

        {/* Gradient orbs */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text--center">
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
              padding: 'clamp(2.5rem, 5vw, 4rem)',
              borderRadius: '32px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 30px 90px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Inner glow */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                zIndex: 0
              }} />

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: '800',
                  marginBottom: '1.5rem',
                  color: 'white',
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  letterSpacing: '-0.02em'
                }}>
                  Start Your Robotics Journey
                </h2>

                <p style={{
                  fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                  marginBottom: '3rem',
                  color: 'rgba(255, 255, 255, 0.95)',
                  lineHeight: '1.7',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                  maxWidth: '600px',
                  margin: '0 auto 3rem'
                }}>
                  Transform from beginner to expert with our comprehensive guide to humanoid robotics
                </p>

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <Link
                    to="/docs/introduction"
                    style={{
                      display: 'inline-block',
                      background: 'white',
                      color: 'var(--ifm-color-primary)',
                      padding: '1.25rem 3rem',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      borderRadius: '50px',
                      border: 'none',
                      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      textDecoration: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
                    }}
                  >
                    Begin Learning Now
                  </Link>
                </div>

                {/* Trust indicators */}
                <div style={{
                  marginTop: '3rem',
                  display: 'flex',
                  gap: '2.5rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}>
                  {[
                    { icon: '📚', text: '8 Chapters' },
                    { icon: '💻', text: 'Hands-on Projects' },
                    { icon: '🎓', text: 'Expert-Level Content' }
                  ].map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
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
        </div>
      </div>
    </div>
  );
}