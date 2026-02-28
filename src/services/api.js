export function createApiClient({ baseUrl = "" } = {}) {

  async function request(path, { method = "GET", body, customHeaders = {} } = {}) {
    // Get auth token and user data from localStorage
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");
    const user = localStorage.getItem("user");
    const userRole = localStorage.getItem("user_role");
    
    // 🔥 GET USER INFO FOR DEPARTMENT ISOLATION
    const parsedUser = userData ? JSON.parse(userData) : (user ? JSON.parse(user) : null);
    const userId = parsedUser?.id || null;
    const userDepartment = parsedUser?.department || parsedUser?.departmentName || null;

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...customHeaders
    };

    // Add auth token if available
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // 🔥 ADD USER CONTEXT HEADERS FOR ALL CRM ENDPOINTS
    if (path.includes('/deals') || path.includes('/tasks') || path.includes('/clients') || path.includes('/activities') || path.includes('/notes')) {
      if (userId) headers["X-User-Id"] = userId?.toString();
      if (userRole) headers["X-User-Role"] = userRole;
      if (userDepartment) headers["X-User-Department"] = userDepartment;
    }

    // Add role-based headers for admin endpoints
    if (path.includes('/tasks') && !path.includes('/employee/')) {
      // 🔥 Allow ADMIN, MANAGER, and TL roles to access tasks
      if (!['ADMIN', 'MANAGER', 'TL'].includes(userRole)) {
        console.log('🔍 API Access check - userRole:', userRole, 'path:', path);
        throw new Error('Access denied: Admin, Manager, or TL role required');
      }
    }

    // Add user ID filter for sub-admins
    if (path.includes('/tasks') && userRole === 'SUBADMIN' && userId) {
      // Modify URL to include createdBy filter for sub-admins
      const separator = path.includes('?') ? '&' : '?';
      path = `${path}${separator}createdBy=${userId}`;
    }

    const res = await fetch(baseUrl + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', res.status, errorText);
      throw new Error(errorText || `HTTP ${res.status}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  return {
    get: (p) => request(p),
    post: (p, b) => request(p, { method: "POST", body: b }),
    put: (p, b) => request(p, { method: "PUT", body: b }),
    delete: (p) => request(p, { method: "DELETE" }),
  };
}

export const backendApi = createApiClient({
  baseUrl: "http://localhost:8080/api",
});

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
