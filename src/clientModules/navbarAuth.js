// Check if we're in the browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Function to render the navbar auth component
  async function renderNavbarAuth() {
    // Dynamically import React and ReactDOM
    const [{ createRoot }, ReactModule, { AuthProvider }, { default: NavbarAuth }] = await Promise.all([
      import('react-dom/client'),
      import('react'),
      import('../contexts/AuthContext'),
      import('../components/NavbarAuth')
    ]);

    const { createElement } = ReactModule;
    const container = document.getElementById('navbar-auth-container');
    if (container) {
      const root = createRoot(container);
      root.render(
        createElement(AuthProvider, null,
          createElement(NavbarAuth)
        )
      );
    }
  }

  // Wait for the DOM to be ready before rendering
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderNavbarAuth);
  } else {
    // DOM is already ready, so run immediately
    renderNavbarAuth();
  }

  // For SPA navigation in Docusaurus
  window.addEventListener('load', () => {
    // Watch for URL changes and re-render if needed
    const renderIfContainerExists = async () => {
      if (document.getElementById('navbar-auth-container')) {
        await renderNavbarAuth();
      }
    };

    // Handle Docusaurus client-side navigation
    document.addEventListener('pjax:beforeReplace', renderIfContainerExists);
  });
}