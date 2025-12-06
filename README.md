# Humanoid Robotics Book

A comprehensive Docusaurus-based book that teaches Physical AI & Humanoid Robotics, covering ROS 2, Gazebo, Unity, NVIDIA Isaac, VLA, and humanoid development.

## Project Overview

This documentation site provides a structured learning path for humanoid robotics, from basic concepts to advanced topics including:
- Physical AI and embodied intelligence
- ROS 2 (nodes, topics, services, URDF, rclpy)
- Simulation environments (Gazebo, Unity, Isaac Sim)
- NVIDIA Isaac ecosystem
- Vision-Language-Action (VLA) models
- Humanoid kinematics and control
- Conversational robotics
- Capstone project: Autonomous Humanoid (Voice → Plan → Act)

## Live Site

The book is deployed and accessible at: **https://ibrahimgem.github.io/humanoid-robotics-book/**

## Setup Instructions

1. Make sure you have Node.js 18+ installed
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Open [http://localhost:3000](http://localhost:3000) to view the site

## Building and Deployment

- Build for production: `npm run build`
- Serve production build locally: `npm run serve`
- Deploy to GitHub Pages: `GIT_USER=ibrahimgem npm run deploy`

## Content Structure

The book is organized into progressive chapters:

- **Introduction**: Physical AI, embodied intelligence concepts
- **ROS 2**: Core ROS 2 architecture, nodes, topics, services, URDF, rclpy
- **Simulation**: Gazebo and Unity simulation environments
- **NVIDIA Isaac**: Isaac Sim, Isaac ROS, Nav2
- **VLA**: Vision-Language-Action models for robotics
- **Humanoid Kinematics**: Locomotion, balance, manipulation
- **Conversational Robotics**: Voice interfaces and natural language
- **Capstone**: Autonomous humanoid project

## Technical Standards

- Format: MDX with React components
- Citation style: IEEE
- Chapter length: 1,000-2,000 words
- Architecture: Docusaurus Classic preset
- Deployment: GitHub Pages

## Contributing

1. Create or edit MDX files in the `docs/` directory
2. Update `sidebars.js` to include new pages in the navigation
3. Follow IEEE citation format for all technical claims
4. Maintain 1000-2000 words per chapter as specified in the constitution

## Project Structure

```
docs/                    # Documentation content
├── introduction/        # Introduction to Physical AI
├── ros2/               # ROS 2 concepts and examples
├── gazebo-unity/       # Simulation environments
├── isaac/              # NVIDIA Isaac ecosystem
├── vla/                # Vision-Language-Action models
├── humanoid-kinematics/ # Locomotion, balance, manipulation
├── conversational-robotics/ # Voice interfaces
└── capstone/           # Autonomous humanoid project
```