/**
 * Docusaurus plugin for Humanoid Robotics Book Chatbot
 * Provides seamless integration of the RAG chatbot widget into Docusaurus pages
 */

module.exports = function (context, options) {
  return {
    name: 'docusaurus-plugin-humanoid-chatbot',

    // Inject the chat widget component into the Docusaurus layout
    injectHtmlTags() {
      return {
        postBodyTags: [
          // Add a container for the chat widget to mount to
          {
            tagName: 'div',
            attributes: {
              id: 'humanoid-chatbot-container',
              style: 'position: fixed; bottom: 20px; right: 20px; z-index: 1000;',
            },
          },
          // Load the chat widget script
          {
            tagName: 'script',
            attributes: {
              src: '/js/chatbot-widget.js', // This would be built separately
              async: true,
              defer: true,
            },
          },
        ],
      };
    },

    // Add necessary CSS
    getThemePath() {
      return './src/theme';
    },

    // Extend the default Docusaurus configuration
    configureWebpack(config, isServer, utils) {
      // Add any necessary webpack configuration for the plugin
      return {};
    },
  };
};

// Export a function to initialize the plugin
module.exports.validateOptions = ({ validate, options }) => {
  // Define and validate plugin options
  const validatedOptions = validate(
    {
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          default: true,
        },
        apiBaseUrl: {
          type: 'string',
          default: 'http://localhost:8000',
        },
        defaultMode: {
          type: 'string',
          enum: ['global', 'local'],
          default: 'global',
        },
      },
      additionalProperties: false,
    },
    options
  );

  return validatedOptions;
};