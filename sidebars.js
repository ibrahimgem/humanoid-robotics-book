// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Introduction',
      items: [
        'introduction/index',
        'introduction/physical-ai',
      ],
      link: {
        type: 'generated-index',
        description: 'Getting started with humanoid robotics concepts',
      },
    },
    {
      type: 'category',
      label: 'ROS 2',
      items: [
        'ros2/index',
        'ros2/nodes-topics-services',
        'ros2/urdf',
        'ros2/rclpy-examples',
      ],
      link: {
        type: 'generated-index',
        description: 'Robot Operating System 2 concepts and architecture',
      },
    },
    'guidelines', // Add the guidelines document to the sidebar
  ],
};

module.exports = sidebars;