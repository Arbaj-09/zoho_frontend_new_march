// src/lib/auth.js
export function getLoggedInUser() {
  // Simple example: read user from localStorage
  // Adapt to your auth storage strategy
  try {
    const s = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}
