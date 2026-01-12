// Independent auth utility - no imports from other modules
export function getLoggedInUser() {
  // Simple example: read user from localStorage
  // Adapt to your auth storage strategy
  try {
    if (typeof window === 'undefined') return null;
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}
