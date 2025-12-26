// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Module 1 - Introduction to Physical AI',
      items: [
        'module-1-introduction-physical-ai/index',
        'module-1-introduction-physical-ai/foundations-physical-ai',
        'module-1-introduction-physical-ai/embodied-cognition-robotics',
        'module-1-introduction-physical-ai/humanoid-robotics-landscape',
      ],
      link: {
        type: 'generated-index',
        description: 'Understanding Physical AI, embodied intelligence, and humanoid robotics landscape',
      },
    },
    {
      type: 'category',
      label: 'Module 2 - ROS 2 Fundamentals',
      items: [
        'module-2-ros2-fundamentals/index',
        'module-2-ros2-fundamentals/ros2-architecture-concepts',
        'module-2-ros2-fundamentals/urdf-robot-modeling',
        'module-2-ros2-fundamentals/rclpy-python-robotics',
        'module-2-ros2-fundamentals/advanced-ros2-patterns',
      ],
      link: {
        type: 'generated-index',
        description: 'Nodes, topics, services, URDF, and rclpy for humanoid robotics',
      },
    },
    {
      type: 'category',
      label: 'Module 3 - Simulation Environments',
      items: [
        'module-3-simulation-environments/index',
        'module-3-simulation-environments/gazebo-simulation-humanoids',
        'module-3-simulation-environments/unity-robotics-hub',
        'module-3-simulation-environments/nvidia-isaac-sim',
        'module-3-simulation-environments/simulation-to-real-transfer',
      ],
      link: {
        type: 'generated-index',
        description: 'Physics-based simulation with Gazebo, Unity, and NVIDIA Isaac for humanoid robotics',
      },
    },
    {
      type: 'category',
      label: 'Module 4 - NVIDIA Isaac Platform',
      items: [
        'module-4-nvidia-isaac/index',
        'module-4-nvidia-isaac/isaac-sim-fundamentals',
        'module-4-nvidia-isaac/isaac-ros-integration',
        'module-4-nvidia-isaac/nav2-navigation-system',
        'module-4-nvidia-isaac/isaac-extensions-tools',
      ],
      link: {
        type: 'generated-index',
        description: 'Isaac Sim, Isaac ROS, and Nav2 for humanoid robotics applications',
      },
    },
    'guidelines', // Add the guidelines document to the sidebar
  ],
};

module.exports = sidebars;