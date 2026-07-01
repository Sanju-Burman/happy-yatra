/**
 * NavigationService
 *
 * A singleton that holds a reference to React Router's `navigate` function.
 * This allows non-React modules (e.g. the Axios interceptor in api.jsx) to
 * trigger client-side navigation without resorting to `window.location.href`,
 * which bypasses the router and produces "Page Not Found" errors.
 *
 * Usage:
 *   // In your root component (App.jsx), once:
 *   NavigationService.setNavigate(navigate);
 *
 *   // Anywhere else (e.g. api.jsx interceptor):
 *   NavigationService.navigate('/login');
 */

const NavigationService = (() => {
  let _navigate = null;

  return {
    /**
     * Register the React Router navigate function.
     * Call this once from the root component after the router is mounted.
     * @param {Function} navigateFn - The `navigate` function from `useNavigate()`
     */
    setNavigate(navigateFn) {
      _navigate = navigateFn;
    },

    /**
     * Navigate to a path using React Router.
     * Falls back to `window.location.href` only if the router is not yet
     * registered (e.g. during very early startup before the root mounts).
     * @param {string} path - The target route path
     * @param {object} [options] - Optional React Router navigate options
     */
    navigate(path, options = {}) {
      if (_navigate) {
        _navigate(path, options);
      } else {
        // Fallback: router not yet registered. This should only happen in
        // edge cases during very early startup.
        window.location.href = path;
      }
    },
  };
})();

export default NavigationService;
