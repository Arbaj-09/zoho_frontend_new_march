// Auth service - PROPER AUTHENTICATION ENABLED
export const authService = {
  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("jwt_token");
  },

  getUserRole() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("user_role");
  },

  isAuthenticated() {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("jwt_token");
  },

  logout() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_data");
  },

  login() {
    // Login is handled by login page
    return Promise.resolve({ success: true });
  }
};
