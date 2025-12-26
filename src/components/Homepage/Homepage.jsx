import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import HeroSection from './Hero';

export default function Homepage() {
  const [hoveredCard, setHoveredCard] = useState(null);

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
      index: 0
    },
    {
      title: '🔧 ROS 2',
      description: 'Master nodes, topics, services, URDF, and rclpy for robust robotic applications',
      index: 1
    },
    {
      title: '🎮 Simulation',
      description: 'Work with Gazebo, Unity, and NVIDIA Isaac for advanced robot simulation',
      index: 2
    },
    {
      title: '🚀 Advanced Control',
      description: 'Implement humanoid kinematics, locomotion, and intelligent control systems',
      index: 3
    }
  ];

  return (
    <div className="homepage">
      {/* Hero Section with Animated Background */}
      <HeroSection />

      {/* Feature Cards Section - Premium Design */}
      <div style={{width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', padding: '4rem 0'}} className="section-dark">
        <div className="container">
          <div className="row" style={{gap: '1.5rem', justifyContent: 'center'}}>
            {featureCards.slice(0, 3).map((card, index) => (
              <div className="col col--3" style={{minWidth: '300px'}} key={index}>
                <div
                  className="card card--full-height"
                  style={{
                    transition: 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 0.3s ease',
                    transform: hoveredCard === index ? 'translateY(-8px)' : 'translateY(0)',
                    cursor: 'pointer',
                    minHeight: '200px'
                  }}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="card__header">
                    <h3 style={{fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem'}}>{card.title}</h3>
                  </div>
                  <div className="card__body">
                    <p style={{fontSize: '1rem', lineHeight: '1.6', margin: 0}}>{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Book Structure Preview - Premium Design */}
      <div style={{width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', padding: '4rem 0'}} className="section-light">
        <div className="container">
          <div className="text--center padding-bottom--lg">
            <h2 className="hero__title" style={{fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem'}}>Learning Path</h2>
            <p style={{fontSize: '1.25rem', maxWidth: '60%', margin: '0 auto', lineHeight: '1.7'}}>A structured approach from fundamentals to advanced implementations</p>
          </div>

          <div className="row">
            <div className="col col--8 col--offset-2">
              <div className="card" style={{borderRadius: '2rem', padding: '3rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', minHeight: '500px'}}>
                <ol style={{textAlign: 'left', fontSize: '1.1rem', lineHeight: '2', paddingLeft: '2rem', margin: 0}}>
                  <li style={{marginBottom: '1rem'}}><strong>Introduction:</strong> Physical AI and embodied intelligence concepts</li>
                  <li style={{marginBottom: '1rem'}}><strong>ROS 2 Fundamentals:</strong> Nodes, topics, services, URDF, rclpy</li>
                  <li style={{marginBottom: '1rem'}}><strong>Simulation:</strong> Gazebo, Unity, NVIDIA Isaac environments</li>
                  <li style={{marginBottom: '1rem'}}><strong>NVIDIA Isaac:</strong> Isaac Sim, Isaac ROS, Nav2</li>
                  <li style={{marginBottom: '1rem'}}><strong>VLA Models:</strong> Vision-Language-Action for robotics</li>
                  <li style={{marginBottom: '1rem'}}><strong>Humanoid Kinematics:</strong> Locomotion, balance, manipulation</li>
                  <li style={{marginBottom: '1rem'}}><strong>Conversational Robotics:</strong> Voice interfaces and natural language</li>
                  <li style={{marginBottom: '1rem'}}><strong>Capstone:</strong> Autonomous humanoid project implementation</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why This Book Section - Premium Design */}
      <div style={{width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', padding: '4rem 0'}} className="section-light">
        <div className="container">
          <div className="row">
            <div className="col col--8 col--offset-2">
              <div className="text--center padding-bottom--lg">
                <h2 className="hero__title" style={{fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', color: 'inherit'}}>Why Humanoid Robotics?</h2>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem'}}>
                <div className="card" style={{padding: '2rem', borderRadius: '2rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', minHeight: '200px', transition: 'transform 0.3s ease'}}>
                  <h3 style={{marginBottom: '1rem', color: 'var(--ifm-color-primary)', fontWeight: '600', fontSize: '1.5rem'}}>Real-World Applications</h3>
                  <p style={{margin: 0, lineHeight: '1.7', color: 'var(--ifm-color-emphasis-700)'}}>Learn how humanoid robots are used in healthcare, manufacturing, and service industries</p>
                </div>

                <div className="card" style={{padding: '2rem', borderRadius: '2rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', minHeight: '200px', transition: 'transform 0.3s ease'}}>
                  <h3 style={{marginBottom: '1rem', color: 'var(--ifm-color-primary)', fontWeight: '600', fontSize: '1.5rem'}}>Technical Depth</h3>
                  <p style={{margin: 0, lineHeight: '1.7', color: 'var(--ifm-color-emphasis-700)'}}>Gain deep understanding of complex robotics concepts with practical implementations</p>
                </div>

                <div className="card" style={{padding: '2rem', borderRadius: '2rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', minHeight: '200px', transition: 'transform 0.3s ease'}}>
                  <h3 style={{marginBottom: '1rem', color: 'var(--ifm-color-primary)', fontWeight: '600', fontSize: '1.5rem'}}>Future-Ready Skills</h3>
                  <p style={{margin: 0, lineHeight: '1.7', color: 'var(--ifm-color-emphasis-700)'}}>Develop expertise in cutting-edge robotics technologies and AI integration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA - Premium Design */}
      <div style={{width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', padding: '4rem 0'}} className="section-dark">
        <div className="container">
          <div className="text--center">
            <div className="card" style={{maxWidth: '60%', margin: '0 auto', padding: '3rem', borderRadius: '2rem', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
              <h2 className="hero__title" style={{marginBottom: '1.5rem', fontWeight: 700, fontSize: '2rem'}}>Start Your Robotics Journey</h2>
              <p style={{marginBottom: '2rem', fontSize: '1.25rem', lineHeight: '1.7'}}>Begin with the fundamentals and progress to advanced implementations</p>
              <Link
                className="button button--primary button--lg"
                to="/docs/introduction"
                style={{fontSize: '1.25rem', padding: '1rem 2rem', borderRadius: '1.5rem'}}>
                Begin Reading
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}